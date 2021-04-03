'use strict';

const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');

const SRC_PATH = path.join(__dirname, '../packages/glimmer-apollo');
const OUTPUT_PATH = path.join(__dirname, '../packages/glimmer-apollo/build');

function babelBuild(srcPath, options = {}) {
  options.comments = false;

  return babel.transformFileSync(srcPath, {
    configFile: path.join(__dirname, './babel.config'),
    ...options
  }).code;
}

function buildFile(srcPath) {
  const fullPath = path.join(SRC_PATH, srcPath);

  writeFile(
    path.join(OUTPUT_PATH, 'commonjs', srcPath),
    babelBuild(fullPath, { envName: 'cjs' })
  );
  writeFile(
    path.join(OUTPUT_PATH, 'modules', srcPath),
    babelBuild(fullPath, { envName: 'mjs' })
  );
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath.replace(/\.ts$/, '.js'), content);
}
if (require.main === module) {
  fs.mkdirSync(OUTPUT_PATH);

  const srcFiles = glob.sync('./(addon|app)/**/*.{js,ts}', { cwd: SRC_PATH });
  srcFiles.map(buildFile);
}
