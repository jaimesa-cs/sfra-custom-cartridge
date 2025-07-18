module.exports = {
  env: {
    es6: true,
    browser: true,
    commonjs: true,
  },
  parserOptions: {
    ecmaVersion: 5,
  },
  rules: {
    'no-template-curly-in-string': 'error',
    'no-unexpected-multiline': 'error',
    quotes: ['error', 'single'],
    'no-multi-str': 'error',
    'prefer-template': 'off',
    'template-curly-spacing': 'off',
    'no-trailing-spaces': 'off',
  },
};
