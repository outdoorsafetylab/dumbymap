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
    top: y2,
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
    { transform: transform2, opacity: 0.3 },
  ]
  if (options.resume === true) keyframes.reverse()

  return element.animate(keyframes, {
    duration: options.duration ?? 500,
    easing: 'ease-in-out',
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
      typeof delay === 'function' ? delay.call(context) : delay,
    )

    return func.call(context, ...args)
  }
}

/**
 * shiftByWindow. make sure HTMLElement inside viewport
 *
 * @param {HTMLElement} element
 */
export const shiftByWindow = element => {
  const rect = element.getBoundingClientRect()
  const offsetX = window.innerWidth - rect.left - rect.width
  const offsetY = window.innerHeight - rect.top - rect.height
  element.style.transform = `translate(${offsetX < 0 ? offsetX : 0}px, ${offsetY < 0 ? offsetY : 0}px)`
}

/**
 * insideWindow. check DOMRect is inside window
 *
 * @param {HTMLElement} element
 */
export const insideWindow = element => {
  const rect = element.getBoundingClientRect()
  return (
    rect.left > 0 &&
    rect.right < window.innerWidth + rect.width &&
    rect.top > 0 &&
    rect.bottom < window.innerHeight + rect.height
  )
}

/**
 * insideParent. check children element is inside DOMRect of parent element
 *
 * @param {HTMLElement} childElement
 * @param {HTMLElement} parentElement
 */
export const insideParent = (childElement, parentElement) => {
  const childRect = childElement.getBoundingClientRect()
  const parentRect = parentElement.getBoundingClientRect()
  const offset = 10

  return (
    childRect.left < parentRect.right - offset &&
    childRect.right > parentRect.left + offset &&
    childRect.top < parentRect.bottom - offset &&
    childRect.bottom > parentRect.top + offset
  )
}

/**
 * replaceTextNodes.
 * @description Search current nodes by pattern, and replace them by new node
 * @todo refactor to smaller methods
 * @param {HTMLElement} element
 * @param {RegExp} pattern
 * @param {Function} newNode - Create new node by each result of String.prototype.matchAll
 */
export const replaceTextNodes = (
  element,
  pattern,
  newNode = (match) => {
    const link = document.createElement('a')
    link.textContent(match.at(0))
    return link
  },
) => {
  const nodeIterator = document.createNodeIterator(
    element,
    window.NodeFilter.SHOW_TEXT,
    node => node.textContent.match(pattern)
      ? window.NodeFilter.FILTER_ACCEPT
      : window.NodeFilter.FILTER_REJECT,
  )

  let node = nodeIterator.nextNode()
  while (node) {
    let index = 0
    for (const match of node.textContent.matchAll(pattern)) {
      const text = node.textContent.slice(index, match.index)
      index = match.index + match.at(0).length
      node.parentElement.insertBefore(document.createTextNode(text), node)
      node.parentElement.insertBefore(newNode(match), node)
    }
    if (index < node.textContent.length) {
      const text = node.textContent.slice(index)
      node.parentElement.insertBefore(document.createTextNode(text), node)
    }

    node.parentElement.removeChild(node)
    node = nodeIterator.nextNode()
  }
}

/**
 * Get the common ancestor of two or more elements
 * {@link https://gist.github.com/kieranbarker/cd86310d0782b7c52ce90cd7f45bb3eb}
 * @param {String} selector A valid CSS selector
 * @returns {Element} The common ancestor
 */
export function getCommonAncestor (selector) {
  // Get the elements matching the selector
  const elems = document.querySelectorAll(selector)

  // If there are no elements, return null
  if (elems.length < 1) return null

  // If there's only one element, return it
  if (elems.length < 2) return elems[0]

  // Otherwise, create a new Range
  const range = document.createRange()

  // Start at the beginning of the first element
  range.setStart(elems[0], 0)

  // Stop at the end of the last element
  range.setEnd(
    elems[elems.length - 1],
    elems[elems.length - 1].childNodes.length,
  )

  // Return the common ancestor
  return range.commonAncestorContainer
}
