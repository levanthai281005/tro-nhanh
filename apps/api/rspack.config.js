import { spawn } from 'node:child_process';
import { builtinModules } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodeExternals from 'webpack-node-externals';

/**
 * Bundle `apps/api` thành một file ESM chạy bằng Node.
 *
 * **Vì sao bundle:** các package `@tronhanh/*` export thẳng mã TypeScript
 * (`main: ./src/index.ts`). Next và Metro tự biên dịch được, Node thì không — nên chúng phải
 * được gói vào bundle. Mọi thư viện khác để ngoài, Node nạp lúc chạy.
 *
 * **Vì sao không dùng `nest build`:** Nest CLI 12 cần Node ≥ 22.22.3 ngay cả để build (nó nạp
 * `@angular-devkit` rồi `require()` một gói ESM trong vòng lặp), còn repo ghim Node 22.14.0.
 * Cấu hình dưới đây là phần cần thiết của cấu hình Rspack mà Nest CLI tự dựng.
 */
const apiRoot = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(apiRoot, 'dist');
const outputFile = 'main.js';

/** Module có sẵn của Node (`fs`, `node:path`…) nạp bằng `import`, không gói vào bundle. */
const nodeBuiltins = ({ request }, callback) => {
  const bareRequest = request?.startsWith('node:') ? request.slice('node:'.length) : request;

  if (bareRequest && builtinModules.includes(bareRequest)) {
    return callback(null, `module ${request}`);
  }

  return callback();
};

/**
 * Chế độ `dev`: build xong thì chạy lại server. Đợi tiến trình cũ thoát hẳn rồi mới chạy tiến
 * trình mới — chạy chồng thì tiến trình mới đụng cổng 8089 còn đang bị giữ.
 */
class RestartServerPlugin {
  apply(compiler) {
    let server = null;

    const start = () => {
      server = spawn(process.execPath, ['--enable-source-maps', path.join(outputDir, outputFile)], {
        cwd: apiRoot,
        stdio: 'inherit',
      });
    };

    compiler.hooks.done.tap('RestartServerPlugin', (stats) => {
      if (stats.hasErrors()) return;

      if (server && server.exitCode === null) {
        server.once('exit', start);
        server.kill();
      } else {
        start();
      }
    });

    process.once('exit', () => server?.kill());
  }
}

export default (env = {}) => ({
  mode: env.dev ? 'development' : 'none',
  target: 'node',
  entry: './src/main.ts',
  devtool: 'source-map',
  output: {
    path: outputDir,
    filename: outputFile,
    module: true,
    chunkFormat: 'module',
    chunkLoading: 'import',
    library: { type: 'module' },
    clean: true,
  },
  externals: [nodeExternals({ importType: 'module', allowlist: [/^@tronhanh\//] }), nodeBuiltins],
  externalsPresets: { node: false },
  resolve: {
    extensions: ['.ts', '.js'],
    tsConfig: path.join(apiRoot, 'tsconfig.json'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        type: 'javascript/esm',
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: { syntax: 'typescript', decorators: true },
            // Nest đọc kiểu tham số constructor qua decorator metadata để biết inject gì.
            transform: { legacyDecorator: true, decoratorMetadata: true },
            target: 'es2022',
          },
        },
      },
    ],
  },
  optimization: {
    // Giữ nguyên tên class: Nest dùng chúng trong log và thông báo lỗi DI.
    minimize: false,
    nodeEnv: false,
  },
  node: { __dirname: false, __filename: false },
  // Trong container, thư mục mount từ Windows không phát sự kiện đổi file — phải dò định kỳ.
  // `compose.yaml` bật cờ này cho mọi service dev.
  watchOptions: process.env.WATCHPACK_POLLING === 'true' ? { poll: 1000 } : undefined,
  plugins: env.dev ? [new RestartServerPlugin()] : [],
});
