'use strict';

const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');

const DIST_PATH = path.join(__dirname, '../packages/glimmer-apollo/build');
const SRC_PATH = path.join(__dirname, '../packages/glimmer-apollo');

function babelBuild(srcPath, options = {}) {
  options.comments = false;

  return babel.transformFileSync(srcPath, {
    configFile: path.join(__dirname, './babel.config'),
    ...options
  }).code;
}

if (require.main === module) {
  fs.mkdirSync(DIST_PATH);

  const srcFiles = fg.sync('./(addon|app)/**/*.{js,ts}', { cwd: SRC_PATH });

  for (const filepath of srcFiles) {
    const srcPath = path.join(SRC_PATH, filepath);
    const destMJSPath = path.join(DIST_PATH, 'modules', filepath);
    const destCJSPath = path.join(DIST_PATH, 'commonjs', filepath);

    const cjs = babelBuild(srcPath, { envName: 'cjs' });
    const mjs = babelBuild(srcPath, { envName: 'mjs' });

    fs.mkdirSync(path.dirname(destMJSPath), { recursive: true });
    fs.mkdirSync(path.dirname(destCJSPath), { recursive: true });
    fs.writeFileSync(destCJSPath.replace(/\.ts$/, '.js'), cjs);
    fs.writeFileSync(destMJSPath.replace(/\.ts$/, '.js'), mjs);
  }
}
