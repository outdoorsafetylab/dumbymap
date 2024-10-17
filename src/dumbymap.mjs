import MarkdownIt from 'markdown-it'
import MarkdownItAnchor from 'markdown-it-anchor'
import MarkdownItFootnote from 'markdown-it-footnote'
import MarkdownItFrontMatter from 'markdown-it-front-matter'
import MarkdownItInjectLinenumbers from 'markdown-it-inject-linenumbers'
import * as mapclay from 'mapclay'
import { replaceTextNodes, onRemove, animateRectTransition, throttle, shiftByWindow } from './utils'
import { Layout, SideBySide, Overlay, Sticky } from './Layout'
import * as utils from './dumbyUtils'
import * as menuItem from './MenuItem'
import PlainModal from 'plain-modal'
import proj4 from 'proj4'
import { register, fromEPSGCode } from 'ol/proj/proj4'
import LeaderLine from 'leader-line'

/** CSS Selector for main components */
const mapBlockSelector = 'pre:has(.language-map), .mapclay-container'
const docLinkSelector = 'a[href^="#"][title^="=>"]'
const geoLinkSelector = 'a[href^="geo:"]'

/** Default Layouts */
const defaultLayouts = [
  new Layout({ name: 'normal' }),
  new SideBySide({ name: 'side-by-side' }),
  new Overlay({ name: 'overlay' }),
  new Sticky({ name: 'sticky' }),
]

/** Cache across every dumbymap generation */
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
  container.replaceChildren()
  container.innerHTML = '<div class="SemanticHtml"></div>'
  const htmlHolder = container.querySelector('.SemanticHtml')

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
  md.renderer.rules.dumby_block_open = () => '<article>'
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
  htmlHolder.innerHTML = md.render(mdContent)

  return container
}

/**
 * defaultBlocks.
 * @description Default way to get blocks from Semantic HTML
 * @param {HTMLElement} root
 */
const defaultBlocks = root => {
  const articles = Array.from(root.querySelectorAll('article'))
  if (articles.length > 2) return articles

  const others = Array.from(
    root.querySelectorAll(':has(>p, >blockquote, >pre, >ul, >ol, >table, >details)'),
  )
    .map(e => {
      e.classList.add('dumby-block')
      return e
    })
    .filter(e => {
      const isContained = e.parentElement.closest('.dumby-block')
      if (isContained) e.classList.remove('dumby-block')
      return !isContained
    })

  return others
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
  delay,
  renderCallback,
  addBlocks = defaultBlocks,
  autoMap = false,
  render = defaultRender,
} = {}) => {
  /** Prepare Contaner */
  container.classList.add('Dumby')
  delete container.dataset.layout

  /** Prepare Semantic HTML part and blocks of contents inside */
  const htmlHolder = container.querySelector('.SemanticHtml') ??
    Array.from(container.children).find(e => e.id?.includes('main') || e.className.includes('main')) ??
    Array.from(container.children).sort((a, b) => a.textContent.length < b.textContent.length).at(0)
  htmlHolder.classList.add('SemanticHtml')

  const blocks = addBlocks(htmlHolder)
  blocks.forEach(b => {
    b.classList.add('dumby-block')
    b.dataset.total = blocks.length
  })

  /** Prepare Showcase */
  const showcase = document.createElement('div')
  container.appendChild(showcase)
  showcase.classList.add('Showcase')

  /** Prepare Other Variables */
  const renderPromises = []
  const modalContent = document.createElement('div')
  container.appendChild(modalContent)
  const modal = new PlainModal(modalContent)

  /** Define dumbymap Object */
  const dumbymap = {
    layouts: [...defaultLayouts, ...layouts.map(l => typeof l === 'object' ? l : { name: l })],
    container,
    htmlHolder,
    showcase,
    blocks,
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

  /** LINK: Create DocLinks */
  container.querySelectorAll(docLinkSelector)
    .forEach(utils.createDocLink)

  /** LINK: Add external symbol on anchors */
  container.querySelectorAll('a')
    .forEach(a => {
      if (typeof a.href === 'string' && a.href.startsWith('http') && !a.href.startsWith(window.location.origin)) {
        a.classList.add('external')
      }
    })

  /** LINK: Set CRS and GeoLinks */
  const setCRS = new Promise(resolve => {
    register(proj4)
    fromEPSGCode(crs).then(() => resolve())
  })
  const addGeoSchemeByText = (async () => {
    const coordPatterns = /(-?\d+\.?\d*)([,\x2F\uFF0C])(-?\d+\.?\d*)/
    const re = new RegExp(coordPatterns, 'g')
    htmlHolder.querySelectorAll('.dumby-block')
      .forEach(p => {
        replaceTextNodes(p, re, match => {
          const a = document.createElement('a')
          a.href = `geo:0,0?xy=${match.at(1)},${match.at(3)}`
          a.textContent = match.at(0)
          return a
        })
      })
  })()

  Promise.all([setCRS, addGeoSchemeByText]).then(() => {
    Array.from(container.querySelectorAll(geoLinkSelector))
      .map(utils.setGeoSchemeByCRS(crs))
      .filter(link => link instanceof window.HTMLAnchorElement)
      .forEach(utils.createGeoLink)
  })

  /** LINK: remove all leaderline when onRemove() */
  onRemove(htmlHolder, () =>
    htmlHolder.querySelectorAll('.with-leader-line')
      .forEach(utils.removeLeaderLines),
  )
  /**
   * mapFocusObserver. observe for map focus
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
        const placeholder = htmlHolder.querySelector(
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

  /** Observer for layout changes */
  const layoutObserver = new window.MutationObserver(mutations => {
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
      .flat()
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
  })
  layoutObserver.observe(container, {
    attributes: true,
    attributeFilter: ['data-layout'],
    attributeOldValue: true,
    characterDataOldValue: true,
  })

  onRemove(htmlHolder, () => layoutObserver.disconnect())
  container.dataset.layout = initialLayout ?? defaultLayouts[0].name

  /**
   * afterMapRendered. callback of each map rendered
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
    onRemove(dumbymap.htmlHolder, () => {
      observer.disconnect()
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
  const mapIdList = []
  const assignMapId = config => {
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

  // Render each code block with "language-map" class
  const elementsWithMapConfig = Array.from(
    container.querySelectorAll(mapBlockSelector) ?? [],
  )
  if (autoMap && elementsWithMapConfig.length === 0) {
    const mapContainer = document.createElement('pre')
    mapContainer.className = 'mapclay-container'
    mapContainer.textContent = '#Created by DumbyMap'
    mapContainer.style.cssText = 'display: none;'
    htmlHolder.insertBefore(mapContainer, htmlHolder.firstElementChild)
    elementsWithMapConfig.push(mapContainer)
  }

  /** Render each taget element for maps */
  let order = 0
  elementsWithMapConfig.forEach(target => {
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

    // TODO Use debounce of user input to decide rendering timing
    // Render maps with delay
    const timer = setTimeout(
      () => {
        render(target, configList).forEach(renderPromise => {
          renderPromises.push(renderPromise)
          renderPromise.then(afterMapRendered)
        })
        Array.from(target.children).forEach(e => {
          e.style.order = order
          order++
          if (e.dataset.render === 'fulfilled') {
            afterMapRendered(e.renderer)
          }
        })
      },
      delay ?? 1000,
    )
    onRemove(htmlHolder, () => {
      clearTimeout(timer)
    })
  })

  /** Prepare Context Menu */
  const menu = document.createElement('div')
  menu.className = 'menu'
  menu.style.display = 'none'
  menu.onclick = (e) => {
    const keepMenu = e.target.closest('.keep-menu') || e.target.classList.contains('.keep-menu')
    if (keepMenu) return

    menu.style.display = 'none'
  }
  container.appendChild(menu)

  /** Menu Items for Context Menu */
  container.oncontextmenu = e => {
    menu.replaceChildren()
    menu.style.display = 'block'
    menu.style.cssText = `left: ${e.clientX - menu.offsetParent.offsetLeft + 10}px; top: ${e.clientY - menu.offsetParent.offsetTop + 5}px;`
    e.preventDefault()

    // Menu Items for map
    const map = e.target.closest('.mapclay')
    if (map?.renderer?.results) {
      const rect = map.getBoundingClientRect()
      const [x, y] = [e.x - rect.left, e.y - rect.top]
      menu.appendChild(menuItem.toggleMapFocus(map))
      menu.appendChild(menuItem.renderResults(dumbymap, map))
      menu.appendChild(menuItem.getCoordinatesByPixels(map, [x, y]))
      menu.appendChild(menuItem.restoreCamera(map))
    } else {
      // Toggle block focus
      const block = e.target.closest('.dumby-block')
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

  /** Event Handler when clicking outside of Context Manu */
  const actionOutsideMenu = e => {
    if (menu.style.display === 'none') return
    const keepMenu = e.target.closest('.keep-menu') || e.target.classList.contains('.keep-menu')
    if (keepMenu) return

    const rect = menu.getBoundingClientRect()
    if (
      e.clientX < rect.left ||
      e.clientX > rect.left + rect.width ||
      e.clientY < rect.top ||
      e.clientY > rect.top + rect.height
    ) {
      menu.style.display = 'none'
    }
  }
  document.addEventListener('click', actionOutsideMenu)
  onRemove(htmlHolder, () =>
    document.removeEventListener('click', actionOutsideMenu),
  )

  /** Drag/Drop on map for new GeoLink */
  const pointByArrow = document.createElement('div')
  pointByArrow.className = 'point-by-arrow'
  container.appendChild(pointByArrow)
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

    // link placeholder when dragging
    container.classList.add('dragging-geolink')
    const geoLink = document.createElement('a')
    geoLink.textContent = range.toString()
    geoLink.classList.add('with-leader-line', 'geolink', 'drag')

    // Replace current content with link
    const originContent = range.cloneContents()
    const resumeContent = () => {
      range.deleteContents()
      range.insertNode(originContent)
    }
    range.deleteContents()
    range.insertNode(geoLink)

    // Add leader-line
    const line = new LeaderLine({
      start: geoLink,
      end: pointByArrow,
      path: 'magnet',
    })

    // Update leader-line with mouse move
    container.onmousemove = (event) => {
      const rect = container.getBoundingClientRect()
      pointByArrow.style.left = `${event.clientX - rect.left}px`
      pointByArrow.style.top = `${event.clientY - rect.top}px`
      line.position()

      // TODO Scroll dumbymap.htmlHolder when cursor is at upper/lower side
    }
    container.onmousemove(e)

    // Handler for dragend
    container.onmouseup = (e) => {
      container.classList.remove('dragging-geolink')
      container.onmousemove = null
      container.onmouseup = null
      geoLink.classList.remove('drag')
      line.remove()

      const map = document.elementFromPoint(e.clientX, e.clientY)
        .closest('.mapclay[data-render="fulfilled"]')
      if (!map) {
        resumeContent()
        return
      }

      const marker = utils.addMarkerByPoint({ point: [e.clientX, e.clientY], map })
      if (!marker) {
        resumeContent()
        return
      }

      geoLink.href = `geo:${marker.dataset.xy.split(',').reverse()}`
      utils.createGeoLink(geoLink)
    }
  }

  return Object.seal(dumbymap)
}
