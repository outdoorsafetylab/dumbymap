import MarkdownIt from 'markdown-it'
import MarkdownItAnchor from 'markdown-it-anchor'
import MarkdownItFootnote from 'markdown-it-footnote'
import MarkdownItFrontMatter from 'markdown-it-front-matter'
import MarkdownItTocDoneRight from 'markdown-it-toc-done-right'
import LeaderLine from 'leader-line'
import { renderWith, defaultAliases, parseConfigsFromYaml } from 'mapclay'
import { onRemove, animateRectTransition, throttle } from './utils'
import { Layout, SideBySide, Overlay } from './Layout'

const docLinkSelector = 'a[href^="#"][title^="=>"]'
const geoLinkSelector = 'a[href^="geo:"]'

const layouts = [
  new Layout({ name: "normal" }),
  new SideBySide({ name: "side-by-side" }),
  new Overlay({ name: "overlay" }),
]
const mapCache = {}

// FUNCTION: Get DocLinks from special anchor element {{{
/**
 * CreateDocLinks.
 *
 * @param {HTMLElement} Elements contains anchor elements for doclinks
 * @returns {Array} List of doclinks just created
 */
export const createDocLinks = (container) => Array.from(container.querySelectorAll(docLinkSelector))
  .map(link => {
    link.classList.add('with-leader-line', 'doclink')
    link.lines = []

    link.onmouseover = () => {
      const label = decodeURIComponent(link.href.split('#')[1])
      const selector = link.title.split('=>')[1] ?? '#' + label
      const target = document.querySelector(selector)
      if (!target?.checkVisibility()) return

      const line = new LeaderLine({
        start: link,
        end: target,
        middleLabel: LeaderLine.pathLabel({
          text: label,
          fontWeight: 'bold',
        }),
        hide: true,
        path: "magnet"
      })
      link.lines.push(line)
      line.show('draw', { duration: 300, })
    }
    link.onmouseout = () => {
      link.lines.forEach(line => line.remove())
      link.lines.length = 0
    }

    return link
  })
// }}}
// FUNCTION: Get GeoLinks from special anchor element {{{
/**
 * Create geolinks, which points to map by geo schema and id
 *
 * @param {HTMLElement} Elements contains anchor elements for doclinks
 * @returns {Array} List of doclinks just created
 */
export const createGeoLinks = (container, callback) => Array.from(container.querySelectorAll(geoLinkSelector))
  .filter(link => {
    const url = new URL(link.href)
    const xy = url?.href?.match(/^geo:([0-9.,]+)/)?.at(1)?.split(',')?.reverse()?.map(Number)

    if (!xy || isNaN(xy[0]) || isNaN(xy[1])) return false

    // Geo information in link
    link.url = url
    link.xy = xy
    link.classList.add('with-leader-line', 'geolink')
    link.targets = link.url.searchParams.get('id')?.split(',') ?? null

    // LeaderLine
    link.lines = []
    callback(link)

    return true
  })
// }}}
export const markdown2HTML = (container, mdContent) => {
  // Render: Markdown -> HTML {{{
  Array.from(container.children).map(e => e.remove())


  container.innerHTML = '<div class="SemanticHtml"></div>'
  const htmlHolder = container.querySelector('.SemanticHtml')

  const md = MarkdownIt({
    html: true,
    breaks: true,
  })
    .use(MarkdownItAnchor, {
      permalink: MarkdownItAnchor.permalink.linkInsideHeader({ placement: 'before' })
    })
    .use(MarkdownItFootnote)
    .use(MarkdownItFrontMatter)
    .use(MarkdownItTocDoneRight)

  // FIXME A better way to generate blocks
  md.renderer.rules.dumby_block_open = () => '<div>'
  md.renderer.rules.dumby_block_close = () => '</div>'

  md.core.ruler.before('block', 'dumby_block', (state) => {
    state.tokens.push(new state.Token('dumby_block_open', '', 1))
  })

  // Add close tag for block with more than 2 empty lines
  md.block.ruler.before('table', 'dumby_block', (state, startLine) => {
    if (
      state.src[state.bMarks[startLine - 1]] === '\n' &&
      state.src[state.bMarks[startLine - 2]] === '\n' &&
      state.tokens.at(-1).type !== 'list_item_open' // Quick hack for not adding tag after "::marker" for <li>
    ) {
      state.push('dumby_block_close', '', -1);
      state.push('dumby_block_open', '', 1);
    }
  })

  md.core.ruler.after('block', 'dumby_block', (state) => {
    state.tokens.push(new state.Token('dumby_block_close', '', -1))
  })

  const contentWithToc = '${toc}\n\n\n' + mdContent
  htmlHolder.innerHTML = md.render(contentWithToc);

  // TODO Do this in markdown-it
  const blocks = htmlHolder.querySelectorAll(':scope > div:not(:has(nav))')
  blocks.forEach(b => {
    b.classList.add('dumby-block')
    b.setAttribute('data-total', blocks.length)
  })

  return container
  //}}}
}
// FIXME Don't use hard-coded CSS selector
// TODO Use UI to switch layouts
function focusNextMap(reverse = false) {
  const renderedList = this.renderMaps
    .map(render => render.target)
    .filter(ele => ele.getAttribute('data-state') === 'rendered')
  const mapNum = renderedList.length
  if (mapNum === 0) return

  // Get current focused map element
  const currentFocus = this.container.querySelector('.map-container.focus')

  // Remove class name of focus for ALL candidates
  // This may trigger animation
  renderedList.forEach(ele => ele.classList.remove('focus'))

  // Get next existing map element
  const padding = reverse ? -1 : 1
  let nextIndex = currentFocus ? renderedList.indexOf(currentFocus) + padding : 0
  nextIndex = (nextIndex + mapNum) % mapNum
  const nextFocus = renderedList[nextIndex]
  nextFocus.classList.add("focus")

  return nextFocus
}
function focusDelay() {
  return window.getComputedStyle(this.showcase).display === 'none' ? 50 : 300
}

function switchToNextLayout(reverse = false) {
  const currentLayoutName = this.container.getAttribute('data-layout')
  const currentIndex = layouts.map(l => l.name).indexOf(currentLayoutName)
  const padding = reverse ? -1 : 1
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + padding + layouts.length) % layouts.length
  const nextLayout = layouts[nextIndex]
  this.container.setAttribute("data-layout", nextLayout.name)
}

function focusNextBlock(reverse = false) {
  const blocks = this.blocks.filter(b => b.checkVisibility({
    contentVisibilityAuto: true,
    opacityProperty: true,
    visibilityProperty: true,
  }))
  const currentBlock = blocks.find(b => b.classList.contains('focus'))
  const currentIndex = blocks.indexOf(currentBlock)
  const padding = reverse ? -1 : 1
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + padding + blocks.length) % blocks.length
  const nextBlock = blocks[nextIndex]
  blocks.forEach(b => b.classList.remove('focus'))
  nextBlock?.classList?.add('focus')
  nextBlock.scrollIntoView({ behavior: 'smooth', block: "nearest" })
}

function removeBlockFocus() {
  this.blocks.forEach(b => b.classList.remove('focus'))
}

export const generateMaps = (container, callback) => {
  container.classList.add('Dumby')
  const htmlHolder = container.querySelector('.SemanticHtml') ?? container
  const blocks = Array.from(htmlHolder.querySelectorAll('.dumby-block'))
  const showcase = document.createElement('div')
  container.appendChild(showcase)
  showcase.classList.add('Showcase')
  const renderMaps = []

  const dumbymap = {
    container,
    htmlHolder,
    showcase,
    blocks,
    renderMaps: renderMaps,
  }
  dumbymap.utils = {
    focusNextMap: throttle(focusNextMap.bind(dumbymap), focusDelay.bind(dumbymap)),
    switchToNextLayout: throttle(switchToNextLayout.bind(dumbymap), 300),
    focusNextBlock: focusNextBlock.bind(dumbymap),
    removeBlockFocus: removeBlockFocus.bind(dumbymap),
  }

  // LeaderLine {{{

  // Get anchors with "geo:" scheme
  htmlHolder.anchors = []
  const geoLinks = createGeoLinks(htmlHolder, (link) => {
    link.onmouseover = () => addLeaderLines(link)
    link.onmouseout = () => removeLeaderLines(link)
    link.onclick = (event) => {
      event.preventDefault()
      htmlHolder.anchors
        .filter(isAnchorPointedBy(link))
        .forEach(updateMapByMarker(link.xy))
      // TODO Just hide leader line and show it again
      removeLeaderLines(link)
    }
  })

  const isAnchorPointedBy = (link) => (anchor) => {
    const mapContainer = anchor.closest('.map-container')
    const isTarget = !link.targets || link.targets.includes(mapContainer.id)
    return anchor.title === link.url.pathname && isTarget
  }

  const isAnchorVisible = (anchor) => {
    const mapContainer = anchor.closest('.map-container')
    return insideWindow(anchor) && insideParent(anchor, mapContainer)
  }

  const drawLeaderLine = (link) => (anchor) => {
    const line = new LeaderLine({
      start: link,
      end: anchor,
      hide: true,
      middleLabel: link.url.searchParams.get('text'),
      path: "magnet",
    })
    line.show('draw', { duration: 300, })
    return line
  }

  const addLeaderLines = (link) => {
    link.lines = htmlHolder.anchors
      .filter(isAnchorPointedBy(link))
      .filter(isAnchorVisible)
      .map(drawLeaderLine(link))
  }

  const removeLeaderLines = (link) => {
    if (!link.lines) return
    link.lines.forEach(line => line.remove())
    link.lines = []
  }

  const updateMapByMarker = (xy) => (marker) => {
    const renderer = marker.closest('.map-container')?.renderer
    renderer.updateCamera({ center: xy }, true)
  }

  const insideWindow = (element) => {
    const rect = element.getBoundingClientRect()
    return rect.left > 0 &&
      rect.right < window.innerWidth + rect.width &&
      rect.top > 0 &&
      rect.bottom < window.innerHeight + rect.height
  }

  const insideParent = (childElement, parentElement) => {
    const childRect = childElement.getBoundingClientRect();
    const parentRect = parentElement.getBoundingClientRect();
    const offset = 20

    return childRect.left > parentRect.left + offset &&
      childRect.right < parentRect.right - offset &&
      childRect.top > parentRect.top + offset &&
      childRect.bottom < parentRect.bottom - offset
  }
  //}}}
  // Draggable Blocks {{{
  // Add draggable part for blocks


  // }}}
  // CSS observer {{{
  // Focus Map {{{
  // Set focusArea

  const mapFocusObserver = () => new MutationObserver((mutations) => {
    const mutation = mutations.at(-1)
    const target = mutation.target
    const focus = target.getAttribute(mutation.attributeName).includes('focus')
    const shouldBeInShowcase = focus && showcase.checkVisibility({
      contentVisibilityAuto: true,
      opacityProperty: true,
      visibilityProperty: true,
    })

    if (shouldBeInShowcase) {
      if (showcase.contains(target)) return

      // Placeholder for map in Showcase, it should has the same DOMRect
      const placeholder = target.cloneNode(true)
      placeholder.removeAttribute('id')
      placeholder.classList.remove('map-container', 'focus')
      target.parentElement.replaceChild(placeholder, target)

      // HACK Trigger CSS transition, if placeholde is the olny chil element in block,
      // reduce its height to zero.
      // To make sure the original height of placeholder is applied, callBoundingClientRect() seems work(Why?).
      // then set data-attribute for CSS selector to change height to 0
      placeholder.getBoundingClientRect()
      placeholder.setAttribute('data-placeholder', target.id)

      // To fit showcase, remove all inline style
      target.removeAttribute('style')
      showcase.appendChild(target)

      // Resume rect from Semantic HTML to Showcase, with animation
      animateRectTransition(target, placeholder.getBoundingClientRect(), {
        duration: 300,
        resume: true
      })
    } else if (showcase.contains(target)) {
      // Check placeholder is inside Semantic HTML
      const placeholder = htmlHolder.querySelector(`[data-placeholder="${target.id}"]`)
      if (!placeholder) throw Error(`Cannot fine placeholder for map "${target.id}"`)

      // Consider animation may fail, write callback
      const afterAnimation = () => {
        placeholder.parentElement.replaceChild(target, placeholder)
        target.style = placeholder.style.cssText
        placeholder.remove()
      }

      // animation from Showcase to placeholder
      animateRectTransition(target, placeholder.getBoundingClientRect(), { duration: 300 })
        .finished
        .finally(afterAnimation)
    }
  })
  // }}}
  // Layout {{{
  // press key to switch layout
  const defaultLayout = layouts[0]
  container.setAttribute("data-layout", defaultLayout.name)

  // observe layout change
  const layoutObserver = new MutationObserver((mutations) => {
    const mutation = mutations.at(-1)
    const oldLayout = mutation.oldValue
    const newLayout = container.getAttribute(mutation.attributeName)

    // Apply handler for leaving/entering layouts
    if (oldLayout) {
      layouts.find(l => l.name === oldLayout)
        ?.leaveHandler
        ?.call(this, dumbymap)
    }

    Object.values(dumbymap)
      .flat()
      .filter(ele => ele instanceof HTMLElement)
      .forEach(ele => ele.removeAttribute('style'))

    if (newLayout) {
      layouts.find(l => l.name === newLayout)
        ?.enterHandler
        ?.call(this, dumbymap)
    }

    // Since layout change may show/hide showcase, the current focused map should do something
    // Reset attribute triggers MutationObserver which is observing it
    const focusMap = container.querySelector('.map-container.focus')
      ?? container.querySelector('.map-container')
    focusMap?.classList?.add('focus')
  });
  layoutObserver.observe(container, {
    attributes: true,
    attributeFilter: ["data-layout"],
    attributeOldValue: true,
    characterDataOldValue: true
  });

  onRemove(htmlHolder, () => layoutObserver.disconnect())
  //}}}
  //}}}
  // Render Maps {{{

  const afterEachMapLoaded = (renderMap) => {
    const mapContainer = renderMap.target
    mapCache[mapContainer.id] = renderMap
    mapContainer.setAttribute('tabindex', "-1")
    mapContainer.setAttribute('data-state', "rendered")

    const observer = mapFocusObserver()
    mapFocusObserver().observe(mapContainer, {
      attributes: true,
      attributeFilter: ["class"],
      attributeOldValue: true
    });
    onRemove(mapContainer, () => observer.disconnect())
  }

  // Set unique ID for map container
  const mapIdList = []
  const assignMapId = (config) => {
    let mapId = config.id
    if (!mapId) {
      mapId = config.use?.split('/')?.at(-1)
      let counter = 1
      while (!mapId || mapIdList.includes(mapId)) {
        mapId = `${config.use ?? "unnamed"}-${counter}`
        counter++
      }
      config.id = mapId
    }
    mapIdList.push(mapId)
    return config
  }

  // Render each code block with "language-map" class
  const elementsWithMapConfig = Array.from(container.querySelectorAll('pre:has(.language-map)') ?? [])
  // Add default aliases into each config
  const configConverter = (config => ({
    width: "100%",
    ...config,
    aliases: {
      ...defaultAliases,
      ...config.aliases ?? {}
    },
  }))
  const render = renderWith(configConverter)
  elementsWithMapConfig
    .forEach(target => {
      // Get text in code block starts with markdown text '```map'
      const configText = target.querySelector('.language-map')
        .textContent
        // BE CAREFUL!!! 0xa0 char is "non-breaking spaces" in HTML text content
        // replace it by normal space
        .replace(/\u00A0/g, '\u0020')

      let configList = []
      try {
        configList = parseConfigsFromYaml(configText).map(assignMapId)
      } catch (_) {
        console.warn('Fail to parse yaml config for element', target)
      }

      // If map in cache has the same ID, and its config is the same,
      // then don't render them again
      configList.forEach(config => {
        const cache = mapCache[config.id]
        if (cache && JSON.stringify(cache.config) === JSON.stringify(configConverter(config))) {
          target.appendChild(cache.target)
          config.render = () => null
        }
      })

      // Render maps
      render(target, configList).forEach(renderMap => {
        renderMaps.push(renderMap)
        renderMap.promise
          .then(_ => afterEachMapLoaded(renderMap))
          .catch(err => console.error('Fail to render target element with ID:', renderMap.target.id, err))
      })
    })

  Promise.allSettled(renderMaps.map(r => r.promise))
    .then(() => {
      console.info('Finish Rendering')

      renderMaps
        .map(r => r.target)
        .filter(target => target.getAttribute('data-state') === 'rendered')
        .forEach(ele => {
          callback(ele)
          const markers = geoLinks
            .filter(link => !link.targets || link.targets.includes(ele.id))
            .map(link => ({
              xy: link.xy,
              title: link.url.pathname
            }))
          ele?.renderer?.addMarkers(markers)
        })

      htmlHolder.querySelectorAll('.marker')
        .forEach(marker => htmlHolder.anchors.push(marker))
    })

  //}}}
  return Object.seal(dumbymap)
}
