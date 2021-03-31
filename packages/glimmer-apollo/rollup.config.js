import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const babelPlugins = [
  ['@babel/plugin-transform-typescript'],
  ['@babel/plugin-proposal-decorators', { legacy: true }],
  ['@babel/plugin-proposal-class-properties']
];

const extensions = ['.js', '.ts'];

function isExternal(id) {
  return !(id.startsWith('./') || id.startsWith('../') || id.startsWith('/'));
}

const config = {
  input: 'addon/index.ts',
  output: [
    {
      file: '../../dist/index.js',
      sourcemap: true,
      format: 'esm'
    },
    {
      file: '../../dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true
    }
  ],
  external(id) {
    return isExternal(id);
  },
  plugins: [
    babel({
      extensions,
      babelHelpers: 'bundled',
      plugins: babelPlugins
      // exclude: 'node_modules/**',
      // include: ['*/addon/**/*']
    }),
    resolve({ extensions })
  ]
};

export default config;
