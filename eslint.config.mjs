import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  {
    ignores: [
      '.node_modules/*',
      '.dist/*',
      '.git/*',
      '.vscode/*',
      '.github/*',
      '.husky/*',
      '.eslintrc.*',
      '.prettierrc.*',
      '.editorconfig',
      '.gitignore',
      '.npmignore',
      '.yarnrc',
      '.yarn/*',
      '.vscode/*',
      '.github/*',
      '.husky/*',
      '.eslint',
    ],
  },

  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      eqeqeq: 'warn',
      'no-unused-vars': 'warn',
      'prefer-const': ['error', { ignoreReadBeforeAssign: true }],
    },
  },
  eslintPluginPrettierRecommended,
];
