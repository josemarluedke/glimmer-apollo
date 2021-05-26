import multi from 'rollup-plugin-multi-input';
import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const extensions = ['.js', '.ts'];

function isExternal(id) {
  return !(id.startsWith('./') || id.startsWith('../') || id.startsWith('/'));
}

const baseOptions = {
  external(id) {
    return isExternal(id);
  },
  plugins: [
    multi({ relative: 'src/' }),
    babel({
      extensions,
      babelHelpers: 'bundled'
      // exclude: 'node_modules/**',
      // include: ['*/addon/**/*'],
      // ...require('./babel.config')
    }),
    resolve({ extensions })
  ]
};

const config = [
  {
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

    ...baseOptions
  }
];

export default config;
