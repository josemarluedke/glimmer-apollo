/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Addon } from '@embroider/addon-dev/rollup';
import ts from 'rollup-plugin-ts';
import walkSync from 'walk-sync';
import { join } from 'path';

// https://github.com/embroider-build/embroider/blob/main/packages/addon-dev/src/rollup-public-entrypoints.ts
function publicEntrypoints(args) {
  return {
    name: 'addon-modules',
    buildStart() {
      for (let name of walkSync(args.srcDir, {
        globs: args.include
      })) {
        this.emitFile({
          type: 'chunk',
          id: join(args.srcDir, name),
          fileName: name.replace('.ts', '.js')
        });
      }
    }
  };
}

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist'
});

export default {
  // This provides defaults that work well alongside `publicEntrypoints` below.
  // You can augment this if you need to.
  output: addon.output(),

  plugins: [
    // These are the modules that users should be able to import from your
    // addon. Anything not listed here may get optimized away.
    publicEntrypoints({
      srcDir: 'src',
      include: ['*.ts']
    }),

    ts({
      transpiler: 'babel',
      browserslist: false,
      tsconfig: {
        fileName: 'tsconfig.json',
        hook: (resolvedConfig) => ({ ...resolvedConfig, declaration: true })
      }
    }),

    // Follow the V2 Addon rules about dependencies. Your code can import from
    // `dependencies` and `peerDependencies` as well as standard Ember-provided
    // package names.
    addon.dependencies(),

    // addon.keepAssets(['ember-initializer.js']),

    // Remove leftover build artifacts when starting a new build.
    addon.clean()
  ]
};
