import eslint from '@eslint/js';
import tailwindcss from 'eslint-plugin-tailwindcss';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const repositoryRoot = fileURLToPath(new URL('.', import.meta.url));

const featureBoundary = (files, forbiddenDomains) => ({
  files,
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: forbiddenDomains.flatMap((domain) => [
          `@/features/${domain}`,
          `@/features/${domain}/**`,
          `**/features/${domain}`,
          `**/features/${domain}/**`,
        ]),
      },
    ],
  },
});

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/.expo/**',
      '**/dist/**',
      '**/.turbo/**',
      'apps/api/src/generated/**',
      '**/nativewind-env.d.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['apps/mobile/src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['apps/**/*.{ts,tsx}', 'packages/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: { tailwindcss },
    settings: {
      tailwindcss: {
        callees: ['cn'],
        config: path.join(repositoryRoot, 'apps/web/tailwind.config.js'),
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'tailwindcss/no-custom-classname': 'error',
    },
  },
  featureBoundary(['apps/*/src/features/marketplace/**/*.{ts,tsx}'], ['workspace', 'residency']),
  featureBoundary(['apps/*/src/features/workspace/**/*.{ts,tsx}'], ['marketplace', 'residency']),
  featureBoundary(['apps/*/src/features/residency/**/*.{ts,tsx}'], ['marketplace', 'workspace']),
  {
    files: ['**/*.{js,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
