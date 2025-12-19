import { modifier } from 'ember-modifier';

interface Heading {
  id: string;
  headings?: Heading[];
}

function getHeadingIds(headings: Heading[], output: string[] = []): string[] {
  if (typeof headings === 'undefined') {
    return [];
  }
  headings.forEach((heading) => {
    output.push(heading.id);
    if (heading.headings) {
      getHeadingIds(heading.headings, output);
    }
  });
  return output;
}

interface ModifierArgs {
  headings: Heading[];
  onIntersect: (headingId: string) => void;
}

const docfyIntersectHeadings = modifier<{
  Element: HTMLElement;
  Args: {
    Named: ModifierArgs;
  };
}>((element, _positional, { headings, onIntersect }) => {
  const headingIds = getHeadingIds(headings);
  let activeIndex: number | null = null;
  let observer: IntersectionObserver | null = null;

  function handleObserver(elements: IntersectionObserverEntry[]): void {
    let localActiveIndex = activeIndex;

    const aboveIndices: number[] = [];
    const belowIndices: number[] = [];

    elements.forEach((entry) => {
      const boundingClientRectY =
        typeof entry.boundingClientRect.y !== 'undefined'
          ? entry.boundingClientRect.y
          : entry.boundingClientRect.top;
      const rootBoundsY = entry.rootBounds
        ? typeof entry.rootBounds.y !== 'undefined'
          ? entry.rootBounds.y
          : entry.rootBounds.top
        : 0;
      const isAbove = boundingClientRectY < rootBoundsY;

      const id = entry.target.getAttribute('id');
      const intersectingElemIdx = headingIds.findIndex((item) => item === id);

      if (isAbove) {
        aboveIndices.push(intersectingElemIdx);
      } else {
        belowIndices.push(intersectingElemIdx);
      }
    });

    const minIndex = Math.min(...belowIndices);
    const maxIndex = Math.max(...aboveIndices);

    if (aboveIndices.length > 0) {
      localActiveIndex = maxIndex;
    } else if (belowIndices.length > 0 && activeIndex !== null && minIndex <= activeIndex) {
      localActiveIndex = minIndex - 1 >= 0 ? minIndex - 1 : 0;
    }

    if (localActiveIndex !== activeIndex && localActiveIndex !== null) {
      activeIndex = localActiveIndex;
      onIntersect(headingIds[activeIndex]);
    }
  }

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(handleObserver, {
      rootMargin: '-96px',
      threshold: 1.0
    });

    headingIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && observer) {
        observer.observe(el);
      }
    });
  }

  return () => {
    if (observer) {
      observer.disconnect();
    }
  };
});

export default docfyIntersectHeadings;
