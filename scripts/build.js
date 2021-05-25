'use strict';

const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');

const SRC_PATH = path.join(__dirname, '../packages/glimmer-apollo');
const OUTPUT_PATH = path.join(__dirname, '../packages/glimmer-apollo/dist');

function babelBuild(srcPath, options = {}) {
  options.comments = false;

  return babel.transformFileSync(srcPath, {
    configFile: path.join(__dirname, './babel.config'),
    ...options
  }).code;
}

function buildFile(srcPath) {
  const fullSrcPath = path.join(SRC_PATH, srcPath);
  const relativePath = srcPath.replace('src/', '');

  writeFile(
    path.join(OUTPUT_PATH, 'commonjs', relativePath),
    babelBuild(fullSrcPath, { envName: 'cjs' })
  );
  writeFile(
    path.join(OUTPUT_PATH, 'modules', relativePath),
    babelBuild(fullSrcPath, { envName: 'mjs' })
  );
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath.replace(/\.ts$/, '.js'), content);
}
if (require.main === module) {
  fs.mkdirSync(OUTPUT_PATH);

  const srcFiles = glob.sync('./src/**/*.{js,ts}', { cwd: SRC_PATH });
  srcFiles.map(buildFile);
}
