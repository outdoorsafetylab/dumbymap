import { shiftByWindow } from './utils.mjs'

/**
 * Item. Basic Element for menu item
 *
 * @extends {window.HTMLDivElement}
 */
export class Item extends window.HTMLDivElement {
  /**
   * constructor.
   *
   * @param {Object}
   */
  constructor ({ text, innerHTML, onclick, style, className }) {
    super()
    this.innerHTML = innerHTML ?? text
    this.onclick = onclick
    this.style.cssText = style
    this.classList.add('menu-item')
    className?.forEach(c => this.classList.add(c))

    this.onmouseover = () => {
      this.parentElement
        .querySelectorAll('.sub-menu')
        .forEach(sub => sub.remove())
    }
  }
}
window.customElements.define('menu-item', Item, { extends: 'div' })

/**
 * Folder. Basic Element for menu item, it generate submenu on hover
 *
 * @extends {window.HTMLDivElement}
 */
export class Folder extends window.HTMLDivElement {
  /**
   * constructor.
   *
   * @param {}
   */
  constructor ({ text, innerHTML, items }) {
    super()
    this.innerHTML = innerHTML ?? text
    this.classList.add('folder', 'menu-item')
    this.items = items
    this.onmouseover = () => {
      if (this.querySelector('.sub-menu')) return
      // Prepare submenu
      const submenu = document.createElement('div')
      submenu.className = 'sub-menu'
      const offset = this.items.length > 1 ? '-20px' : '0px'
      submenu.style.cssText = `position: absolute; left: 105%; top: ${offset};`
      this.items.forEach(item => submenu.appendChild(item))
      submenu.onmouseleave = () => submenu.remove()

      // hover effect
      this.parentElement
        .querySelectorAll('.sub-menu')
        .forEach(sub => sub.remove())
      this.appendChild(submenu)
      shiftByWindow(submenu)
    }
  }
}
window.customElements.define('menu-folder', Folder, { extends: 'div' })

/**
 * pickMapItem.
 *
 * @param {Function[]} options.utils
 */
export const pickMapItem = ({ utils }) =>
  new Folder({
    innerHTML: '<span>Maps<span><span class="info">(Tab)</span>',
    items: utils.renderedMaps().map(
      map =>
        new Item({
          text: map.id,
          onclick: () => {
            map.classList.add('focus')
            map.scrollIntoView({ behavior: 'smooth' })
          }
        })
    )
  })

/**
 * pickBlockItem.
 *
 * @param {HTMLElement[]} options.blocks
 * @param {Function[]} options.utils
 */
export const pickBlockItem = ({ blocks, utils }) =>
  new Folder({
    innerHTML: '<span>Blocks<span><span class="info">(n/p)</span>',
    items: blocks.map(
      (block, index) => {
        const focus = block.classList.contains('focus')
        const preview = block.querySelector('p')
          ?.textContent.substring(0, 15)
          ?.concat(' ', '...  ') ?? ''

        return new Item({
          className: ['keep-menu', focus ? 'checked' : 'unchecked'],
          innerHTML:
            `<strong>(${index})</strong><span style='display: inline-block; margin-inline: 1.2em;'>${preview}</span>`,
          onclick: (e) => {
            block.classList.toggle('focus')

            const focus = block.classList.contains('focus')
            if (focus) utils.scrollToBlock(block)
            const item = e.target.closest('.menu-item.keep-menu')
            item.classList.add(focus ? 'checked' : 'unchecked')
            item.classList.remove(focus ? 'unchecked' : 'checked')

            // UX: remove menu after user select/deselect blocks
            const submenu = e.target.closest('.sub-menu')
            submenu.onmouseleave = () => { submenu.closest('.menu').style.display = 'none' }
          }
        })
      }
    )
  })

/**
 * pickLayoutItem.
 *
 * @param {HTEMElement} options.container
 * @param {String[]} options.layouts
 */
export const pickLayoutItem = ({ container, layouts }) =>
  new Folder({
    innerHTML: '<span>Layouts<span><span class="info">(x)</span>',
    items: [
      new Item({
        text: 'EDIT',
        onclick: () =>
          container.closest('[data-mode]').setAttribute('data-mode', 'editing')
      }),
      ...layouts.map(
        layout =>
          new Item({
            text: layout.name,
            onclick: () => container.setAttribute('data-layout', layout.name)
          })
      ),
      new Item({
        innerHTML: '<a href="https://github.com/outdoorsafetylab/dumbymap#layouts" class="external" style="display: block; padding: 0.5rem;">More...</a>',
        style: 'padding: 0;'
      })
    ]
  })

/**
 * addGeoLink.
 *
 * @param {Function[]} options.utils
 * @param {Range} range
 */
export const addGeoLink = ({ utils }, range) =>
  new Item({
    text: 'Add GeoLink',
    onclick: () => {
      const content = range.toString()
      // FIXME Apply geolink only on matching sub-range
      const match = content.match(/(^\D*[\d.]+)\D+([\d.]+)\D*$/)
      if (!match) return false

      const [x, y] = match.slice(1)
      const anchor = document.createElement('a')
      anchor.textContent = content
      // FIXME apply WGS84
      anchor.href = `geo:${y},${x}?xy=${x},${y}`

      // FIXME
      if (utils.createGeoLink(anchor)) {
        range.deleteContents()
        range.insertNode(anchor)
      }
    }
  })

/**
 * Suggestion. Menu Item for editor suggestion
 *
 * @extends {Item}
 */
export class Suggestion extends Item {
  /**
   * constructor.
   *
   * @param {}
   */
  constructor ({ text, replace, cm }) {
    super({ text })
    this.replace = replace
    this.classList.add('suggestion')

    this.onmouseover = () => {
      Array.from(this.parentElement?.children)?.forEach(s =>
        s.classList.remove('focus')
      )
      this.classList.add('focus')
    }
    this.onmouseout = () => {
      this.classList.remove('focus')
    }
    this.onclick = () => {
      const anchor = cm.getCursor()
      cm.setSelection(anchor, { ...anchor, ch: 0 })
      cm.replaceSelection(this.replace)
      cm.focus()
      const newAnchor = { ...anchor, ch: this.replace.length }
      cm.setCursor(newAnchor)
    }
  }
}
window.customElements.define('menu-item-suggestion', Suggestion, { extends: 'div' })

/**
 * renderResults. return a menu item for reporting render results
 *
 * @param {Object} options.modal -- Ojbect of plain-modal
 * @param {HTMLElement} options.modalContent
 * @param {HTMLElement} map -- Rendered map element
 */
export const renderResults = ({ modal, modalContent }, map) =>
  new Item({
    text: 'Render Results',
    onclick: () => {
      modal.open()
      modal.overlayBlur = 3
      modal.closeByEscKey = false
      // HACK find another way to override inline style
      document.querySelector('.plainmodal-overlay-force').style.position =
        'relative'

      modalContent.innerHTML = ''
      const sourceCode = document.createElement('div')
      sourceCode.innerHTML = `<a href="${map.renderer.url ?? map.renderer.use}">Source Code</a>`
      modalContent.appendChild(sourceCode)
      const printDetails = result => {
        // const funcBody = result.func.toString()
        // const loc = funcBody.split('\n').length
        const color =
          {
            success: 'green',
            fail: 'red',
            skip: 'black',
            stop: 'chocolate'
          }[result.state] ?? 'black'
        printObject(
          result,
          modalContent,
          `${result.func.name} <span style='float: right;'><span style='display: inline-block; width: 100px; color: ${color};'>${result.state}</span></span>`
        )
      }

      // Add contents about prepare steps
      const prepareHeading = document.createElement('h3')
      prepareHeading.textContent = 'Prepare Steps'
      modalContent.appendChild(prepareHeading)
      const prepareSteps = map.renderer.results.filter(
        r => r.type === 'prepare'
      )
      prepareSteps.forEach(printDetails)

      // Add contents about render steps
      const renderHeading = document.createElement('h3')
      renderHeading.textContent = 'Render Steps'
      modalContent.appendChild(renderHeading)
      const renderSteps = map.renderer.results.filter(r => r.type === 'render')
      renderSteps.forEach(printDetails)
    }
  })

/**
 * printObject. Generate <details> in parent element based on Ojbect properties
 *
 * @param {Object} obj
 * @param {HTMLElement} parentElement
 * @param {String} name
 */
function printObject (obj, parentElement, name = null) {
  // Create <details> and <summary> inside
  const detailsEle = document.createElement('details')
  const details = name ?? (obj instanceof Error ? obj.name : Object.values(obj)[0])
  detailsEle.innerHTML = `<summary>${details}</summary>`
  parentElement.appendChild(detailsEle)

  detailsEle.onclick = () => {
    // Don't add items if it has contents
    if (detailsEle.querySelector(':scope > :not(summary)')) return

    if (obj instanceof Error) {
      // Handle Error objects specially
      const errorProps = ['name', 'message', 'stack', ...Object.keys(obj)]
      errorProps.forEach(key => {
        const value = obj[key]
        const valueString = key === 'stack' ? `<pre>${value}</pre>` : value
        const propertyElement = document.createElement('p')
        propertyElement.innerHTML = `<strong>${key}</strong>: ${valueString}`
        detailsEle.appendChild(propertyElement)
      })
    } else {
      // Handle regular objects
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          printObject(value, detailsEle, key)
        } else {
          const valueString =
            typeof value === 'function'
              ? `<pre>${value}</pre>`
              : value ?? typeof value
          const propertyElement = document.createElement('p')
          propertyElement.innerHTML = `<strong>${key}</strong>: ${valueString}`
          detailsEle.appendChild(propertyElement)
        }
      })
    }
  }
}

/**
 * toggleBlockFocus. Menu Item for toggling focus on a block
 *
 * @param {HTMLElement} block
 */
export const toggleBlockFocus = block =>
  new Item({
    text: 'Toggle Focus',
    onclick: () => block.classList.toggle('focus')
  })

/**
 * toggleMapFocus. Menu Item for toggling focus on a map
 *
 * @param {HTMLElement} map
 */
export const toggleMapFocus = map =>
  new Item({
    text: 'Toggle Focus',
    onclick: () => map.classList.toggle('focus')
  })

/**
 * getCoordinatesByPixels.
 *
 * @param {HTMLElement} map instance
 * @param {Number[]} xy -- pixel of window
 */
export const getCoordinatesByPixels = (map, xy) =>
  new Item({
    text: 'Get Coordinates',
    onclick: () => {
      const [x, y] = map.renderer.unproject(xy)
      const xyString = `[${x.toFixed(7)}, ${y.toFixed(7)}]`
      navigator.clipboard.writeText(xyString)
      window.alert(`${xyString} copied to clipboard`)
    }
  })

/**
 * restoreCamera.
 *
 * @param {HTMLElement} map
 */
export const restoreCamera = map =>
  new Item({
    text: 'Restore Camera',
    onclick: () => map.renderer.restoreCamera()
  })
