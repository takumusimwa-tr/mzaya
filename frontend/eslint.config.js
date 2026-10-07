import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: { react },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Retired deliberately. This rule flags the canonical fetch-in-effect
      // pattern (load data, setState when it arrives) that every data hook in
      // this app uses — 18+ hits, all false alarms, each previously silenced
      // with an identical disable comment. A rule that is suppressed at every
      // occurrence teaches people to ignore the linter; the remaining hook
      // rules (exhaustive-deps, rules-of-hooks) still catch the real mistakes.
      'react-hooks/set-state-in-effect': 'off',
      // House style: no em dashes in anything a user can see. Use a period,
      // colon or comma instead. Comments are fine; strings and JSX text are not.
      'no-restricted-syntax': ['error',
        { selector: 'Literal[value=/\\u2014/]', message: 'No em dashes in UI text. Use a period, colon or comma.' },
        { selector: 'JSXText[value=/\\u2014/]', message: 'No em dashes in UI text. Use a period, colon or comma.' },
        { selector: 'TemplateElement[value.raw=/\\u2014/]', message: 'No em dashes in UI text. Use a period, colon or comma.' },
      ],
      // Without this, a component destructured for JSX (e.g. `{ icon: Icon }`
      // then `<Icon />`) reads as "unused" — ESLint core doesn't parse JSX as a
      // variable use. This marks JSX-referenced identifiers as used.
      'react/jsx-uses-vars': 'error',
    },
  },
])
