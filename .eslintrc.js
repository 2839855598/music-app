
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'linebreak-style': 0,
    'indent': 0,
    'import/extensions': ['error', 'never'],
    'import/no-unresolved': 0,
    'keyword-spacing': 0,
    'no-underscore-dangle': 0,
    'dot-notation': 0,
    'no-unused-expressions': 0,
    'global-require': 0,
    'no-param-reassign': 0,
    'no-plusplus': 0,
    'object-curly-newline': 0,
    'consistent-return': 0,
    'vue/return-in-computed-property': 0,
    'no-restricted-syntax': 0,
    'import/prefer-default-export': 0,
    'prefer-template': 0,
    'no-nested-ternary': 0,
    'class-methods-use-this': 0,
    'no-useless-return': 0,
    'no-lonely-if': 0,
    'camelcase': 0,
    'guard-for-in': 0,
},
  parserOptions: {
    parser: 'babel-eslint',
  },
};
