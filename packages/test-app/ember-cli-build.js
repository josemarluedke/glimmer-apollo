'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    autoImport: {
      webpack: {
        externals: {
          react: 'react'
        }
      }
    },
    babel: {
      plugins: [require.resolve('ember-auto-import/babel-plugin')]
    }
  });

  if (process.env.EMBROIDER) {
    const { Webpack } = require('@embroider/webpack');

    return require('@embroider/compat').compatBuild(app, Webpack, {
      staticAddonTestSupportTrees: true,
      staticAddonTrees: true,
      staticHelpers: true,
      staticComponents: true
    });
  }
  return app.toTree();
};
