import MarkdownIt from 'markdown-it'
import MarkdownItAnchor from 'markdown-it-anchor'
import MarkdownItFootnote from 'markdown-it-footnote'
import MarkdownItFrontMatter from 'markdown-it-front-matter'
import MarkdownItInjectLinenumbers from 'markdown-it-inject-linenumbers'
import MarkdownItAttrs from 'markdown-it-attrs'
import * as mapclay from 'mapclay'
import { onRemove, animateRectTransition, throttle, debounce, shiftByWindow } from './utils.mjs'
import { Layout, SideBySide, Overlay, Sticky } from './Layout.mjs'
import { GeoLink, DocLink, getMarkersByGeoLink } from './Link.mjs'
import * as utils from './dumbyUtils.mjs'
import * as menuItem from './MenuItem.mjs'
import PlainModal from 'plain-modal'
import proj4 from 'proj4'
import { register, fromEPSGCode } from 'ol/proj/proj4'

/**
 * Convert a DOM node (element or text) to a Markdown string.
 * Handles the most common HTML elements so that raw-HTML containers
 * can be round-tripped into editable markdown text.
 *
 * @param {Node} node
 * @returns {string}
 */
export const htmlToMd = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent
    return t.trim() ? t : ''
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const tag = node.tagName.toLowerCase()
  const inner = () => Array.from(node.childNodes).map(htmlToMd).join('')

  switch (tag) {
    case 'h1': return `# ${inner().trim()}\n\n`
    case 'h2': return `## ${inner().trim()}\n\n`
    case 'h3': return `### ${inner().trim()}\n\n`
    case 'h4': return `#### ${inner().trim()}\n\n`
    case 'h5': return `##### ${inner().trim()}\n\n`
    case 'h6': return `###### ${inner().trim()}\n\n`
    case 'p': return `${inner().trim()}\n\n`
    case 'br': return '\n'
    case 'hr': return '---\n\n'
    case 'strong':
    case 'b': return `**${inner()}**`
    case 'em':
    case 'i': return `*${inner()}*`
    case 'a': return `[${inner()}](${node.getAttribute('href') ?? ''})`
    case 'img': return `![${node.getAttribute('alt') ?? ''}](${node.getAttribute('src') ?? ''})`
    case 'code':
      return node.closest('pre')
        ? node.textContent
        : `\`${node.textContent}\``
    case 'pre': {
      const code = node.querySelector('code')
      const lang = (code?.className ?? '').match(/language-(\w+)/)?.[1] ?? ''
      return `\`\`\`${lang}\n${(code ?? node).textContent.trim()}\n\`\`\`\n\n`
    }
    case 'blockquote':
      return inner().trim().split('\n').map(l => `> ${l}`).join('\n') + '\n\n'
    case 'li': return inner()
    case 'ul':
      return Array.from(node.children)
        .map(li => `- ${htmlToMd(li).trim()}`)
        .join('\n') + '\n\n'
    case 'ol':
      return Array.from(node.children)
        .map((li, i) => `${i + 1}. ${htmlToMd(li).trim()}`)
        .join('\n') + '\n\n'
    default:
      return UNWRAP_TAGS.has(tag) ? inner() : node.outerHTML
  }
}

const UNWRAP_TAGS = new Set(['div', 'article', 'section', 'main', 'aside', 'header', 'footer', 'nav'])

/**
 * Split a markdown string into block strings on 2+ consecutive blank lines.
 * Fence blocks (``` ... ```) are treated as atomic — blank lines inside them
 * do not trigger a split.
 *
 * @param {string} md
 * @returns {string[]}
 */
export const splitMd = (md) => {
  const lines = md.split('\n')
  const blocks = []
  let buf = []
  let inFence = false
  let blanks = 0
  for (const line of lines) {
    const wasInFence = inFence
    if (/^```/.test(line)) inFence = !inFence
    if (!wasInFence && line.trim() === '') {
      blanks++
      buf.push(line)
    } else {
      if (!wasInFence && blanks >= 2) {
        const content = buf.slice(0, buf.length - blanks).join('\n').trim()
        if (content) blocks.push(content)
        buf = []
      }
      blanks = 0
      buf.push(line)
    }
  }
  if (buf.length > 0) {
    const content = buf.join('\n').trim()
    if (content) blocks.push(content)
  }
  return blocks
}

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
 * Converts Markdown/HTML content into .dumby-block elements inside container.
 * Since markdown-it has html:true, raw HTML is also accepted as input.
 *
 * @param {HTMLElement} container - Target Element to include generated HTML contents
 * @param {string} mdContent - Text in Markdown (superset of HTML) format
 * @returns {HTMLElement} container
 */
export const markdown2dumbyBlock = (container, mdContent) => {
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
    .use(MarkdownItAttrs)

  /** Custom rule for Blocks in DumbyMap */
  // Split into .dumby-block at every gap of 2+ blank lines (i.e. triple newline \n\n\n)
  md.renderer.rules.dumby_block_open = () => '<article class="dumby-block">'
  md.renderer.rules.dumby_block_close = () => '</article>'
  md.core.ruler.after('block', 'dumby_block', state => {
    const tokens = state.tokens
    const out = []
    let blockOpen = false
    let prevEndLine = -1

    for (const token of tokens) {
      if (token.map) {
        const gap = token.map[0] - prevEndLine
        if (!blockOpen) {
          out.push(new state.Token('dumby_block_open', '', 1))
          blockOpen = true
        } else if (gap >= 2) {
          out.push(new state.Token('dumby_block_close', '', -1))
          out.push(new state.Token('dumby_block_open', '', 1))
        }
        prevEndLine = token.map[1]
      }
      out.push(token)
    }

    if (blockOpen) out.push(new state.Token('dumby_block_close', '', -1))
    state.tokens = out
  })

  /** Render HTML */
  const htmlHolder = document.createElement('div')
  htmlHolder.className = 'SemanticHtml'
  htmlHolder.innerHTML = md.render(mdContent)
  container.appendChild(htmlHolder)

  /** Store markdown source per block for editing */
  const mdPieces = splitMd(mdContent)
  htmlHolder.querySelectorAll('.dumby-block').forEach((block, i) => {
    block._md = mdPieces[i] ?? ''
  })

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

/** SETUP: Initialize container element for DumbyMap */
export const setupContainer = (container, { crs = 'EPSG:4326', initialLayout } = {}) => {
  container.classList.add('Dumby')
  delete container.dataset.layout
  container.dataset.crs = crs
  container.dataset.layout = initialLayout ?? defaultLayouts.at(0).name
  register(proj4)
}

/** SETUP: Find and return the Semantic HTML holder element */
export const resolveHtmlHolder = (container, contentSelector) => {
  const htmlHolder = container.querySelector(contentSelector) ??
    container.querySelector('.SemanticHtml, main, :scope > article') ??
    Array.from(container.children).find(e => e.id?.match(/main|content/) || e.className?.match?.(/main|content/)) ??
    Array.from(container.children).sort((a, b) => a.textContent.length < b.textContent.length).at(0)
  htmlHolder.classList.add('SemanticHtml')
  return htmlHolder
}

/** SETUP: Wrap loose text nodes in <p> so they are treated as block content */
const wrapTextNodes = (parent) => {
  Array.from(parent.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
    .forEach(node => {
      const p = document.createElement('p')
      node.replaceWith(p)
      p.appendChild(node)
    })
}

/** SETUP: Wrap content into .dumby-block elements if not already done by markdown2dumbyBlock */
export const wrapDumbyBlocks = (htmlHolder) => {
  if (!htmlHolder.querySelector('.dumby-block')) {
    wrapTextNodes(htmlHolder)
    const headings = htmlHolder.querySelectorAll('h1, h2, h3')
    if (headings.length) {
      const childNodes = Array.from(htmlHolder.childNodes)
      let block = document.createElement('article')
      block.className = 'dumby-block'
      htmlHolder.appendChild(block)
      childNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && node.matches('h1, h2, h3') && block.children.length) {
          block = document.createElement('article')
          block.className = 'dumby-block'
          htmlHolder.appendChild(block)
        }
        block.appendChild(node)
      })
    } else {
      const sections = htmlHolder.querySelectorAll(':scope > section, :scope > article')
      if (sections.length) {
        sections.forEach(el => el.classList.add('dumby-block'))
      } else {
        const block = document.createElement('article')
        block.className = 'dumby-block'
        Array.from(htmlHolder.childNodes).forEach(node => block.appendChild(node))
        htmlHolder.appendChild(block)
      }
    }
  } else {
    htmlHolder.querySelectorAll('.dumby-block').forEach(wrapTextNodes)
  }
}

/** SETUP: Store markdown source per block (derive from HTML when generateMaps() is used on raw HTML) */
export const storeMarkdownPerBlock = (htmlHolder) => {
  htmlHolder.querySelectorAll('.dumby-block').forEach(block => {
    if (block._md === undefined) {
      block._md = Array.from(block.childNodes).map(htmlToMd).join('').trim()
    }
  })
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
      if (geoLink.classList.contains('from-text')) {
        menu.appendChild(menuItem.Item({
          innerHTML: '<strong style="color: red;">DELETE</strong>',
          onclick: () => {
            getMarkersByGeoLink(geoLink)
              .forEach(m => m.remove())
            geoLink.replaceWith(
              document.createTextNode(geoLink.textContent),
            )
          },
        }))
      } else if (geoLink.classList.contains('from-geocoding')) {
        menu.appendChild(menuItem.Item({
          innerHTML: '<strong style="color: red;">DELETE</strong>',
          onclick: () => {
            getMarkersByGeoLink(geoLink)
              .forEach(m => m.remove())

            const sibling = [
              geoLink.previousElementSibling,
              geoLink.nextElementSibling,
            ]
              .find(a =>
                a.classList.contains('from-geocoding') && a.textContent === geoLink.textContent,
              )

            if (sibling) {
              geoLink.remove()
            } else {
              geoLink.replaceWith(
                document.createTextNode(geoLink.textContent),
              )
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
 * @param {String} options.contentSelector - CSS selector for Semantic HTML
 * @param {string} options.crs - CRS in EPSG/ESRI code, see epsg.io
 * @param {string} options.initialLayout
 * @param {number} [options.delay=1000] mapDelay - Delay before rendering maps (in milliseconds)
 * @param {Function} options.render - Render function for maps
 * @param {Function} options.renderCallback - Callback function to be called after map rendering
 * @param {String | null} options.defaultApply
 * @param {boolean} [options.urlParams=false] - If true, reads `?layout=` query param and sets data-layout on container
 */
export const generateMaps = (container, {
  contentSelector,
  crs = 'EPSG:4326',
  initialLayout,
  layouts = [],
  mapDelay = 1000,
  render = defaultRender,
  renderCallback = () => null,
  defaultApply = 'https://outdoorsafetylab.github.io/dumbymap/assets/default.yml',
  urlParams = true,
} = {}) => {
  if (container.classList.contains('Dumby')) return

  setupContainer(container, { crs, initialLayout })

  const htmlHolder = resolveHtmlHolder(container, contentSelector)
  wrapDumbyBlocks(htmlHolder)
  storeMarkdownPerBlock(htmlHolder)

  /** Remove all siblings and text nodes except .SemanticHtml */
  Array.from(container.childNodes)
    .filter(node => node !== htmlHolder)
    .forEach(node => node.remove())

  const showcase = createShowcase(container)
  const { modal, modalContent } = createModal(container)
  const dumbymap = buildDumbymap(container, { modal, modalContent, layouts })

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
    const params = new URLSearchParams(window.location.search)
    const layoutParam = params.get('layout')
    if (layoutParam) container.dataset.layout = layoutParam

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
  const editBlockItem = menuItem.setupBlockEdit(dumbymap, { container, htmlHolder, markdown2dumbyBlock, splitMd })

  setupContextMenu(container, dumbymap, editBlockItem)
  setupMouseDrag(container)
  setupKeybindings(container, dumbymap)
  fetchDefaultAliases(defaultApply, dumbymap)

  /** Return Object for utils */
  return Object.seal(dumbymap)
}
