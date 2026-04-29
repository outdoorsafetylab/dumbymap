import * as mapclay from 'mapclay'
import { htmlToMd, md2dumbyBlocks } from './markdown.mjs'
export { htmlToMd, splitMd, md2dumbyBlocks } from './markdown.mjs'
import { onRemove, animateRectTransition, throttle, debounce, shiftByWindow } from './utils.mjs'
import { Layout, SideBySide, Overlay, Sticky } from './Layout.mjs'
import { GeoLink, DocLink, getMarkersByGeoLink } from './Link.mjs'
import * as utils from './dumbyUtils.mjs'
import * as menuItem from './MenuItem.mjs'
import PlainModal from 'plain-modal'
import proj4 from 'proj4'
import { register, fromEPSGCode } from 'ol/proj/proj4'

/** VAR: CSS Selector for main components */
const mapBlockSelector = 'pre:has(code[class*=map]), .mapclay-container'
const docLinkSelector = 'a[href^="#"][title^="=>"]:not(.doclink)'
const geoLinkSelector = 'a[href^="geo:"]:not(.geolink)'

/** VAR: Default Layouts */
const defaultLayouts = [
  new Layout({ name: 'normal' }),
  new SideBySide({ name: 'side-by-side' }),
  new Overlay({ name: 'overlay' }),
  new Sticky({ name: 'sticky' }),
]

/** VAR: Cache across every dumbymap generation */
const mapCache = {}

/**
 * updateAttributeByStep.
 * @description Update data attribute by steps of map render
 * @param {Object} - renderer which is running steps
 */
const updateAttributeByStep = ({ results, target, steps }) => {
  let passNum = results.filter(
    r => r.type === 'render' && r.state.match(/success|skip/),
  ).length
  const total = steps.length
  passNum += `/${total}`

  const final = results.filter(r => r.type === 'render').length === total

  // FIXME HACK use MutationObserver for animation
  if (!target.animations) target.animations = Promise.resolve()
  target.animations = target.animations.then(async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
    if (final) passNum += '\x20'
    target.dataset.report = passNum

    if (final) setTimeout(() => delete target.dataset.report, 100)
  })
}

/** Assign a unique ID to a map config, derived from its renderer name */
export const assignMapId = (config) => {
  const mapIdList = Array.from(document.querySelectorAll('.mapclay'))
    .map(map => map.id)
    .filter(id => id)
  let mapId = config.id?.replaceAll('\x20', '_')
  if (!mapId) {
    mapId = config.use?.split('/')?.at(-1)
    let counter = 1
    while (!mapId || mapIdList.includes(mapId)) {
      mapId = `${config.use ?? 'unnamed'}-${counter}`
      counter++
    }
  }
  config.id = mapId
  mapIdList.push(mapId)
  return config
}

/** Get default render method by converter */
const defaultRender = mapclay.renderWith(config => ({
  use: config.use ?? 'Leaflet',
  width: '100%',
  ...config,
  aliases: {
    ...mapclay.defaultAliases,
    ...(config.aliases ?? {}),
  },
  stepCallback: updateAttributeByStep,
}))

/** SETUP: Initialize container element for DumbyMap, clearing existing children and creating .SemanticHtml */
export const setupContainer = (container, { crs = 'EPSG:4326', initialLayout } = {}) => {
  container.innerHTML = ''
  container.classList.add('Dumby')
  delete container.dataset.layout
  container.dataset.crs = crs
  container.dataset.layout = initialLayout ?? defaultLayouts.at(0).name
  register(proj4)
  const htmlHolder = document.createElement('div')
  htmlHolder.classList.add('SemanticHtml')
  container.appendChild(htmlHolder)
}

/** SETUP: Create and append Showcase element to container */
export const createShowcase = (container) => {
  const showcase = document.createElement('div')
  container.appendChild(showcase)
  showcase.classList.add('Showcase')
  return showcase
}

/** SETUP: Create and append modal to container */
export const createModal = (container) => {
  const modalContent = document.createElement('div')
  container.appendChild(modalContent)
  const modal = new PlainModal(modalContent)
  return { modal, modalContent }
}

/** SETUP: Build and return the dumbymap object */
export const buildDumbymap = (container, { modal, modalContent, layouts = [] }) => {
  const dumbymap = {
    layouts: [...defaultLayouts, ...layouts.map(l => typeof l === 'object' ? l : { name: l })],
    container,
    get htmlHolder () { return container.querySelector('.SemanticHtml') },
    get showcase () { return container.querySelector('.Showcase') },
    get blocks () { return Array.from(container.querySelectorAll('.dumby-block')) },
    modal,
    modalContent,
    aliases: {},
    utils: {
      ...utils,
      renderedMaps: () =>
        Array.from(
          container.querySelectorAll('.mapclay[data-render=fulfilled]'),
        ).sort((a, b) => Number(a.style.order) - Number(b.style.order)),
      setContextMenu: (menuCallback) => {
        const originalCallback = container.oncontextmenu
        container.oncontextmenu = (e) => {
          const menu = originalCallback(e)
          if (!menu) return

          menuCallback(e, menu)
          menu.style.transform = ''
          shiftByWindow(menu)
        }
      },
      focusNextMap: throttle(utils.focusNextMap, utils.focusDelay),
      switchToNextLayout: throttle(utils.switchToNextLayout, 300),
    },
  }
  // Bind all utils functions to dumbymap so they can reference it via `this`.
  // Functions imported from dumbyUtils.mjs (focusNextMap, focusNextBlock, etc.) use `this`
  // and require binding. Closure-based utils (renderedMaps, setContextMenu) don't use `this`
  // but are harmlessly re-bound here for uniformity.
  Object.entries(dumbymap.utils).forEach(([util, value]) => {
    if (typeof value === 'function') {
      dumbymap.utils[util] = value.bind(dumbymap)
    }
  })
  return dumbymap
}

/** OBSERVERS: Watch text content of Semantic HTML for geo-scheme text and map re-renders */
export const setupContentObserver = (container, { renderMap }) => {
  new window.MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const node = mutation.target
      if (node.matches?.('.mapclay') || node.closest?.('.mapclay')) return

      // Add GeoLinks from plain texts
      utils.addGeoSchemeByText(node)

      // Render Map
      const mapTarget = node.parentElement?.closest(mapBlockSelector)
      if (mapTarget) {
        renderMap(mapTarget)
      }
    }
  }).observe(container, {
    characterData: true,
    subtree: true,
  })
}

/** OBSERVERS: Watch children and attribute changes for block counts, links, and map renders */
export const setupChildObserver = (container, { renderMap, addGeoLinksByText }) => {
  new window.MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const target = mutation.target
      if (target.matches?.('.mapclay') || target.closest?.('.mapclay')) continue

      // In case observer triggered by data attribute
      if (mutation.type === 'attributes') {
        delete target.dataset.initDumby
      }

      // Update dumby block
      const dumbyBlockChanges = target.querySelectorAll('.dumby-block')
      if (dumbyBlockChanges) {
        const blocks = container.querySelectorAll('.dumby-block')
        blocks.forEach(b => {
          b.dataset.total = blocks.length
        })
      }

      // Add GeoLinks/DocLinks by pattern
      target.querySelectorAll(geoLinkSelector)
        .forEach(GeoLink)
      target.querySelectorAll(docLinkSelector)
        .forEach(DocLink)

      // Add GeoLinks from text nodes
      if (mutation.type === 'attributes') {
        addGeoLinksByText(target)
      }

      // Render code blocks for maps
      const mapTargets = [
        ...target.querySelectorAll(mapBlockSelector),
        target.closest(mapBlockSelector),
      ].filter(t => t)
      mapTargets.forEach(renderMap)
    }
  }).observe(container, {
    attributes: true,
    attributeFilter: ['data-init-dumby'],
    childList: true,
    subtree: true,
  })
}

/** OBSERVERS: Watch layout changes and apply enter/leave handlers */
export const setupLayoutObserver = (container, dumbymap) => {
  new window.MutationObserver(mutations => {
    const mutation = mutations.at(-1)
    const oldLayout = mutation.oldValue
    const newLayout = container.dataset.layout

    // Apply handler for leaving/entering layouts
    if (oldLayout) {
      dumbymap.layouts
        .find(l => l.name === oldLayout)
        ?.leaveHandler?.(dumbymap)
    }

    Object.values(dumbymap)
      .filter(ele => ele instanceof window.HTMLElement)
      .forEach(ele => { ele.style.cssText = '' })

    if (newLayout) {
      dumbymap.layouts
        .find(l => l.name === newLayout)
        ?.enterHandler?.(dumbymap)
    }

    // Since layout change may show/hide showcase, the current focused map may need to go into/outside showcase
    // Reset attribute triggers MutationObserver which is observing it
    const focusMap =
      container.querySelector('.mapclay.focus') ??
      container.querySelector('.mapclay')
    focusMap?.classList?.add('focus')
  }).observe(container, {
    attributes: true,
    attributeFilter: ['data-layout'],
    attributeOldValue: true,
  })
}

/** EVENTS: Set up context menu handler */
export const setupContextMenu = (container, dumbymap, editBlockItem) => {
  container.oncontextmenu = e => {
    /** Check if OK to show custom menu over context menu */
    if (container.dataset.menu === 'disabled') return

    container.querySelectorAll('.dumby-menu').forEach(m => m.remove())
    const map = e.target.closest('.mapclay')
    const block = e.target.closest('.dumby-block')
    const linkWithLine = e.target.closest('.with-leader-line')
    const rangeSelected = document.getSelection().type === 'Range'
    if (!block && !map && !linkWithLine && !rangeSelected) return
    e.preventDefault()

    /** Add HTMLElement for menu */
    const menu = document.createElement('div')
    menu.setAttribute('popover', 'auto')
    menu.classList.add('menu', 'dumby-menu')
    menu.onclick = (e) => {
      if (e.target.closest('.keep-menu')) return
      menu.hidePopover()
    }
    container.appendChild(menu)

    /** Menu Item for editing block - always first */
    if (block?.dataset.blockIndex != null) {
      menu.appendChild(editBlockItem(block))
    }

    const showMenu = () => {
      if (menu.childElementCount === 0) return
      menu.style.left = (e.clientX + 10) + 'px'
      menu.style.top = (e.clientY + 5) + 'px'
      // Defer showPopover so it runs after pointerup, which on Linux fires
      // after contextmenu and would otherwise trigger popover light-dismiss
      setTimeout(() => {
        if (!menu.isConnected) return
        menu.showPopover()
        shiftByWindow(menu)
      }, 0)
      return menu
    }

    /** Menu Item for Geocoding */
    if (rangeSelected) {
      // TODO check click is inside selection
      const range = document.getSelection().getRangeAt(0)
      menu.appendChild(menuItem.addLinkbyGeocoding(range))
      return showMenu()
    }

    /** Menu Item for editing map */
    const mapEditor = e.target.closest('.edit-map')
    if (mapEditor) {
      menu.appendChild(menuItem.Item({
        text: 'Finish Editing',
        onclick: () => mapEditor.blur(),
      }))
      return showMenu()
    }

    /** Menu Items for Links */
    const geoLink = e.target.closest('.geolink')
    if (geoLink) {
      if (geoLink.classList.contains('from-text') || geoLink.classList.contains('from-geocoding')) {
        menu.appendChild(menuItem.Item({
          innerHTML: '<strong style="color: red;">DELETE</strong>',
          onclick: () => {
            getMarkersByGeoLink(geoLink).forEach(m => m.remove())

            // For geocoding links a paired sibling anchor may exist; remove only this one
            const pairedSibling = geoLink.classList.contains('from-geocoding') && [
              geoLink.previousElementSibling,
              geoLink.nextElementSibling,
            ].find(a => a?.classList.contains('from-geocoding') && a.textContent === geoLink.textContent)

            if (pairedSibling) {
              geoLink.remove()
            } else {
              geoLink.replaceWith(document.createTextNode(geoLink.textContent))
            }
          },
        }))
      }
      menu.appendChild(menuItem.setGeoLinkType(geoLink))
    }

    if (linkWithLine) {
      menu.appendChild(menuItem.setLeaderLineType(linkWithLine))
      return showMenu()
    }

    /** Menu Items for map */
    if (map) {
      const rect = map.getBoundingClientRect()
      const [x, y] = [e.x - rect.left, e.y - rect.top]
      menu.appendChild(menuItem.simplePlaceholder(`MAP ID: ${map.id}`))
      menu.appendChild(menuItem.editMap(map, dumbymap))
      menu.appendChild(menuItem.renderResults(dumbymap, map))

      if (map.dataset.render === 'fulfilled') {
        menu.appendChild(menuItem.toggleMapFocus(map))
        menu.appendChild(menuItem.Folder({
          text: 'Actions',
          items: [
            menuItem.getCoordinatesByPixels(map, [x, y]),
            menuItem.restoreCamera(map),
            menuItem.addMarker({
              point: [e.clientX, e.clientY],
              map,
            }),
          ],
        }))
      }
    } else {
      /** Toggle block focus */
      if (block) {
        menu.appendChild(menuItem.toggleBlockFocus(block))
      }
    }

    /** Menu Items for picking map/block/layout */
    if (!map || map.closest('.Showcase')) {
      if (dumbymap.utils.renderedMaps().length > 0) {
        menu.appendChild(menuItem.pickMapItem(dumbymap))
      }
      menu.appendChild(menuItem.pickBlockItem(dumbymap))
      menu.appendChild(menuItem.pickLayoutItem(dumbymap))
    }

    return showMenu()
  }
}

/** EVENTS: Set up mouse drag handler for GeoLink creation */
export const setupMouseDrag = (container) => {
  container.ondragstart = () => false
  container.onmousedown = (e) => {
    // Check should start drag event for GeoLink
    const selection = document.getSelection()
    if (e.which !== 1 || selection.type !== 'Range') return

    // Check if click is inside selection
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const mouseInRange = e.clientX < rect.right && e.clientX > rect.left && e.clientY < rect.bottom && e.clientY > rect.top
    if (!mouseInRange) return

    const pointByArrow = document.createElement('div')
    pointByArrow.className = 'point-by-arrow'
    container.appendChild(pointByArrow)

    const timer = setTimeout(() => {
      utils.addGeoLinkByDrag(container, range, pointByArrow)
    }, 300)

    // Update leader-line with mouse move
    container.onmousemove = (event) => {
      const rect = container.getBoundingClientRect()
      pointByArrow.style.left = `${event.clientX - rect.left}px`
      pointByArrow.style.top = `${event.clientY - rect.top}px`
      // TODO Scroll dumbymap.htmlHolder when cursor is at upper/lower side
    }
    container.onmousemove(e)
    container.onmouseup = () => {
      clearTimeout(timer)
      pointByArrow.remove()
      container.onmouseup = null
      container.onmousemove = null
    }
  }
}

/** EVENTS: Set up keyboard navigation handler */
export const setupKeybindings = (container, dumbymap) => {
  const onKeydown = e => {
    if (document.activeElement.matches('textarea, input')) return
    if (e.key === 'Tab') {
      e.preventDefault()
      dumbymap.utils.focusNextMap(e.shiftKey)
    } else if (e.key === 'x' || e.key === 'X') {
      e.preventDefault()
      dumbymap.utils.switchToNextLayout(e.shiftKey)
    } else if (e.key === 'n') {
      e.preventDefault()
      dumbymap.utils.focusNextBlock()
    } else if (e.key === 'p') {
      e.preventDefault()
      dumbymap.utils.focusNextBlock(true)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      dumbymap.utils.removeBlockFocus()
    }
  }
  document.addEventListener('keydown', onKeydown)
  onRemove(container, () => document.removeEventListener('keydown', onKeydown))
}

/** CONFIG: Fetch and apply default YAML aliases to dumbymap */
export const fetchDefaultAliases = (url, dumbymap) => {
  if (!url) return
  fetch(url)
    .then(res => res.text())
    .then(rawText => {
      const config = mapclay.parseConfigsFromYaml(rawText)?.at(0)
      Object.entries(config.aliases)
        .forEach(([option, aliases]) => {
          dumbymap.aliases[option] = aliases
        })
    })
    .catch(err => console.warn(`Fail to get aliases from ${url}`, err))
}

/**
 * Generates maps based on the provided configuration
 *
 * @param {HTMLElement} container - The container element for the maps
 * @param {Object} options
 * @param {string} [options.markdown] - Markdown string to render; falls back to container's current children
 * @param {string} options.crs - CRS in EPSG/ESRI code, see epsg.io
 * @param {string} options.initialLayout
 * @param {number} [options.delay=1000] mapDelay - Delay before rendering maps (in milliseconds)
 * @param {Function} options.render - Render function for maps
 * @param {Function} options.renderCallback - Callback function to be called after map rendering
 * @param {String | null} options.defaultApply
 * @param {boolean} [options.urlParams=false] - If true, reads `?layout=` query param and sets data-layout on container
 */
export const generateMaps = (container, {
  markdown,
  crs = 'EPSG:4326',
  initialLayout,
  layouts = [],
  mapDelay = 1000,
  render = defaultRender,
  renderCallback = () => null,
  defaultApply = '../assets/taiwan.yml',
  urlParams = true,
} = {}) => {
  if (container.classList.contains('Dumby')) return

  const mdContent = markdown ?? htmlToMd(container)

  setupContainer(container, { crs, initialLayout })

  const htmlHolder = container.querySelector('.SemanticHtml')
  htmlHolder.innerHTML = md2dumbyBlocks(mdContent)

  const showcase = createShowcase(container)
  const { modal, modalContent } = createModal(container)
  const dumbymap = buildDumbymap(container, { modal, modalContent, layouts })

  /**
   * LINKS: addGeoLinksByText. Scan plain-text geo coordinates in node, convert to GeoLinks.
   * Waits for the CRS projection to be registered before transforming coordinates.
   *
   * @param {Node} node
   */
  function addGeoLinksByText (node) {
    // Kick off coordinate scanning and CRS registration in parallel
    const addGeoScheme = utils.addGeoSchemeByText(node)
    const crsString = container.dataset.crs

    // Once both are ready, transform coordinates to WGS84 and wire up GeoLink behaviour
    Promise.all([fromEPSGCode(crsString), addGeoScheme]).then((values) => {
      values.at(-1)
        .map(utils.updateGeoSchemeByCRS(crsString))
        .filter(link => link)
        .forEach(GeoLink)
    })
  }

  /**
   * MAP: Create a MutationObserver that moves a map into/out of Showcase when its focus class changes.
   * Each rendered map gets its own observer instance so mutations are scoped to one element.
   */
  const createMapClassObserver = () =>
    new window.MutationObserver(mutations => {
      const mutation = mutations.at(-1)
      const target = mutation.target
      const focus = target.classList.contains('focus')
      const shouldBeInShowcase = focus && showcase.checkVisibility()

      if (focus) {
        // Enforce single-focus: remove focus from all other rendered maps
        dumbymap.utils
          .renderedMaps()
          .filter(map => map.id !== target.id)
          .forEach(map => map.classList.remove('focus'))

        // focus-manual is a transient class used to scroll the map into view; clear it after delay
        if (target.classList.contains('focus-manual')) {
          setTimeout(
            () => target.classList.remove('focus-manual'),
            2000,
          )
        }
      }

      if (shouldBeInShowcase) {
        if (showcase.contains(target)) return

        // Insert a size-matched placeholder so the block doesn't collapse while the map is in Showcase
        const placeholder = target.cloneNode(true)
        delete placeholder.id
        placeholder.className = ''

        const parent = target.parentElement
        parent.replaceChild(placeholder, target)
        onRemove(placeholder, () => {
          // Guard: skip if startViewTransition already returned the map to the DOM
          // (target still in .Showcase means it still needs moving back)
          if (!target.isConnected || target.closest('.Showcase')) {
            parent.appendChild(target)
          }
        })

        // FIXME Maybe use @start-style for CSS
        // Trigger CSS transition, if placeholde is the olny child element in block,
        // reduce its height to zero.
        // To make sure the original height of placeholder is applied, DOM changes seems needed
        // then set data-attribute for CSS selector to change height to 0
        placeholder.getBoundingClientRect()
        placeholder.dataset.placeholder = target.id

        // Strip inline styles so the map stretches to fit the Showcase, preserving only order
        target.style.cssText = ''
        target.style.order = placeholder.style.order
        showcase.appendChild(target)

        // Animate from placeholder position back to its new Showcase position
        animateRectTransition(target, placeholder.getBoundingClientRect(), {
          duration: 300,
          resume: true,
        })
      } else if (showcase.contains(target)) {
        // Map is losing focus: locate its placeholder and animate it back into the Semantic HTML
        const placeholder = dumbymap.htmlHolder.querySelector(
          `[data-placeholder="${target.id}"]`,
        )
        if (!placeholder) { throw Error(`Cannot find placeholder for map "${target.id}"`) }

        // Fallback: restore styles even if the animation promise is rejected
        const afterAnimation = () => {
          target.style = placeholder.style.cssText
          placeholder.remove()
        }

        // Animate from Showcase toward placeholder position while still in showcase, then move back
        animateRectTransition(target, placeholder.getBoundingClientRect(), {
          duration: 300,
        }).finished.finally(afterAnimation)
      }
    })

  /**
   * MAP: afterMapRendered. callback of each map rendered
   *
   * @param {Object} renderer
   */
  const afterMapRendered = renderer => {
    const mapElement = renderer.target
    // FIXME
    mapElement.renderer = renderer
    // Make map not focusable by tab key
    mapElement.tabindex = -1

    // Cache if render is fulfilled
    if (mapElement.dataset.render === 'fulfilled') {
      mapCache[mapElement.id] = renderer
      mapElement.style.order = String(
        Array.from(container.querySelectorAll('.mapclay')).indexOf(mapElement),
      )
    } else {
      return
    }

    // Simple callback by caller
    renderCallback?.(renderer)

    // Watch change of class
    const observer = createMapClassObserver()
    observer.observe(mapElement, {
      attributes: true,
      attributeFilter: ['class'],
      attributeOldValue: true,
    })

    // Focus current map is no map is focused
    if (
      !dumbymap.utils.renderedMaps().find(map => map.classList.contains('focus')) ||
      container.querySelectorAll('.mapclay.focus').length === 0
    ) {
      mapElement.classList.add('focus')
    }
  }

  /**
   * MAP: Render each target element for maps by text content in YAML
   *
   * @param {HTMLElement} target
   */
  function renderMap (target) {
    if (!target.isConnected) return
    target.classList.add('map-container')

    // Get text in code block starts with markdown text '```map'
    const configText = target
      .textContent // BE CAREFUL!!! 0xa0 char is "non-breaking spaces" in HTML text content
      // replace it by normal space
      .replace(/\u00A0/g, '\u0020')

    let configList = []
    try {
      configList = mapclay.parseConfigsFromYaml(configText).map(assignMapId)
    } catch (_) {
      console.warn('Fail to parse yaml config for element', target)
      return
    }

    // If map in cache has the same ID, just put it into target
    // So user won't feel anything changes when editing markdown
    configList.forEach(config => {
      const cachedRenderer = mapCache[config.id]
      if (!cachedRenderer) return

      target.appendChild(cachedRenderer.target)
      config.target = cachedRenderer.target
    })

    // trivial: if map cache is applied, do not show yaml text
    if (target.querySelector('.mapclay')) {
      target
        .querySelectorAll(':scope > :not([data-render=fulfilled])')
        .forEach(e => e.remove())
    }

    if (!target.renderMap || target.dataset.render === 'no-delay') {
      target.renderMap = debounce(
        (configList) => {
          // Render maps
          render(target, configList).forEach(renderPromise => {
            renderPromise.then(afterMapRendered)
          })
          Array.from(target.children).forEach(e => {
            if (e.dataset.render === 'fulfilled') {
              afterMapRendered(e.renderer)
            }
          })
        }, target.dataset.render === 'no-delay' ? 0 : mapDelay,
      )
    }
    target.renderMap(configList)
  }

  setupContentObserver(container, { renderMap })
  setupChildObserver(container, { renderMap, addGeoLinksByText })
  setupLayoutObserver(container, dumbymap)

  if (urlParams) {
    // Apply ?layout= query param on load
    const params = new URLSearchParams(window.location.search)
    const layoutParam = params.get('layout')
    if (layoutParam) container.dataset.layout = layoutParam

    // Keep the URL in sync whenever the active layout changes
    new window.MutationObserver(mutations => {
      const newLayout = mutations.at(-1).target.dataset.layout
      const url = new URL(window.location)
      url.searchParams.set('layout', newLayout)
      window.history.replaceState(null, '', url)
    }).observe(container, {
      attributes: true,
      attributeFilter: ['data-layout'],
    })
  }

  container.dataset.initDumby = 'true'

  /** BLOCK EDITING: inline edit modal for each .dumby-block */
  const editBlockItem = menuItem.setupBlockEdit(dumbymap, { container, htmlHolder, md2dumbyBlocks })

  setupContextMenu(container, dumbymap, editBlockItem)
  setupMouseDrag(container)
  setupKeybindings(container, dumbymap)
  fetchDefaultAliases(defaultApply, dumbymap)

  /** Return Object for utils */
  return Object.seal(dumbymap)
}

// Auto-init: if loaded via <script type="module" src="dumbymap.mjs"> with no inline body
const thisScript = [...document.querySelectorAll('script[src]')]
  .find(s => new URL(s.src).href === import.meta.url)
if (thisScript && !thisScript.textContent.trim()) {
  const base = new URL('.', import.meta.url).href
  for (const href of ['css/dumbymap.css', 'css/style.css']) {
    document.head.appendChild(
      Object.assign(document.createElement('link'), { rel: 'stylesheet', href: base + href })
    )
  }
  const markdown = [...document.body.childNodes]
    .filter(n => n.nodeType === Node.TEXT_NODE)
    .map(n => n.textContent)
    .join('')
  window.dumbymap = generateMaps(document.body, { markdown })
}
