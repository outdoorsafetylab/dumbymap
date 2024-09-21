/**
 * Do callback when HTMLElement in removed
 *
 * @param {HTMLElement} element observing
 * @param {Function} callback
 */
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

/**
 * Animate transition of DOMRect, with Web Animation API
 *
 * @param {HTMLElement} element                 Element which animation applies
 * @param {DOMRect}     rect                    DOMRect for transition
 * @param {Object}      options
 * @param {Boolean}     options.resume          If true, transition starts from rect to DOMRect of element
 * @param {Number}      options.duration        Duration of animation in milliseconds
 * @returns {Animation|null} https://developer.mozilla.org/en-US/docs/Web/API/Animation
 */
export const animateRectTransition = (element, rect, options = {}) => {
  if (!element.parentElement) throw new Error("The node must already be attached");

  const { width: w1, height: h1, left: x1, top: y1 } = rect
  const { width: w2, height: h2, left: x2, top: y2 } = element.getBoundingClientRect()

  const rw = w1 / w2
  const rh = h1 / h2
  const dx = x1 - x2;
  const dy = y1 - y2;

  if (dx === 0 && dy === 0 || rw === Infinity || rh === Infinity) {
    return null;
  }

  const transform1 = `translate(0, 0) scale(1, 1)`;
  const transform2 = `translate(${dx}px, ${dy}px) scale(${rw}, ${rh})`;
  const keyframes = [
    { transform: transform1, opacity: 1 },
    { transform: transform2, opacity: 0.3 },
  ]
  if (options.resume === true) keyframes.reverse()

  return element.animate(
    keyframes,
    {
      duration: options.duration ?? 300,
      easing: 'ease-in-out',
    }
  );
}


/**
 * Throttle for function call
 *
 * @param {Function} func
 * @param {Number} delay milliseconds
 * @returns {Any} return value of function call, or null if throttled
 */
export function throttle(func, delay) {
  let timerFlag = null;

  return (...args) => {
    if (timerFlag !== null) return null
    timerFlag = setTimeout(() => {
      timerFlag = null;
    }, delay);
    return func(...args);
  };
}
