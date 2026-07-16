// backend/eslint.config.js
//
// Lint standard for the backend. The reviewer's point was right: controller,
// migration, and security logic should be checked consistently, not only executed
// in tests. Tests prove behaviour; lint catches the class of bug tests don't —
// unused variables, unreachable code, accidental globals, and the duplicate-key /
// duplicate-declaration mistakes that have already bitten this codebase twice.
//
// Deliberately not strict-for-its-own-sake. It flags real problems and stays out
// of the way on style.
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/**', 'coverage/**'] },

  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,   // tests use describe/it/expect/beforeAll/…
      },
    },
    rules: {
      // Unused vars are dead code or a typo'd reference. Allow leading-underscore
      // args (a common "intentionally ignored" convention) and caps-only
      // constants.
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'none',        // `catch (err) {}` without using err is fine
      }],

      // The two that already caught real bugs here:
      'no-dupe-keys': 'error',        // two queryKey/two properties in one object
      'no-func-assign': 'error',
      'no-redeclare': 'error',        // the duplicate myBranches/addBranch class

      // Genuine footguns.
      'no-unreachable': 'error',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-empty': ['error', { allowEmptyCatch: true }],  // intentional empty catch ok

      // These recommended rules are stricter than this codebase needs. Attaching
      // { cause } to every re-thrown error is a nice-to-have, not a bug — the
      // messages already name the failure. Kept off to avoid noise that trains
      // people to ignore lint.
      'preserve-caught-error': 'off',
      'no-useless-assignment': 'off',

      // Console is how this app logs in a couple of intentional places
      // (the fatal boot guards that must print before the logger exists).
      'no-console': 'off',
    },
  },
];
