import globals from "globals";
import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import promisePlugin from "eslint-plugin-promise";
import nodePlugin from "eslint-plugin-node";
import jsdoc from 'eslint-plugin-jsdoc';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      import: importPlugin,
      promise: promisePlugin,
      node: nodePlugin,
    },
    rules: {
      'no-unused-vars': ['warn', {
        'varsIgnorePattern': '^_',
        "argsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^ignore|_",
      }],
      'import/no-unresolved': 'error',
      'no-console': ["error", { allow: ["info", "warn", "error"] }],
      'eqeqeq': ['error', 'always'],
      // 'curly': ['warn', 'multi'],
      'prefer-const': 'error',
      'no-var': 'error',
      'array-callback-return': 'error',
      'no-unexpected-multiline': 'warn',
    },
  },
  {
    files: ['src/*js'],
    plugins: {
      jsdoc,
    },
    rules: {
      'jsdoc/require-description': 'warn'
    }
  },
];
