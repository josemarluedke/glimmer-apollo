'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const path = require('path');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    'ember-cli-babel': {
      enableTypeScriptTransform: true
    }
  });

  const { Webpack } = require('@embroider/webpack');

  return require('@embroider/compat').compatBuild(app, Webpack, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticInvokables: true,
    skipBabel: [
      {
        package: 'qunit'
      }
    ],
    packagerOptions: {
      webpackConfig: {
        resolve: {
          alias: {
            '@glimmer/tracking/primitives/cache': path.resolve(
              __dirname,
              'node_modules/ember-source/dist/packages/@glimmer/tracking/primitives/cache'
            ),
            '@glimmer/tracking': path.resolve(
              __dirname,
              'node_modules/ember-source/dist/packages/@glimmer/tracking/index'
            )
          }
        }
      }
    }
  });
};
