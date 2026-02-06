import { visit } from 'unist-util-visit';

/**
 * A rehype plugin that escapes {{ and }} in code blocks to prevent
 * Ember's template compiler from interpreting them as Handlebars expressions.
 * Uses raw nodes so the entities aren't double-encoded.
 */
export default function rehypeEscapeCurlies() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      // Only process text inside pre elements
      if (node.tagName === 'pre') {
        escapeInNode(node);
      }
    });
  };
}

function escapeInNode(node) {
  if (!node.children) return;

  const newChildren = [];
  for (const child of node.children) {
    if (child.type === 'text' && child.value) {
      // Split text on {{ and }} and create raw nodes for the curlies
      const parts = child.value.split(/(\{\{|\}\})/g);
      for (const part of parts) {
        if (part === '{{') {
          newChildren.push({ type: 'raw', value: '&#123;&#123;' });
        } else if (part === '}}') {
          newChildren.push({ type: 'raw', value: '&#125;&#125;' });
        } else if (part) {
          newChildren.push({ type: 'text', value: part });
        }
      }
    } else {
      // Recurse into element children
      if (child.type === 'element') {
        escapeInNode(child);
      }
      newChildren.push(child);
    }
  }
  node.children = newChildren;
}
