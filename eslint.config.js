import eslint from '@eslint/js';

export default [
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    ...eslint.configs.recommended,
  },
];
