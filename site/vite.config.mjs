import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import docfy from '@docfy/ember-vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import { createHighlighterCoreSync } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import remarkCodeTitles from 'remark-code-titles';
import rehypeEscapeCurlies from './rehype-escape-curlies.mjs';

// Import languages
import bash from 'shiki/langs/bash.mjs';
import json from 'shiki/langs/json.mjs';
import graphql from 'shiki/langs/graphql.mjs';
import handlebars from 'shiki/langs/handlebars.mjs';

// Import GTS/GJS which include their dependencies (typescript, javascript, css, html)
// Using the package exports path (not dist/)
import gts from '@shikijs/langs/glimmer-ts';
import gjs from '@shikijs/langs/glimmer-js';

// Import theme
import githubDark from 'shiki/themes/github-dark.mjs';

// Create synchronous highlighter
const highlighter = createHighlighterCoreSync({
  themes: [githubDark],
  langs: [
    ...gts,  // includes typescript, css, javascript, html + glimmer-ts
    ...gjs,  // includes javascript, css, html + glimmer-js
    bash,
    json,
    graphql,
    handlebars,
  ],
  langAlias: {
    hbs: 'handlebars',
    glimmer: 'handlebars',
  },
  engine: createJavaScriptRegexEngine(),
});

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
      remarkPlugins: [remarkCodeTitles],
      rehypePlugins: [
        [
          rehypeShikiFromHighlighter,
          highlighter,
          {
            theme: 'github-dark',
            fallbackLanguage: 'handlebars',
          },
        ],
        rehypeEscapeCurlies,
      ],
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
