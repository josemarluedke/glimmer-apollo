import Component from '@glimmer/component';

interface Signature {
  Blocks: {
    default: [];
  };
  Element: HTMLSpanElement;
}

export default class VisuallyHidden extends Component<Signature> {
  <template>
    <span
      class="sr-only"
      ...attributes
    >
      {{yield}}
    </span>
  </template>
}
