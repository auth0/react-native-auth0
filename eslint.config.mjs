import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: fixupConfigRules(compat.extends('@react-native', 'prettier')),
    plugins: { prettier },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'prettier/prettier': [
        'error',
        {
          quoteProps: 'consistent',
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
          useTabs: false,
        },
      ],
    },
  },
  // TypeScript-specific configuration for type-checked rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/__tests__/**', '**/__mocks__/**', '**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Enable unbound-method rule to catch interface typing issues
      // This helps ensure methods in interfaces use arrow function syntax
      // instead of method syntax when they don't use 'this'
      '@typescript-eslint/unbound-method': 'error',
    },
  },
  {
    ignores: ['node_modules/', 'lib/', 'docs'],
  },
]);
