import MarkdownIt from 'markdown-it'
import MarkdownItAnchor from 'markdown-it-anchor'
import MarkdownItFootnote from 'markdown-it-footnote'
import MarkdownItFrontMatter from 'markdown-it-front-matter'
import MarkdownItTocDoneRight from 'markdown-it-toc-done-right'
import LeaderLine from 'leader-line'
import PlainDraggable from 'plain-draggable'
import { renderWith, parseConfigsFromYaml } from 'mapclay'

// Utils {{{
const onRemove = (element, callback) => {
  const parent = element.parentNode;
  if (!parent) throw new Error("The node must already be attached");

  const obs = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const el of mutation.removedNodes) {
        if (el === element) {
          obs.disconnect();
          callback();
        }
      }
    }
  });
  obs.observe(parent, { childList: true, });
}
// }}}
// FUNCTION: Get DocLinks from special anchor element {{{

const docLinkSelector = 'a[href^="#"][title^="=>"]'
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
// Links points to map by geo schema and id
const geoLinkSelector = 'a[href^="geo:"]'
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

  // FIXME A better way to generate draggable code block
  md.renderer.rules.draggable_block_open = () => '<div>'
  md.renderer.rules.draggable_block_close = () => '</div>'

  md.core.ruler.before('block', 'draggable_block', (state) => {
    state.tokens.push(new state.Token('draggable_block_open', '', 1))
  })

  // Add close tag for block with more than 2 empty lines
  md.block.ruler.before('table', 'draggable_block', (state, startLine) => {
    if (
      state.src[state.bMarks[startLine - 1]] === '\n' &&
      state.src[state.bMarks[startLine - 2]] === '\n' &&
      state.tokens.at(-1).type !== 'list_item_open' // Quick hack for not adding tag after "::marker" for <li>
    ) {
      state.push('draggable_block_close', '', -1);
      state.push('draggable_block_open', '', 1);
    }
  })

  md.core.ruler.after('block', 'draggable_block', (state) => {
    state.tokens.push(new state.Token('draggable_block_close', '', -1))
  })

  const contentWithToc = '${toc}\n\n\n' + mdContent
  htmlHolder.innerHTML = md.render(contentWithToc);

  // TODO Do this in markdown-it
  htmlHolder.querySelectorAll('* > div:not(:has(nav))')
    .forEach(b => b.classList.add('draggable-block'))

  return container
  //}}}
}
// FIXME Don't use hard-coded CSS selector
export const generateMaps = async (container) => {
  // LeaderLine {{{

  // Get anchors with "geo:" scheme
  const htmlHolder = container.querySelector('.SemanticHtml') ?? container
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
  // Render Maps {{{

  const afterEachMapLoaded = (mapContainer) => {
    const focusClickedMap = () => {
      if (container.getAttribute('data-layout') !== 'none') return

      container.querySelectorAll('.map-container')
        .forEach(c => c.classList.remove('focus'))
      mapContainer.classList.add('focus')
    }
    mapContainer.onclick = focusClickedMap
  }

  // Set unique ID for map container
  const mapIdList = []
  const assignMapId = (config) => {
    let mapId = config.id
    if (!mapId) {
      mapId = config.use?.split('/')?.at(-1)
      let counter = 2
      while (mapIdList.includes(mapId)) {
        mapId = `${config.use}.${counter}`
        counter++
      }
      config.id = mapId
    }
    mapIdList.push(mapId)
    return config
  }

  // Render each code block with "language-map" class
  const render = renderWith(config => ({ width: "100%", ...config }))
  const renderTargets = Array.from(container.querySelectorAll('pre:has(.language-map)'))
  const renderAllTargets = renderTargets.map(async (target) => {
    // Get text in code block starts with '```map'
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

    // Render maps
    return render(target, configList)
      .then(results => {
        results.forEach((mapByConfig) => {
          if (mapByConfig.status === 'fulfilled') {
            afterEachMapLoaded(mapByConfig.value)
            return mapByConfig.value
          } else {
            console.error('Fail to render target element', mapByConfig.reason)
          }
        })
      })
  })
  const renderInfo = await Promise.all(renderAllTargets).then(() => 'Finish Rendering')
  const maps = htmlHolder.querySelectorAll('.map-container') ?? []
  Array.from(maps)
    .forEach(ele => {
      const markers = geoLinks
        .filter(link => !link.targets || link.targets.include(ele.id))
        .map(link => ({
          xy: link.xy,
          title: link.url.pathname
        }))
      ele?.renderer?.addMarkers(markers)
    })

  htmlHolder.querySelectorAll('.marker')
    .forEach(marker => htmlHolder.anchors.push(marker))

  console.info(renderInfo)

  //}}}
  // Draggable Blocks{{{
  // Add draggable part for blocks
  htmlHolder.blocks = Array.from(htmlHolder.querySelectorAll('.draggable-block'))
  htmlHolder.blocks.forEach(block => {
    // Add draggable part
    const draggablePart = document.createElement('div');
    draggablePart.classList.add('draggable')
    draggablePart.textContent = '☰'
    draggablePart.title = 'Use middle-click to remove block'
    block.insertBefore(draggablePart, block.firstChild)
    block.draggablePart = draggablePart

    draggablePart.onmouseup = (e) => {
      if (e.button === 1) {
        block.style.display = "none";
      }
    }
  })

  // }}}
  // CSS observer {{{

  // Set focusArea
  const showcase = document.createElement('div')
  container.appendChild(showcase)
  showcase.classList.add('Showcase')
  const mapPlaceholder = document.createElement('div')
  mapPlaceholder.id = 'mapPlaceholder'
  showcase.appendChild(mapPlaceholder)

  // Layout{{{

  // press key to switch layout
  const layouts = ['none', 'side', 'overlay']
  container.setAttribute("data-layout", layouts[0])

  // FIXME Use UI to switch layouts
  const originalKeyDown = document.onkeydown
  document.onkeydown = (event) => {
    originalKeyDown(event)
    if (event.key === 'x' && container.querySelector('.map-container')) {
      let currentLayout = container.getAttribute('data-layout')
      currentLayout = currentLayout ? currentLayout : 'none'
      const nextLayout = layouts[(layouts.indexOf(currentLayout) + 1) % layouts.length]

      container.setAttribute("data-layout", nextLayout)
    }
  }

  // observe layout change
  const layoutObserver = new MutationObserver(() => {
    const layout = container.getAttribute('data-layout')
    htmlHolder.blocks.forEach(b => b.style.display = "block")

    if (layout === 'none') {
      mapPlaceholder.innerHTML = ""
      const map = showcase.querySelector('.map-container')
      // Swap focused map and palceholder in markdown
      if (map) {
        mapPlaceholder.parentElement?.replaceChild(map, mapPlaceholder)
        showcase.append(mapPlaceholder)
      }
    } else {
      // If paceholder is not set, create one and put map into focusArea
      if (showcase.contains(mapPlaceholder)) {
        const mapContainer = container.querySelector('.map-container.focus') ?? container.querySelector('.map-container')
        mapPlaceholder.innerHTML = `<div>Placeholder</div>`
        // TODO Get snapshot image
        // mapPlaceholder.src = map.map.getCanvas().toDataURL()
        mapContainer.parentElement?.replaceChild(mapPlaceholder, mapContainer)
        showcase.appendChild(mapContainer)
      }
    }

    if (layout === 'overlay') {
      let [x, y] = [0, 0];
      htmlHolder.blocks.forEach(block => {
        // Add draggable instance
        block.draggableInstance = new PlainDraggable(block, {
          handle: block.draggablePart,
          snap: { x: { step: 20 }, y: { step: 20 } },
          left: x,
          top: y,
        })

        // Set initial postion side by side
        x += parseInt(window.getComputedStyle(block).width) + 50
        if (x > window.innerWidth) {
          y += 200
          x = x % window.innerWidth
        }
      })
    } else {
      htmlHolder.blocks.forEach(block => {
        block.removeAttribute('style')
        try {
          block.draggableInstance.remove()
        } catch (_) { null }
      })
    }
  });
  layoutObserver.observe(container, {
    attributes: true,
    attributeFilter: ["data-layout"],
    attributeOldValue: true
  });

  onRemove(htmlHolder, () => layoutObserver.disconnect())
  //}}}
  //}}}
  return container
}
