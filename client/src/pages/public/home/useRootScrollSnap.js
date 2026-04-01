import { useEffect } from 'react';

export default function useRootScrollSnap({
  snapType = 'y mandatory',
  overflowY = 'scroll',
  scrollPaddingTop = '5rem',
} = {}) {
  useEffect(() => {
    const html = document.documentElement;
    const previousStyles = {
      scrollSnapType: html.style.scrollSnapType,
      overflowY: html.style.overflowY,
      scrollPaddingTop: html.style.scrollPaddingTop,
    };

    html.style.scrollSnapType = snapType;
    html.style.overflowY = overflowY;
    html.style.scrollPaddingTop = scrollPaddingTop;

    return () => {
      html.style.scrollSnapType = previousStyles.scrollSnapType;
      html.style.overflowY = previousStyles.overflowY;
      html.style.scrollPaddingTop = previousStyles.scrollPaddingTop;
    };
  }, [overflowY, scrollPaddingTop, snapType]);
}
