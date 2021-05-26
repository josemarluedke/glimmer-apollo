/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import multiInput from 'rollup-plugin-multi-input';
import resolve from '@rollup/plugin-node-resolve';
import ts from '@wessberg/rollup-plugin-ts';

function isExternal(id) {
  return !(id.startsWith('./') || id.startsWith('../') || id.startsWith('/'));
}

const config = {
  input: [
    'src/index.ts',
    'src/environment.ts',
    'src/environment-ember.ts',
    'src/environment-glimmer.ts'
  ],
  preserveModules: true,
  output: [
    {
      dir: './dist/esm',
      sourcemap: true,
      format: 'esm'
    },
    {
      exports: 'auto',
      dir: './dist/cjs',
      format: 'cjs',
      sourcemap: true
    }
  ],
  external(id) {
    return isExternal(id);
  },
  plugins: [
    multiInput({ relative: 'src/' }),
    ts({
      transpiler: 'babel',
      browserslist: false,
      tsconfig: {
        fileName: 'tsconfig.json',
        hook: (resolvedConfig) => ({ ...resolvedConfig, declaration: true })
      }
    }),
    resolve({ extensions: ['.js', '.ts'] })
  ]
};

export default config;
