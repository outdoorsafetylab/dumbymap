// Disconnect MutationObserver if element is removed
export const onRemove = (element, callback) => {
  const parent = element.parentNode;
  if (!parent) throw new Error("The node must already be attached");

  const obs = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const el of mutation.removedNodes) {
        if (el === element) {
          obs.disconnect();
          callback();
        }
      }
    }
  });
  obs.observe(parent, { childList: true, });
}

// Animation for new rectangle
export const animateRectTransition = (child, rect, resume = false) => {
  const { width: w1, height: h1, left: x1, top: y1 } = rect
  const { width: w2, height: h2, left: x2, top: y2 } = child.getBoundingClientRect()

  const rw = w1 / w2
  const rh = h1 / h2
  const dx = x1 - x2;
  const dy = y1 - y2;

  if (dx === 0 && dy === 0) {
    return;
  }

  const transform1 = `translate(0, 0) scale(1, 1)`;
  const transform2 = `translate(${dx}px, ${dy}px) scale(${rw}, ${rh})`;
  const keyframes = [
    { transform: transform1, opacity: 1 },
    { transform: transform2, opacity: 0.3 },
  ]

  return child.animate(
    resume
      ? keyframes.reverse()
      : keyframes,
    {
      duration: 300,
      easing: 'ease-in-out',
    });
}
