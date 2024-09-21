import PlainDraggable from 'plain-draggable'
import { onRemove } from './utils'

export class OverlayLayout {
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
          draggableBlock.style.display = "none";
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

      // Plus/Minus font-size of content
      const plusButton = draggableBlock.querySelector('#plus-font-size')
      plusButton.onclick = () => {
        const fontSize = parseFloat(getComputedStyle(block).fontSize) / 16
        block.style.fontSize = `${fontSize + 0.1}rem`
      }
      const minusButton = draggableBlock.querySelector('#minus-font-size')
      minusButton.onclick = () => {
        const fontSize = parseFloat(getComputedStyle(block).fontSize) / 16
        block.style.fontSize = `${fontSize - 0.1}rem`
      }
      draggableInstance.onDragStart = () => {
        plusButton.style.opacity = '0'
        minusButton.style.opacity = '0'
      }
      draggableInstance.onDragEnd = () => {
        plusButton.style = ''
        minusButton.style = ''
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

