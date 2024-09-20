import MarkdownIt from 'markdown-it'
import MarkdownItAnchor from 'markdown-it-anchor'
import MarkdownItFootnote from 'markdown-it-footnote'
import MarkdownItFrontMatter from 'markdown-it-front-matter'
import MarkdownItTocDoneRight from 'markdown-it-toc-done-right'
import LeaderLine from 'leader-line'
import PlainDraggable from 'plain-draggable'
import { renderWith, parseConfigsFromYaml } from 'mapclay'
import { onRemove, animateRectTransition, throttle } from './utils'

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
  htmlHolder.querySelectorAll('* > div:not(:has(nav))')
    .forEach(b => b.classList.add('dumby-block'))

  return container
  //}}}
}
// FIXME Don't use hard-coded CSS selector
export const generateMaps = async (container, callback) => {
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
  // Draggable Blocks {{{
  // Add draggable part for blocks

  const dumbyBlocks = Array.from(htmlHolder.querySelectorAll('.dumby-block'))
  const intoDraggableContainer = (block) => {
    // Create draggable block
    const draggableContainer = document.createElement('div')
    draggableContainer.classList.add('draggable-block')

    // Add draggable part
    const draggablePart = document.createElement('div');
    draggablePart.classList.add('draggable')
    draggablePart.textContent = '☰'
    draggablePart.title = 'Use middle-click to remove block'
    // Hide block with middle click
    draggablePart.onmouseup = (e) => {
      if (e.button === 1) {
        draggableContainer.style.display = "none";
      }
    }
    draggableContainer.appendChild(draggablePart)

    draggableContainer.appendChild(block)
    htmlHolder.appendChild(draggableContainer)
    return draggableContainer
  }

  const resumeFromDraggableContainer = (block) => {
    const draggableContainer = block.closest('.draggable-block')
    if (!draggableContainer) return
    htmlHolder.appendChild(block)
    block.removeAttribute('style')
    draggableContainer.draggableInstance.remove()
    draggableContainer.remove()
  }
  // }}}
  // CSS observer {{{
  // Focus Map {{{
  // Set focusArea
  const showcase = document.createElement('div')
  container.appendChild(showcase)
  showcase.classList.add('Showcase')

  const toShowcaseWithThrottle = throttle(animateRectTransition, 300)
  const fromShowCaseWithThrottle = throttle(animateRectTransition, 300)

  const mapFocusObserver = () => new MutationObserver((mutations) => {
    const mutation = mutations.at(-1)
    const target = mutation.target
    const focus = target.getAttribute(mutation.attributeName) === 'true'
    const shouldBeInShowcase = focus && getComputedStyle(showcase).display !== 'none'

    if (shouldBeInShowcase) {
      if (showcase.contains(target)) return

      // Placeholder for map in Showcase, it should has the same DOMRect
      const placeholder = target.cloneNode(true)
      placeholder.classList.remove('map-container')
      placeholder.setAttribute('data-placeholder', target.id)
      target.parentElement.replaceChild(placeholder, target)

      // To fit showcase, remove all inline style
      target.removeAttribute('style')
      showcase.appendChild(target)

      // Resume rect from Semantic HTML to Showcase, with animation
      toShowcaseWithThrottle(target, placeholder.getBoundingClientRect(), {
        duration: 300,
        resume: true
      })
    } else if (showcase.contains(target)) {
      const placeholder = htmlHolder.querySelector(`[data-placeholder="${target.id}"]`)
      if (!placeholder) throw Error(`Cannot fine placeholder for map "${target.id}"`)
      const animation = fromShowCaseWithThrottle(target, placeholder.getBoundingClientRect(), {
        duration: 300
      })

      const afterAnimation = () => {
        placeholder.parentElement.replaceChild(target, placeholder)
        target.style = placeholder.style.cssText
        placeholder.remove()
      }

      if (animation) {
        animation.finished
          .then(afterAnimation)
          .catch(afterAnimation)
      } else {
        afterAnimation()
      }
    }
  })
  // }}}
  // Layout {{{

  // press key to switch layout
  const layouts = ['none', 'side', 'overlay']
  container.setAttribute("data-layout", layouts[0])

  // FIXME Use UI to switch layouts
  const originalKeyDown = document.onkeydown
  document.onkeydown = (e) => {
    const event = originalKeyDown(e)
    if (!event) return

    if (event.key === 'x' && container.querySelector('.map-container')) {
      e.preventDefault()
      let currentLayout = container.getAttribute('data-layout')
      currentLayout = currentLayout ? currentLayout : 'none'
      const nextIndex = (layouts.indexOf(currentLayout) + 1) % layouts.length
      const nextLayout = layouts[nextIndex]

      container.setAttribute("data-layout", nextLayout)
    }

    // Use Tab to change focus map
    if (event.key === 'Tab') {
      e.preventDefault()

      const selector = '.map-container, [data-placeholder]'
      const candidates = Array.from(htmlHolder.querySelectorAll(selector))
      if (candidates.length <= 1) return

      const currentFocus = htmlHolder.querySelector('.map-container[data-focus=true]')
        ?? htmlHolder.querySelector('[data-placeholder]')
      Array.from(container.querySelectorAll('.map-container')).forEach(e =>
        e.removeAttribute('data-focus')
      );
      const index = currentFocus
        ? (candidates.indexOf(currentFocus) + (event.shiftKey ? -1 : 1)) % candidates.length
        : 0
      const nextFocus = candidates.at(index)
      nextFocus.setAttribute('data-focus', "true")
    }
  }

  // observe layout change
  const layoutObserver = new MutationObserver((mutations) => {
    const mutation = mutations.at(-1)
    const layout = container.getAttribute(mutation.attributeName)

    // Trigger Mutation Observer
    const focusMap = container.querySelector('.map-container[data-focus=true]')
      ?? container.querySelector('.map-container')
    focusMap?.setAttribute('data-focus', 'true')

    // Check empty block with map-container in showcase
    dumbyBlocks.forEach(b => {
      const contentChildren = Array.from(b.querySelectorAll(':scope > :not(.draggable)')) ?? []
      if (contentChildren.length === 1
        && elementsWithMapConfig.includes(contentChildren[0])
        && !contentChildren[0].querySelector('.map-container')
      ) {
        b.style.display = "none"
      } else {
        b.style.display = "block"
      }
    })

    if (layout === 'overlay') {
      const draggableContainers = dumbyBlocks.map(intoDraggableContainer)

      // Set initial position side by side
      let [x, y] = [0, 0];
      draggableContainers.forEach((c) => {

        // Add draggable instance
        c.draggableInstance = new PlainDraggable(c, {
          handle: c.querySelector('.draggable') ?? c,
          snap: { x: { step: 20 }, y: { step: 20 } },
          left: x,
          top: y,
        })
        x += parseInt(window.getComputedStyle(c).width) + 30
        if (x > window.innerWidth) {
          y += 200
          x = x % window.innerWidth
        }

        const resizeObserver = new ResizeObserver(() => {
          c.draggableInstance.position();
        }).observe(c);
        onRemove(c, () => resizeObserver.disconnect())
      })
    } else {
      dumbyBlocks.forEach(resumeFromDraggableContainer)
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
  // Render Maps {{{

  const afterEachMapLoaded = (mapContainer) => {
    const focusClickedMap = () => {
      container.querySelectorAll('.map-container')
        .forEach(c => c.removeAttribute('data-focus'))
      mapContainer.setAttribute('data-focus', true)
    }
    mapContainer.onclick = focusClickedMap
    mapContainer.setAttribute('tabindex', "-1")

    const observer = mapFocusObserver()
    mapFocusObserver().observe(mapContainer, {
      attributes: true,
      attributeFilter: ["data-focus"],
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
  const render = renderWith(config => ({ width: "100%", ...config }))
  const renderTargets = elementsWithMapConfig
    .map(async (target) => {
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

  const renderAllTargets = Promise.all(renderTargets)
    .then(() => {
      console.info('Finish Rendering')

      const maps = htmlHolder.querySelectorAll('.map-container') ?? []
      Array.from(maps)
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

      return maps
    })

  //}}}
  return renderAllTargets
}
