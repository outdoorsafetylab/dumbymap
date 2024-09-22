import PlainDraggable from 'plain-draggable'
import { onRemove } from './utils'

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

    new ResizeObserver(() => {
      if (draggable) resizeByLeft(draggable.left)
    }).observe(container);
  }

  leaveHandler = ({ container, htmlHolder, showcase }) => {
    container.removeAttribute('style')
    htmlHolder.removeAttribute('style')
    showcase.removeAttribute('style')
    container.querySelector('.bar')?.remove()
  }
}

export class Overlay extends Layout {
  name = "overlay"

  enterHandler = (dumbymap) => {
    const container = dumbymap.htmlHolder
    const moveIntoDraggable = (block) => {
      // Create draggable block
      const draggableBlock = document.createElement('div')
      draggableBlock.classList.add('draggable-block')
      draggableBlock.innerHTML = `
        <div class="draggable">
          <div class="handle">\u2630</div>
        </div>
        <div class="utils">
          <div id="close">\u274C</div>
          <div id="plus-font-size" ">\u2795</div>
          <div id="minus-font-size">\u2796</div>
        </div>
      `

      // Add draggable part
      const draggablePart = draggableBlock.querySelector('.draggable')
      draggablePart.title = 'Use middle-click to remove block'
      draggablePart.onmouseup = (e) => {
        if (e.button === 1) {
          // Hide block with middle click
          draggableBlock.setAttribute("data-state", "hide")
        }
      }

      // Set elements
      draggableBlock.appendChild(draggablePart)
      draggableBlock.appendChild(block)
      container.appendChild(draggableBlock)

      // Add draggable instance
      const draggableInstance = new PlainDraggable(draggableBlock, {
        handle: draggablePart,
        snap: { x: { step: 20 }, y: { step: 20 } },
      })

      // Close button
      draggableBlock.querySelector('#close').onclick = () => {
          draggableBlock.setAttribute("data-state", "hide")
      }
      // Plus/Minus font-size of content
      draggableBlock.querySelector('#plus-font-size').onclick = () => {
        const fontSize = parseFloat(getComputedStyle(block).fontSize) / 16
        block.style.fontSize = `${fontSize + 0.1}rem`
      }
      draggableBlock.querySelector('#minus-font-size').onclick = () => {
        const fontSize = parseFloat(getComputedStyle(block).fontSize) / 16
        block.style.fontSize = `${fontSize - 0.1}rem`
      }

      // FIXME use pure CSS to hide utils
      const utils = draggableBlock.querySelector('.utils')
      draggableInstance.onDragStart = () => {
        utils.style.opacity = 0
        draggableBlock.setAttribute('data-state', 'on-drag')
      }
      draggableInstance.onDragEnd = () => {
        utils.style = ''
        draggableBlock.removeAttribute('data-state')
      }

      // Reposition draggable instance when resized
      new ResizeObserver(() => {
        try {
          draggableInstance.position();
        } catch (_) {
          null
        }
      }).observe(draggableBlock);

      // Callback for remove
      onRemove(draggableBlock, () => {
        draggableInstance.remove()
      })

      return draggableInstance
    }

    // Create draggable blocks and set each position by previous one
    let [x, y] = [0, 0]
    dumbymap.blocks.map(moveIntoDraggable)
      .forEach(draggable => {
        draggable.left = x
        draggable.top = y
        const rect = draggable.element.getBoundingClientRect()
        x += rect.width + 30
        if (x > window.innerWidth) {
          y += 200
          x = x % window.innerWidth
        }
      })
  }
  leaveHandler = (dumbymap) => {
    const container = dumbymap.htmlHolder
    const resumeFromDraggable = (block) => {
      const draggableContainer = block.closest('.draggable-block')
      if (!draggableContainer) return
      container.appendChild(block)
      block.removeAttribute('style')
      draggableContainer.remove()
    }
    dumbymap.blocks.forEach(resumeFromDraggable)
  }
}

