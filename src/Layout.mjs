import PlainDraggable from 'plain-draggable'
import { onRemove, animateRectTransition } from './utils'

/**
 * Basic class for layout
 */
export class Layout {
  /**
   * Creates a new Layout instance
   *
   * @param {Object} options - The options for the layout
   * @param {string} options.name - The name of the layout
   * @param {Function} [options.enterHandler] - Handler called when entering the layout
   * @param {Function} [options.leaveHandler] - Handler called when leaving the layout
   * @throws {Error} If the layout name is not provided
   */
  constructor (options = {}) {
    if (!options.name) throw Error('Layout name is not given')
    this.name = options.name
    this.enterHandler = options.enterHandler
    this.leaveHandler = options.leaveHandler
  }

  /**
   * Returns the name of the layout
   *
   * @returns {string} The name of the layout
   */
  valueOf = () => this.name
}

/**
 * Side-By-Side Layout, HTML content and Showcase show on left/right side
 *
 * @extends {Layout}
 */
export class SideBySide extends Layout {
  /**
   * Handler called when entering the Side-By-Side layout
   *
   * @param {Object} options - The options object
   * @param {HTMLElement} options.container - The main container element
   * @param {HTMLElement} options.htmlHolder - The HTML content holder
   * @param {HTMLElement} options.showcase - The showcase element
   */
  enterHandler = ({ container, htmlHolder, showcase }) => {
    const bar = document.createElement('div')
    bar.className = 'bar'
    bar.innerHTML = '<div class="bar-handle"></div>'
    const handle = bar.querySelector('.bar-handle')
    container.appendChild(bar)

    // Resize views by value
    const resizeByLeft = left => {
      htmlHolder.style.width = left + 'px'
      showcase.style.width =
        parseFloat(window.getComputedStyle(container).width) - left + 'px'
    }

    const draggable = new PlainDraggable(bar, {
      handle,
      containment: { left: '25%', top: 0, right: '75%', height: 0 },
    })
    draggable.draggableCursor = 'grab'

    draggable.onDrag = pos => {
      handle.style.transform = 'unset'
      resizeByLeft(pos.left)
    }
    draggable.onDragEnd = _ => {
      handle.style.cssText = ''
    }

    onRemove(bar, () => draggable.remove())
  }

  /**
   * Handler called when leaving the Side-By-Side layout
   *
   * @param {Object} options - The options object
   * @param {HTMLElement} options.container - The main container element
   */
  leaveHandler = ({ container }) => {
    container.querySelector('.bar')?.remove()
  }
}

/**
 * Overlay Layout, Showcase occupies viewport, and HTML content becomes draggable blocks
 *
 * @extends {Layout}
 */
export class Overlay extends Layout {
  /**
   * saveLeftTopAsData.
   *
   * @param {HTMLElement} element
   */
  saveLeftTopAsData = element => {
    const { left, top } = element.getBoundingClientRect()
    element.dataset.left = left
    element.dataset.top = top
  }

  /**
   * addDraggable.
   *
   * @param {HTMLElement} element
   */
  addDraggable = element => {
    // Make sure current element always on top
    const siblings = Array.from(
      element.parentElement?.querySelectorAll(':scope > *') ?? [],
    )
    let popTimer = null
    element.onmouseover = () => {
      popTimer = setTimeout(() => {
        siblings.forEach(e => e.style.removeProperty('z-index'))
        element.style.zIndex = '9001'
      }, 200)
    }
    element.onmouseout = () => {
      clearTimeout(popTimer)
    }

    // Add draggable part
    const draggablePart = document.createElement('div')
    element.appendChild(draggablePart)
    draggablePart.className = 'draggable-part'
    draggablePart.innerHTML = '<div class="handle">\u2630</div>'

    // Add draggable instance
    const { left, top } = element.getBoundingClientRect()
    const draggable = new PlainDraggable(element, {
      top,
      left,
      handle: draggablePart,
      snap: { x: { step: 20 }, y: { step: 20 } },
    })

    // FIXME use pure CSS to hide utils
    const utils = element.querySelector('.utils')
    draggable.onDragStart = () => {
      utils.style.display = 'none'
      element.classList.add('drag')
    }

    draggable.onDragEnd = () => {
      utils.style = ''
      element.classList.remove('drag')
      element.style.zIndex = '9000'
    }

    // Reposition draggable instance when resized
    new window.ResizeObserver(() => {
      try {
        draggable.position()
      } catch (err) {
        console.warn(err)
      }
    }).observe(element)

    // Callback for remove
    onRemove(element, () => {
      draggable.remove()
    })
  }

  /**
   * enterHandler.
   *
   * @param {HTMLElement} options.hemlHolder - Parent element for block
   * @param {HTMLElement[]} options.blocks
   */
  enterHandler = ({ htmlHolder, blocks }) => {
    // FIXME It is weird rect from this method and this scope are different...
    blocks.forEach(this.saveLeftTopAsData)

    // If no block are focused, focus first three blocks (make them visible)
    if (!blocks.find(b => b.classList.contains('focus'))) {
      blocks.slice(0, 3).forEach(b => b.classList.add('focus'))
    }

    // Create draggable blocks and set each position by previous one
    let [left, top] = [20, 20]
    blocks.forEach(block => {
      const originLeft = Number(block.dataset.left)
      const originTop = Number(block.dataset.top)

      // Create draggable block
      const wrapper = document.createElement('div')
      wrapper.classList.add('draggable-block')
      wrapper.innerHTML = `
        <div class="utils">
          <div id="close">\u274C</div>
          <div id="plus-font-size" ">\u2795</div>
          <div id="minus-font-size">\u2796</div>
        </div>
      `
      wrapper.title = 'Middle-click to hide block'
      wrapper.onmouseup = e => {
        // Hide block with middle click
        if (e.button === 1) {
          block.classList.remove('focus')
        }
      }

      // Set DOMRect for wrapper
      wrapper.appendChild(block)
      wrapper.style.left = left + 'px'
      wrapper.style.top = top + 'px'
      htmlHolder.appendChild(wrapper)
      const { width } = wrapper.getBoundingClientRect()
      left += width + 30
      if (left > window.innerWidth) {
        top += 200
        left = left % window.innerWidth
      }

      // Animation for DOMRect
      animateRectTransition(
        wrapper,
        { left: originLeft, top: originTop },
        { resume: true, duration: 300 },
      ).finished.finally(() => this.addDraggable(wrapper))

      // Trivial case:
      // This hack make sure utils remains at the same place even when wrapper resized
      // Prevent DOMRect changes when user clicking plus/minus button many times
      const utils = wrapper.querySelector('.utils')
      utils.onmouseover = () => {
        const { left, top } = utils.getBoundingClientRect()
        utils.style.cssText = `visibility: visible; z-index: 9000; position: fixed; transition: unset; left: ${left}px; top: ${top}px;`
        document.body.appendChild(utils)
      }
      utils.onmouseout = () => {
        wrapper.appendChild(utils)
        utils.style.cssText = ''
      }

      // Close button
      wrapper.querySelector('#close').onclick = () => {
        block.classList.remove('focus')
        utils.style.cssText = ''
      }
      // Plus/Minus font-size of content
      wrapper.querySelector('#plus-font-size').onclick = () => {
        const fontSize = parseFloat(window.getComputedStyle(block).fontSize) / 16
        block.style.fontSize = `${fontSize + 0.2}rem`
      }
      wrapper.querySelector('#minus-font-size').onclick = () => {
        const fontSize = parseFloat(window.getComputedStyle(block).fontSize) / 16
        block.style.fontSize = `${fontSize - 0.2}rem`
      }
    })
  }

  /**
   * leaveHandler.
   *
   * @param {HTMLElement} htmlHolder
   * @param {HTMLElement[]} blocks
   */
  leaveHandler = ({ htmlHolder, blocks }) => {
    const resumeFromDraggable = block => {
      const draggableContainer = block.closest('.draggable-block')
      if (!draggableContainer) return
      htmlHolder.appendChild(block)
      draggableContainer.remove()
    }
    blocks.forEach(resumeFromDraggable)
  }
}
