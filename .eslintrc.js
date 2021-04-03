const { join } = require('path');

module.exports = {
  root: true,
  parserOptions: {
    project: join(__dirname, './tsconfig.eslint.json')
  },
  plugins: ['@glimmerx'],
  extends: ['@underline/eslint-config-ember-typescript'],
  rules: {
    '@typescript-eslint/no-empty-interface': 'off',
    'ember/no-empty-glimmer-component-classes': 'off',
    '@typescript-eslint/ban-types': ['off', { types: { object: null } }],
    '@glimmerx/template-vars': 'error'
  },
  overrides: [
    {
      files: ['packages/**/tests/**/*.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off'
      }
    },

    // node files
    {
      files: [
        './scripts/**/*.js',
        '.eslintrc.js',
        '.prettierrc.js',
        '.template-lintrc.js',
        '.babelrc.js',
        'testem.js',
        'webpack.config.js',
        'config/**/*.js',
        'packages/*/.ember-cli.js',
        'packages/*/ember-cli-build.js',
        'packages/*/ember-addon-main.js',
        'packages/*/testem.js',
        'packages/*/config/**/*.js',
        'packages/*/tests/dummy/config/**/*.js',
        'packages/**/tailwind.config.js',
        'packages/**/tailwind/*.js',
        'site/ember-cli-build.js',
        'site/testem.js',
        'site/config/**/*.js',
        'site/tests/dummy/config/**/*.js',
        'site/**/tailwind.config.js',
        'site/.docfy-config.js'
      ],
      extends: ['@underline/eslint-config-node'],
      rules: {}
    }
  ]
};
