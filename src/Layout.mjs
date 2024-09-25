import PlainDraggable from 'plain-draggable'
import { onRemove, animateRectTransition } from './utils'

export class Layout {
  constructor(options = {}) {
    if (!options.name) throw Error("Layout name is not given")
    this.name = options.name
    this.enterHandler = options.enterHandler
    this.leaveHandler = options.leaveHandler
  }
  valueOf = () => this.name
}

export class SideBySide extends Layout {
  name = "side-by-side"

  enterHandler = ({ container, htmlHolder, showcase }) => {
    const bar = document.createElement('div')
    bar.className = 'bar'
    bar.innerHTML = '<div class="bar-handle"></div>'
    const handle = bar.querySelector('.bar-handle')
    container.appendChild(bar)

    // Resize views by value
    const resizeByLeft = (left) => {
      htmlHolder.style.width = (left) + "px"
      showcase.style.width = (parseFloat(getComputedStyle(container).width) - left) + "px"
    }

    const draggable = new PlainDraggable(bar, {
      handle: handle,
      containment: { left: '25%', top: 0, right: '75%', height: 0 },
    })
    draggable.draggableCursor = "grab"

    draggable.onDrag = (pos) => {
      handle.style.transform = 'unset'
      resizeByLeft(pos.left)
    }
    draggable.onDragEnd = (_) => {
      handle.removeAttribute('style')
    }

    onRemove(bar, () => draggable.remove())
  }

  leaveHandler = ({ container }) => {
    container.querySelector('.bar')?.remove()
  }
}

export class Overlay extends Layout {
  name = "overlay"

  saveLeftTopAsData = (element) => {
    const { left, top } = element.getBoundingClientRect()
    element.setAttribute('data-left', left)
    element.setAttribute('data-top', top)
  }

  addDraggable = (element) => {
    // Make sure current element always on top
    const siblings = Array.from(element.parentElement?.querySelectorAll(':scope > *') ?? [])
    let popTimer = null
    element.onmouseover = () => {
      popTimer = setTimeout(() => {
        siblings.forEach(e => e.style.removeProperty('z-index'))
        element.style.zIndex = '9000'
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
      top: top,
      left: left,
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
    new ResizeObserver(() => {
      try {
        draggable.position();
      } catch (_) {
        null
      }
    }).observe(element);

    // Callback for remove
    onRemove(element, () => {
      draggable.remove()
    })
  }

  enterHandler = ({ htmlHolder, blocks }) => {
    // FIXME It is weird rect from this method and this scope are different...
    blocks.forEach(this.saveLeftTopAsData)

    // Create draggable blocks and set each position by previous one
    let [left, top] = [20, 20]
    blocks.forEach(block => {
      const originLeft = Number(block.getAttribute('data-left'))
      const originTop = Number(block.getAttribute('data-top'))

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
      wrapper.onmouseup = (e) => {
        // Hide block with middle click
        if (e.button === 1) {
          wrapper.classList.add('hide')
        }
      }

      // Set DOMRect for wrapper
      wrapper.appendChild(block)
      wrapper.style.left = left + "px"
      wrapper.style.top = top + "px"
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
        { resume: true, duration: 300 }
      )
        .finished
        .finally(() => this.addDraggable(wrapper))

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
        utils.removeAttribute('style')
      }

      // Close button
      wrapper.querySelector('#close').onclick = () => {
        wrapper.classList.add('hide')
        utils.removeAttribute('style')
      }
      // Plus/Minus font-size of content
      wrapper.querySelector('#plus-font-size').onclick = () => {
        const fontSize = parseFloat(getComputedStyle(block).fontSize) / 16
        block.style.fontSize = `${fontSize + 0.2}rem`
      }
      wrapper.querySelector('#minus-font-size').onclick = () => {
        const fontSize = parseFloat(getComputedStyle(block).fontSize) / 16
        block.style.fontSize = `${fontSize - 0.2}rem`
      }
    })
  }

  leaveHandler = ({ htmlHolder, blocks }) => {
    const resumeFromDraggable = (block) => {
      const draggableContainer = block.closest('.draggable-block')
      if (!draggableContainer) return
      htmlHolder.appendChild(block)
      draggableContainer.remove()
    }
    blocks.forEach(resumeFromDraggable)
  }
}

