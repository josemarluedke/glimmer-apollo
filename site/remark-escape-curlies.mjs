import { visit } from 'unist-util-visit';

/**
 * Custom remark plugin that escapes curly braces in code blocks
 * using HTML entities so Ember's template compiler doesn't parse them.
 */
export default function remarkEscapeCurlies() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      if (node.value) {
        // Replace {{ with HTML entities &#123;&#123;
        node.value = node.value.replace(/\{\{/g, '&#123;&#123;');
        // Replace }} with HTML entities &#125;&#125;
        node.value = node.value.replace(/\}\}/g, '&#125;&#125;');
      }
    });

    visit(tree, 'inlineCode', (node) => {
      if (node.value) {
        node.value = node.value.replace(/\{\{/g, '&#123;&#123;');
        node.value = node.value.replace(/\}\}/g, '&#125;&#125;');
      }
    });
  };
}
