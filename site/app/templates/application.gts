import { pageTitle } from 'ember-page-title';
import { LinkTo } from '@ember/routing';
import DocfyHeader from '../components/docfy-header';
import DocfyJumpTo from '../components/docfy-jump-to';
import VisuallyHidden from '../components/visually-hidden';
import GlimmerApolloLogo from '../components/glimmer-apollo-logo';

<template>
  {{pageTitle "Glimmer Apollo"}}

  <DocfyHeader
    @darkOnly={{true}}
    @githubUrl="https://github.com/josemarluedke/glimmer-apollo"
  >
    <:title>
      <VisuallyHidden>Glimmer Apollo</VisuallyHidden>
      <GlimmerApolloLogo class="h-7" />
    </:title>
    <:left>
      <DocfyJumpTo />
    </:left>

    <:right as |linkClass linkClassActive|>
      <LinkTo
        @route="docs"
        class="{{linkClass}} hidden sm:block"
        @activeClass={{linkClassActive}}
      >
        Docs
      </LinkTo>
    </:right>
  </DocfyHeader>

  {{outlet}}

  <div
    class="mb-20 sm:mb-0 border-t border-gray-300 dark:border-gray-700 p-4 text-center text-sm text-gray-700 dark:text-gray-300"
  >
    Released under MIT License - Created by
    <a
      href="https://github.com/josemarluedke"
      target="_blank"
      rel="noopener noreferrer"
      class="whitespace-nowrap"
    >
      Josemar Luedke
    </a>
  </div>
</template>
