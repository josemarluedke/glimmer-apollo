'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { Vite } = require('@embroider/vite');
const { compatBuild } = require('@embroider/compat');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {});

  return compatBuild(app, Vite);
};
