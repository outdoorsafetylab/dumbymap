/**
 * Do callback when HTMLElement in removed
 *
 * @param {HTMLElement} element observing
 * @param {Function} callback
 */
export const onRemove = (element, callback) => {
  const parent = element.parentNode
  if (!parent) throw new Error('The node must already be attached')

  const obs = new window.MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const el of mutation.removedNodes) {
        if (el === element) {
          obs.disconnect()
          callback()
        }
      }
    }
  })
  obs.observe(parent, { childList: true })
}

/**
 * Animate transition of DOMRect, with Web Animation API
 *
 * @param {HTMLElement} element                 Element which animation applies
 * @param {DOMRect}     rect                    DOMRect for transition
 * @param {Object}      options
 * @param {Boolean}     options.resume          If true, transition starts from rect to DOMRect of element
 * @param {Number}      options.duration        Duration of animation in milliseconds
 * @returns {Animation} https://developer.mozilla.org/en-US/docs/Web/API/Animation
 */
export const animateRectTransition = (element, rect, options = {}) => {
  if (!element.parentElement) { throw new Error('The node must already be attached') }

  const { width: w1, height: h1, left: x1, top: y1 } = rect
  const {
    width: w2,
    height: h2,
    left: x2,
    top: y2
  } = element.getBoundingClientRect()

  const rw = (w1 ?? w2) / w2
  const rh = (h1 ?? h2) / h2
  const dx = x1 - x2
  const dy = y1 - y2

  if ((dx === 0 && dy === 0) || !isFinite(rw) || !isFinite(rh)) {
    return element.animate([], { duration: 0 })
  }

  const transform1 = 'translate(0, 0) scale(1, 1)'
  const transform2 = `translate(${dx}px, ${dy}px) scale(${rw}, ${rh})`
  const keyframes = [
    { transform: transform1, opacity: 1 },
    { transform: transform2, opacity: 0.3 }
  ]
  if (options.resume === true) keyframes.reverse()

  return element.animate(keyframes, {
    duration: options.duration ?? 500,
    easing: 'ease-in-out'
  })
}

/**
 * Throttle for function call
 *
 * @param {Function} func
 * @param {Number} delay milliseconds
 * @returns {Any} return value of function call, or null if throttled
 */
export function throttle (func, delay) {
  let timerFlag = null

  return function (...args) {
    const context = this
    if (timerFlag !== null) return null

    timerFlag = setTimeout(
      () => (timerFlag = null),
      typeof delay === 'function' ? delay.call(context) : delay
    )

    return func.call(context, ...args)
  }
}

export const shiftByWindow = element => {
  const rect = element.getBoundingClientRect()
  const offsetX = window.innerWidth - rect.left - rect.width
  const offsetY = window.innerHeight - rect.top - rect.height
  element.style.transform = `translate(${offsetX < 0 ? offsetX : 0}px, ${offsetY < 0 ? offsetY : 0}px)`
}
