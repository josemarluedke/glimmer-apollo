import { defaultClientConditions, defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';

export default defineConfig(({ mode }) => ({
  resolve: {
    // `vite build` resolves the production build of ember-source, which strips
    // its debug assertions (e.g. updating tracked state already used in the
    // same render). Tests run against the development build so those fail.
    conditions:
      mode === 'test'
        ? defaultClientConditions.map((condition) =>
            condition === 'development|production' ? 'development' : condition,
          )
        : defaultClientConditions,
  },
  plugins: [
    classicEmberSupport(),
    ember(),
    // extra plugins here
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
}));
