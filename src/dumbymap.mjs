import MarkdownIt from 'markdown-it'
import MarkdownItAnchor from 'markdown-it-anchor'
import MarkdownItFootnote from 'markdown-it-footnote'
import MarkdownItFrontMatter from 'markdown-it-front-matter'
import MarkdownItInjectLinenumbers from 'markdown-it-inject-linenumbers'
import * as mapclay from 'mapclay'
import { onRemove, animateRectTransition, throttle, debounce, shiftByWindow } from './utils'
import { Layout, SideBySide, Overlay, Sticky } from './Layout'
import { GeoLink, DocLink, getMarkersFromMaps } from './Link.mjs'
import * as utils from './dumbyUtils'
import * as menuItem from './MenuItem'
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
 * Converts Markdown content to HTML and prepares it for DumbyMap rendering
 *
 * @param {HTMLElement} container - Target Element to include generated HTML contents
 * @param {string} mdContent - Texts in Markdown format
 * @returns {Object} An object representing the DumbyMap instance
 */
export const markdown2HTML = (container, mdContent) => {
  /** Prepare Elements for Container */
  container.querySelector('.SemanticHtml')?.remove()

  /** Prepare MarkdownIt Instance */
  const md = MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
  })
    .use(MarkdownItAnchor, {
      permalink: MarkdownItAnchor.permalink.linkInsideHeader({
        placement: 'before',
      }),
    })
    .use(MarkdownItFootnote)
    .use(MarkdownItFrontMatter)
    .use(MarkdownItInjectLinenumbers)

  /** Custom rule for Blocks in DumbyMap */
  // FIXME A better way to generate blocks
  md.renderer.rules.dumby_block_open = () => '<article class="dumby-block">'
  md.renderer.rules.dumby_block_close = () => '</article>'
  md.core.ruler.before('block', 'dumby_block', state => {
    state.tokens.push(new state.Token('dumby_block_open', '', 1))
  })
  // Add close tag for block with more than 2 empty lines
  md.block.ruler.before('table', 'dumby_block', (state, startLine) => {
    if (
      state.src[state.bMarks[startLine - 1]] === '\n' &&
      state.src[state.bMarks[startLine - 2]] === '\n' &&
      state.tokens.at(-1).type !== 'list_item_open' // Quick hack for not adding tag after "::marker" for <li>
    ) {
      state.push('dumby_block_close', '', -1)
      state.push('dumby_block_open', '', 1)
    }
  })

  md.core.ruler.after('block', 'dumby_block', state => {
    state.tokens.push(new state.Token('dumby_block_close', '', -1))
  })

  /** Render HTML */
  const htmlHolder = document.createElement('div')
  htmlHolder.className = 'SemanticHtml'
  htmlHolder.innerHTML = md.render(mdContent)
  container.appendChild(htmlHolder)

  return container
}

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

/**
 * Generates maps based on the provided configuration
 *
 * @param {HTMLElement} container - The container element for the maps
 * @param {Object} options - Configuration options
 * @param {string} options.crs - CRS in EPSG/ESRI code, see epsg.io
 * @param {number} [options.delay=1000] - Delay before rendering maps (in milliseconds)
 * @param {Function} options.mapCallback - Callback function to be called after map rendering
 */
export const generateMaps = (container, {
  crs = 'EPSG:4326',
  initialLayout,
  layouts = [],
  mapDelay = 1000,
  renderCallback,
  contentSelector,
  render = defaultRender,
} = {}) => {
  /** Prepare: Contaner */
  if (container.classList.contains('Dumby')) return
  container.classList.add('Dumby')
  delete container.dataset.layout
  container.dataset.crs = crs
  container.dataset.layout = initialLayout ?? defaultLayouts.at(0).name
  register(proj4)

  /** Prepare: Semantic HTML part and blocks of contents inside */
  const htmlHolder = container.querySelector(contentSelector) ??
    container.querySelector('.SemanticHtml, main, :scope > article') ??
    Array.from(container.children).find(e => e.id?.match(/main|content/) || e.className?.match?.(/main|content/)) ??
    Array.from(container.children).sort((a, b) => a.textContent.length < b.textContent.length).at(0)
  htmlHolder.classList.add('SemanticHtml')

  /** Prepare: Showcase */
  const showcase = document.createElement('div')
  container.appendChild(showcase)
  showcase.classList.add('Showcase')

  /** Prepare: Other Variables */
  const modalContent = document.createElement('div')
  container.appendChild(modalContent)
  const modal = new PlainModal(modalContent)

  /** VAR: dumbymap Object */
  const dumbymap = {
    layouts: [...defaultLayouts, ...layouts.map(l => typeof l === 'object' ? l : { name: l })],
    container,
    get htmlHolder () { return container.querySelector('.SemanticHtml') },
    get showcase () { return container.querySelector('.Showcase') },
    get blocks () { return Array.from(container.querySelectorAll('.dumby-block')) },
    modal,
    modalContent,
    utils: {
      ...utils,
      renderedMaps: () =>
        Array.from(
          container.querySelectorAll('.mapclay[data-render=fulfilled]'),
        ).sort((a, b) => a.style.order > b.style.order),
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
  Object.entries(dumbymap.utils).forEach(([util, value]) => {
    if (typeof value === 'function') {
      dumbymap.utils[util] = value.bind(dumbymap)
    }
  })

  /** WATCH: text content of Semantic HTML */
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

  /** WATCH: children of Semantic HTML */
  new window.MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const target = mutation.target
      if (target.matches?.('.mapclay') || target.closest?.('.mapclay')) return

      // In case observer triggered by data attribute
      if (mutation.type === 'attribute') {
        delete target.dataset.initDumby
      }

      // Update dumby block
      const dumbyBlockChanges = [...mutation.addedNodes, ...mutation.removedNodes]
        .find(node => node.classList?.contains('dumby-block'))
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
      // const addedNodes = Array.from(mutation.addedNodes)
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

  container.dataset.initDumby = 'true'

  /** WATCH: Layout changes */
  new window.MutationObserver(mutations => {
    const mutation = mutations.at(-1)
    const oldLayout = mutation.oldValue
    const newLayout = container.dataset.layout

    // Apply handler for leaving/entering layouts
    if (oldLayout) {
      dumbymap.layouts
        .find(l => l.name === oldLayout)
        ?.leaveHandler?.call(this, dumbymap)
    }

    Object.values(dumbymap)
      .filter(ele => ele instanceof window.HTMLElement)
      .forEach(ele => { ele.style.cssText = '' })

    if (newLayout) {
      dumbymap.layouts
        .find(l => l.name === newLayout)
        ?.enterHandler?.call(this, dumbymap)
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

  /**
   * LINKS: addGeoLinksByText.
   *
   * @param {Node} node
   */
  function addGeoLinksByText (node) {
    const addGeoScheme = utils.addGeoSchemeByText(node)
    const crsString = container.dataset.crs
    Promise.all([fromEPSGCode(crsString), addGeoScheme]).then((values) => {
      values.at(-1)
        .map(utils.updateGeoSchemeByCRS(crsString))
        .filter(link => link)
        .forEach(GeoLink)
    })
  }

  /**
   * MAP: mapFocusObserver. observe for map focus
   * @return {MutationObserver} observer
   */
  const mapClassObserver = () =>
    new window.MutationObserver(mutations => {
      const mutation = mutations.at(-1)
      const target = mutation.target
      const focus = target.classList.contains('focus')
      const shouldBeInShowcase = focus && showcase.checkVisibility()

      if (focus) {
        dumbymap.utils
          .renderedMaps()
          .filter(map => map.id !== target.id)
          .forEach(map => map.classList.remove('focus'))

        if (target.classList.contains('focus-manual')) {
          setTimeout(
            () => target.classList.remove('focus-manual'),
            2000,
          )
        }
      }

      if (shouldBeInShowcase) {
        if (showcase.contains(target)) return

        // Placeholder for map in Showcase, it should has the same DOMRect
        const placeholder = target.cloneNode(true)
        delete placeholder.id
        placeholder.className = ''

        const parent = target.parentElement
        parent.replaceChild(placeholder, target)
        onRemove(placeholder, () => {
          parent.appendChild(target)
        })

        // FIXME Maybe use @start-style for CSS
        // Trigger CSS transition, if placeholde is the olny child element in block,
        // reduce its height to zero.
        // To make sure the original height of placeholder is applied, DOM changes seems needed
        // then set data-attribute for CSS selector to change height to 0
        placeholder.getBoundingClientRect()
        placeholder.dataset.placeholder = target.id

        // To fit showcase, remove all inline style
        target.style.cssText = ''
        target.style.order = placeholder.style.order
        showcase.appendChild(target)

        // Resume rect from Semantic HTML to Showcase, with animation
        animateRectTransition(target, placeholder.getBoundingClientRect(), {
          duration: 300,
          resume: true,
        })
      } else if (showcase.contains(target)) {
        // Check placeholder is inside Semantic HTML
        const placeholder = dumbymap.htmlHolder.querySelector(
          `[data-placeholder="${target.id}"]`,
        )
        if (!placeholder) { throw Error(`Cannot find placeholder for map "${target.id}"`) }

        // Consider animation may fail, write callback
        const afterAnimation = () => {
          target.style = placeholder.style.cssText
          placeholder.remove()
        }

        // animation from Showcase to placeholder
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
    } else {
      return
    }

    // Simple callback by caller
    renderCallback?.(renderer)

    // Watch change of class
    const observer = mapClassObserver()
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

  // Set unique ID for map container
  function assignMapId (config) {
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
  //
  //   if (autoMap && elementsWithMapConfig.length === 0) {
  //     const mapContainer = document.createElement('pre')
  //     mapContainer.className = 'mapclay-container'
  //     mapContainer.textContent = '#Created by DumbyMap'
  //     mapContainer.style.cssText = 'display: none;'
  //     htmlHolder.insertBefore(mapContainer, htmlHolder.firstElementChild)
  //     elementsWithMapConfig.push(mapContainer)
  //   }
  //

  /**
   * MAP: Render each taget element for maps by text content in YAML
   *
   * @param {HTMLElement} target
   */
  function renderMap (target) {
    if (!target.isConnected) return

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

    if (!target.renderMap) {
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
        }, mapDelay,
      )
    }
    target.renderMap(configList)
  }

  /** MENU: Menu Items for Context Menu */
  container.oncontextmenu = e => {
    container.querySelectorAll('.dumby-menu').forEach(m => m.remove())
    const map = e.target.closest('.mapclay')
    const block = e.target.closest('.dumby-block')
    const linkWithLine = e.target.closest('.with-leader-line')
    if (!block && !map && !linkWithLine) return
    e.preventDefault()

    // Add menu element
    const menu = document.createElement('div')
    menu.classList.add('menu', 'dumby-menu')
    menu.onclick = (e) => {
      if (e.target.closest('.keep-menu')) return
      menu.remove()
    }
    container.appendChild(menu)
    const containerRect = container.getBoundingClientRect()
    new window.MutationObserver(() => {
      menu.style.display = 'block'
      menu.style.left = (e.pageX - containerRect.left + 10) + 'px'
      menu.style.top = (e.pageY - containerRect.top + 5) + 'px'
      clearTimeout(menu.timer)
    }).observe(menu, { childList: true })
    menu.timer = setTimeout(() => menu.remove(), 100)

    // Menu Items for Links
    const geoLink = e.target.closest('.geolink')
    if (geoLink) {
      if (geoLink.classList.contains('from-text')) {
        menu.appendChild(new menuItem.Item({
          innerHTML: '<strong style="color: red;">DELETE</strong>',
          onclick: () => {
            getMarkersFromMaps(geoLink)
              .forEach(m => m.remove())
            geoLink.replaceWith(
              document.createTextNode(geoLink.textContent),
            )
          },
        }))
      }
      menu.appendChild(menuItem.setGeoLinkType(geoLink))
    }

    if (linkWithLine) {
      menu.appendChild(menuItem.setLeaderLineType(linkWithLine))
      return
    }

    // Menu Items for map
    if (map?.dataset?.render === 'fulfilled') {
      const rect = map.getBoundingClientRect()
      const [x, y] = [e.x - rect.left, e.y - rect.top]
      menu.appendChild(menuItem.toggleMapFocus(map))
      menu.appendChild(menuItem.renderResults(dumbymap, map))
      menu.appendChild(new menuItem.Folder({
        text: 'Actions',
        items: [
          menuItem.getCoordinatesByPixels(map, [x, y]),
          menuItem.restoreCamera(map),
          menuItem.addMarker({
            point: [e.pageX, e.pageY],
            map,
          }),
        ],
      }))
    } else {
      // Toggle block focus
      if (block) {
        menu.appendChild(menuItem.toggleBlockFocus(block))
      }
    }

    // Menu Items for map/block/layout
    if (!map || map.closest('.Showcase')) {
      if (dumbymap.utils.renderedMaps().length > 0) {
        menu.appendChild(menuItem.pickMapItem(dumbymap))
      }
      menu.appendChild(menuItem.pickBlockItem(dumbymap))
      menu.appendChild(menuItem.pickLayoutItem(dumbymap))
    }

    shiftByWindow(menu)

    return menu
  }

  /** MENU: Event Handler when clicking outside of Context Manu */
  const actionOutsideMenu = e => {
    const menu = container.querySelector('.dumby-menu')
    if (!menu) return
    const keepMenu = e.target.closest('.keep-menu') || e.target.classList.contains('.keep-menu')
    if (keepMenu) return

    const rect = menu.getBoundingClientRect()
    if (
      e.clientX < rect.left ||
      e.clientX > rect.left + rect.width ||
      e.clientY < rect.top ||
      e.clientY > rect.top + rect.height
    ) {
      menu.remove()
    }
  }
  document.addEventListener('click', actionOutsideMenu)
  onRemove(container, () =>
    document.removeEventListener('click', actionOutsideMenu),
  )

  /** MOUSE: Drag/Drop on map for new GeoLink */
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

  /** Return Object for utils */
  return Object.seal(dumbymap)
}
