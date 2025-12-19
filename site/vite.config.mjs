import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import docfy from '@docfy/ember-vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import highlight from 'rehype-highlight';
import remarkCodeTitles from 'remark-code-titles';
import remarkEscapeCurlies from './remark-escape-curlies.mjs';

export default defineConfig({
  plugins: [
    // Docfy plugin must run BEFORE ember plugin so templates are available
    docfy({
      root: process.cwd(),
      hmr: true,
      sources: [
        {
          root: path.resolve(import.meta.dirname, '../docs'),
          pattern: '**/*.md',
          urlPrefix: 'docs',
        },
      ],
      repository: {
        url: 'https://github.com/josemarluedke/glimmer-apollo',
        editBranch: 'main',
      },
      tocMaxDepth: 3,
      labels: {
        docs: 'Docs',
        fetching: 'Fetching',
      },
      remarkPlugins: [remarkEscapeCurlies, remarkCodeTitles],
      rehypePlugins: [highlight],
    }),
    tailwindcss(),
    classicEmberSupport(),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
});
