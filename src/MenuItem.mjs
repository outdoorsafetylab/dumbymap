import { onRemove, shiftByWindow } from './utils.mjs'
import { addMarkerByPoint } from './dumbyUtils.mjs'
/* eslint-disable-next-line no-unused-vars */
import { GeoLink, getMarkersFromMaps, getMarkersByGeoLink, removeLeaderLines } from './Link.mjs'
import * as markers from './marker.mjs'
import { parseConfigsFromYaml } from 'mapclay'

/**
 * @typedef {Object} RefLink
 * @property {string} ref - name of link
 * @property {string} link - content of link
 * @property {string|null} title - title of link
 */

/**
   * Creates a Item instance
   *
   * @param {Object} options - The options for the item
   * @param {string} [options.text] - The text content of the item
   * @param {string} [options.innerHTML] - The HTML content of the item
   * @param {string} [options.title] - The title attribute for the item
   * @param {Function} [options.onclick] - The click event handler
   * @param {string} [options.style] - The CSS style string
   * @param {string[]} [options.className] - Additional CSS classes
   */
export const Item = ({
  id,
  text,
  innerHTML,
  title,
  onclick,
  style,
  className,
}) => {
  const menuItem = document.createElement('div')
  if (id) menuItem.id = id
  if (title) menuItem.title = title
  menuItem.innerHTML = innerHTML ?? text
  menuItem.onclick = onclick
  menuItem.style.cssText = style
  menuItem.classList.add('menu-item')
  className?.forEach(c => menuItem.classList.add(c))

  menuItem.onmouseover = () => {
    menuItem.parentElement
      .querySelectorAll('.sub-menu')
      .forEach(sub => sub.remove())
  }
  return menuItem
}

/**
 * Creates a new menu item that generates a submenu on hover
 *
 * @param {Object} options - The options for the folder
 * @param {string} [options.text] - The text content of the folder
 * @param {string} [options.innerHTML] - The HTML content of the folder
 * @param {Item[]} options.items - The submenu items
 */
export const Folder = ({ id, text, innerHTML, items, style }) => {
  const folder = document.createElement('div')
  if (id) folder.id = id
  folder.innerHTML = innerHTML ?? text
  folder.classList.add('folder', 'menu-item')
  folder.items = items
  folder.onmouseover = () => {
    if (folder.querySelector('.sub-menu')) return
    // Prepare submenu
    const submenu = document.createElement('div')
    submenu.className = 'sub-menu'
    const offset = folder.items.length > 1 ? '-20px' : '0px'
    submenu.style.cssText = `${style ?? ''}position: absolute; left: 105%; top: ${offset};`
    folder.items.forEach(item => submenu.appendChild(item))
    submenu.onmouseleave = () => {
      if (submenu.querySelectorAll('.sub-menu').length > 0) return
      submenu.remove()
    }

    // hover effect
    folder.parentElement
      .querySelectorAll('.sub-menu')
      .forEach(sub => sub.remove())
    folder.appendChild(submenu)
    shiftByWindow(submenu)
  }
  return folder
}

/**
 * simplePlaceholder.
 *
 * @param {String} text
 */
export const simplePlaceholder = (text) => Item({
  text,
  style: 'width: fit-content; margin: 0 auto; color: gray; pointer-events: none; font-size: 0.8rem; line-height: 1; font-weight: bolder;',
})

/**
 * Pick up a map
 *
 * @param {Object} options - The options object
 * @param {Object} options.utils - Utility functions
 * @returns {Folder} A Folder instance for picking a map
 */
export const pickMapItem = ({ utils }) =>
  Folder({
    innerHTML: '<span>Maps<span><span class="info">(Tab)</span>',
    items: utils.renderedMaps().map(
      map =>
        Item({
          text: map.id,
          onclick: () => {
            map.classList.add('focus')
            map.scrollIntoView({ behavior: 'smooth' })
          },
        }),
    ),
  })

/**
 * pickBlockItem.
 *
 * @param {HTMLElement[]} options.blocks
 * @param {Function[]} options.utils
 */
export const pickBlockItem = ({ blocks, utils }) =>
  Folder({
    innerHTML: '<span>Blocks<span><span class="info">(n/p)</span>',
    items: blocks.map(
      (block, index) => {
        const focus = block.classList.contains('focus')
        const preview = block.querySelector('p')
          ?.textContent.substring(0, 15)
          ?.concat(' ', '...  ') ?? ''

        return Item({
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
          },
        })
      },
    ),
  })

/**
 * pickLayoutItem.
 *
 * @param {HTEMElement} options.container
 * @param {String[]} options.layouts
 */
export const pickLayoutItem = ({ container, layouts }) =>
  Folder({
    innerHTML: '<span>Layouts<span><span class="info">(x)</span>',
    items: [
      ...layouts.map(
        layout =>
          Item({
            text: layout.name,
            onclick: () => container.setAttribute('data-layout', layout.name),
          }),
      ),
      Item({
        innerHTML: '<a href="https://github.com/outdoorsafetylab/dumbymap#layouts" class="external" style="display: block; padding: 0.5rem;">More...</a>',
        style: 'padding: 0;',
      }),
    ],
  })

/**
 * addGeoLink.
 *
 * @param {Function[]} options.utils
 * @param {Range} range
 */
export const addGeoLink = ({ utils }, range) =>
  Item({
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
    },
  })

/**
   * Suggestion. Menu Item for editor suggestion.
   *
   * @param {String} options.text
   * @param {String} options.replace - new text content
   * @param {CodeMirror} options.cm
   */
export const Suggestion = ({ text, replace, cm }) => {
  const suggestion = Item({ text })
  suggestion.replace = replace
  suggestion.classList.add('suggestion')

  suggestion.onmouseover = () => {
    Array.from(suggestion.parentElement?.children)?.forEach(s =>
      s.classList.remove('focus'),
    )
    suggestion.classList.add('focus')
  }
  suggestion.onmouseout = () => {
    suggestion.classList.remove('focus')
  }
  suggestion.onclick = () => {
    const anchor = cm.getCursor()
    cm.setSelection(anchor, { ...anchor, ch: 0 })
    cm.replaceSelection(suggestion.replace)
    cm.focus()
    const newAnchor = { ...anchor, ch: suggestion.replace.length }
    cm.setCursor(newAnchor)
  }
  return suggestion
}

/**
 * renderResults. return a menu item for reporting render results
 *
 * @param {Object} options.modal - Ojbect of plain-modal
 * @param {HTMLElement} options.modalContent
 * @param {HTMLElement} map - Rendered map element
 */
export const renderResults = ({ modal, modalContent }, map) =>
  Item({
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
            stop: 'chocolate',
          }[result.state] ?? 'black'
        printObject(
          result,
          modalContent,
          `${result.func.name} <span style='float: right;'><span style='display: inline-block; width: 100px; color: ${color};'>${result.state}</span></span>`,
        )
      }

      // Add contents about prepare steps
      const prepareHeading = document.createElement('h3')
      prepareHeading.textContent = 'Prepare Steps'
      modalContent.appendChild(prepareHeading)
      const prepareSteps = map.renderer.results.filter(
        r => r.type === 'prepare',
      )
      prepareSteps.forEach(printDetails)

      // Add contents about render steps
      const renderHeading = document.createElement('h3')
      renderHeading.textContent = 'Render Steps'
      modalContent.appendChild(renderHeading)
      const renderSteps = map.renderer.results.filter(r => r.type === 'render')
      renderSteps.forEach(printDetails)
    },
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
  Item({
    text: 'Toggle Focus',
    onclick: () => block.classList.toggle('focus'),
  })

/**
 * toggleMapFocus. Menu Item for toggling focus on a map
 *
 * @param {HTMLElement} map
 */
export const toggleMapFocus = map =>
  Item({
    text: 'Toggle Focus',
    onclick: () => {
      if (map.classList.toggle('focus')) {
        map.classList.add('focus-manual')
      }
    },
  })

/**
 * getCoordinatesByPixels.
 *
 * @param {HTMLElement} map instance
 * @param {Number[]} xy - pixel of window
 */
export const getCoordinatesByPixels = (map, xy) =>
  Item({
    text: 'Get Coordinates',
    onclick: () => {
      const [x, y] = map.renderer.unproject(xy)
      const xyString = `[${x.toFixed(7)}, ${y.toFixed(7)}]`
      navigator.clipboard.writeText(xyString)
      window.alert(`${xyString} copied to clipboard`)
    },
  })

/**
 * restoreCamera.
 *
 * @param {HTMLElement} map
 */
export const restoreCamera = map =>
  Item({
    text: 'Restore Camera',
    onclick: () => map.renderer.restoreCamera(),
  })

/**
 * addRefLink. replace selected text into markdown link by reference style links
 *
 * @param {CodeMirror} cm
 * @param {RefLink[]} refLinks
 */
export const addRefLink = (cm, refLinks) =>
  Folder({
    text: 'Add Link',
    items: refLinks.map(refLink => {
      let text = refLink.ref
      if (refLink.link.startsWith('geo:')) text = `@ ${text}`
      if (refLink.title?.match(/^=>/)) text = `=> ${text}`

      return Item({
        text,
        title: refLink.link,
        onclick: () => {
          const selection = cm.getSelection()
          if (selection === refLink.ref) {
            cm.replaceSelection(`[${selection}]`)
          } else {
            cm.replaceSelection(`[${selection}][${refLink.ref}]`)
          }
        },
      })
    }),
  })

/**
 * setGeoLinkTypeItem.
 *
 * @param {GeoLink} link
 * @param {String} text
 * @param {String} type
 */
export const setGeoLinkTypeItem = ({ link, type, ...others }) => {
  const params = new URLSearchParams(link.search)
  return Item({
    ...others,
    className: ['keep-menu'],
    onclick: () => {
      params.set('type', type)
      link.search = params
      removeLeaderLines(link)
      getMarkersByGeoLink(link)
        .forEach(marker => marker.remove())
      getMarkersByGeoLink(link)
    },
  })
}

/**
 * setGeoLinkType.
 *
 * @param {HTMLAnchorElement} link
 */
export const setGeoLinkType = (link) => Folder({
  text: 'Marker Type',
  style: 'min-width: unset; display: grid; grid-template-columns: repeat(5, 1fr);',
  items: Object.entries(markers)
    .sort(([, a], [, b]) => (a.order ?? 9999) > (b.order ?? 9999))
    .map(([key, value]) => {
      return setGeoLinkTypeItem({
        link,
        title: value.name ?? key.at(0).toUpperCase() + key.slice(1),
        innerHTML: value.html,
        type: key,
        style: 'min-width: unset; width: fit-content; padding: 10px; margin: auto auto;',
      })
    }),
})

/**
 * set type of leader-line
 *
 * @param {GeoLink | DocLink} link
 */
export const setLeaderLineType = (link) => Folder({
  text: 'Line Type',
  items: ['magnet', 'straight', 'grid', 'fluid']
    .map(path => Item({
      text: path,
      className: ['keep-menu'],
      onclick: () => {
        link.dataset.linePath = path
        removeLeaderLines(link)
        link.onmouseover()
      },
    })),
})

/**
 * addMarker.
 *
 * @param {Object} options
 * @param {HTMLElement} options.map - map element
 * @param {Number[]} options.point - xy values in pixel
 * @param {Function} options.isNameValid - check marker name is valid
 * @param {Function} options.callback
 */
export const addMarker = ({
  map,
  point,
  isNameValid = () => true,
  callback = null,
}) => Item({
  text: 'Add Marker',
  onclick: () => {
    let markerName
    do {
      markerName = window.prompt(markerName ? 'Name exists' : 'Marker Name')
    } while (markerName && !isNameValid(markerName))
    if (markerName === null) return

    const marker = addMarkerByPoint({ point, map, title: markerName })
    callback?.(marker)
  },
})

/**
 * editByRawText.
 *
 * @param {HTMLElement} map
 */
export const editMapByRawText = (map) => Item({
  text: 'Edit by Raw Text',
  onclick: () => {
    const container = map.closest('.map-container')
    const maps = Array.from(container.querySelectorAll('.mapclay'))
    if (!maps) return false

    const rect = map.getBoundingClientRect()
    const textArea = document.createElement('textarea')
    textArea.className = 'edit-map'
    textArea.style.cssText = `width: ${rect.width}px; height: ${rect.height}px;`
    textArea.value = maps.map(map => map.dataset.mapclay ?? '')
      .join('\n---\n')
      .replaceAll(',', '\n')
      .replaceAll(/["{}]/g, '')
      .replaceAll(/:(\w)/g, ': $1')

    textArea.addEventListener('focusout', () => {
      const code = document.createElement('code')
      code.className = 'map'
      code.textContent = textArea.value
      container.dataset.render = 'no-delay'
      textArea.replaceWith(code)
    })
    container.replaceChildren(textArea)

    return true
  },
})

/**
 * editMap.
 *
 * @param {HTEMLElement} map
 * @param {Object} dumbymap
 */
export const editMap = (map, dumbymap) => {
  const options = Object.entries(dumbymap.aliases)
    .map(([option, aliases]) =>
      Folder({
        text: option,
        items: Object.entries(aliases)
          .map(([alias, value]) => {
            const aliasValue = value.value ?? value
            return Item({
              innerHTML: `<div>${alias}</div><div style="padding-left: 20px; color: gray; font-size: 1rem";">${aliasValue}</div>`,
              style: 'display: flex; justify-content: space-between; max-width: 20rem;',
              onclick: () => {
                const container = map.closest('.map-container')
                const configText = Array.from(container.querySelectorAll('.mapclay'))
                  .map(map => map.dataset.mapclay ?? '')
                  .join('\n---\n')
                const configList = parseConfigsFromYaml(configText)
                configList.find(config => config.id === map.id)[option] = aliasValue
                const code = document.createElement('code')
                code.className = 'map'
                code.textContent = configList.map(JSON.stringify).join('\n---\n')
                container.dataset.render = 'no-delay'
                container.replaceChildren(code)
              },
            })
          }),
      }),
    )
  return Folder({
    text: 'Edit Map',
    style: 'overflow: visible;',
    items: [
      editMapByRawText(map),
      ...options,
    ],
  })
}

/**
 * addLinkbyGeocoding.
 *
 * @param {Range} range
 */
export const addLinkbyGeocoding = (range) => {
  return Item({
    text: 'Add Link by Geocoding',
    className: ['keep-menu'],
    onclick: async (e) => {
      /** Add spinning circle for Network */
      e.target.classList.add('with-spinning-circle')
      const menu = e.target.closest('.dumby-menu')
      if (!menu) return

      /** Geocoding by Nominatim */
      // TODO Add more params like limit:
      // https://nominatim.org/release-docs/latest/api/Search/
      const query = range.toString()
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query.toString()}&format=json`)
      const places = await response.json()
      menu.replaceChildren()

      // Show Message if no result found
      if (places.length === 0) {
        menu.appendChild(Item({ text: 'No Result Found' }))
        return
      }

      // Add items for each results
      const bbox = places.map(p => p.boundingbox).reduce((acc, cur) => [
        Math.min(acc[0], cur[0]),
        Math.max(acc[1], cur[1]),
        Math.min(acc[2], cur[2]),
        Math.max(acc[3], cur[3]),
      ])
      const bounds = [[bbox[2], bbox[0]], [bbox[3], bbox[1]]]
      const items = places.map(geocodingResult(bounds, (a) => {
        a.className = 'not-geolink from-geocoding'
        a.textContent = query
        range.deleteContents()
        range.insertNode(a)
      }))
      menu.replaceChildren(...items)
      shiftByWindow(menu)
    },
  })
}

/**
 * geocodingResult.
 *
 * @param {Array<Number[]>} bounds - boundingbox in format: [minLon, minLat, maxLon, maxLat]
 * @param {Function} callback
 */
export const geocodingResult = (bounds, callback) => (result) => {
  const item = Item({
    text: result.display_name,
    onclick: (e) => {
      e.target.classList.add('clicked')

      const a = document.createElement('a')
      a.href = `geo:${result.lat},${result.lon}` +
        `?name=${result.name}` +
        `&osm=${result.osm_type}/${result.osm_id}`
      a.title = result.display_name
      callback(a)
    },
  })

  const xy = [result.lon, result.lat]

  const markers = getMarkersFromMaps(xy, {
    type: 'circle',
    title: result.display_name,
  })
  const bbox = result.boundingbox
  const resultBounds = [[bbox[2], bbox[0]], [bbox[3], bbox[1]]]

  item.onmouseover = () => {
    markers.forEach(async marker => {
      const renderer = marker.closest('.mapclay')?.renderer
      await renderer.updateCamera({ bounds, duration: 1000, animation: true, padding: 20 })
      await renderer.updateCamera({ center: xy, duration: 600, animation: true })
      await renderer.updateCamera({ bounds: resultBounds, duration: 1500, animation: true, padding: 20 })
    })
  }

  setTimeout(() => {
    onRemove(item.closest('.menu'), () => {
      if (item.classList.contains('clicked')) return
      markers.forEach(marker => marker.remove())
    }),
    100
  })

  return item
}
