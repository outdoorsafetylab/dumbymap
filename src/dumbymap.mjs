// vim:foldmethod
import MarkdownIt from 'markdown-it'
import MarkdownItAnchor from 'markdown-it-anchor'
import MarkdownItFootnote from 'markdown-it-footnote'
import MarkdownItFrontMatter from 'markdown-it-front-matter'
import MarkdownItTocDoneRight from 'markdown-it-toc-done-right'
import LeaderLine from 'leader-line'
import PlainDraggable from 'plain-draggable'
import { render, parseConfigsFromYaml } from 'mapclay'

const observers = new Map()

export const markdown2HTML = async (container, mdContent) => {
  // Render: Markdown -> HTML {{{

  container.innerHTML = `
    <div id="map"></div>
    <div id="markdown"></div>
  `

  const md = MarkdownIt({ html: true })
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
    if (state.src[state.bMarks[startLine - 1]] === '\n' && state.src[state.bMarks[startLine - 2]] === '\n') {
      state.push('draggable_block_close', '', -1);
      state.push('draggable_block_open', '', 1);
    }
  })

  md.core.ruler.after('block', 'draggable_block', (state) => {
    state.tokens.push(new state.Token('draggable_block_close', '', -1))
  })

  const markdown = container.querySelector('#markdown')
  const contentWithToc = '${toc}\n\n\n' + mdContent
  markdown.innerHTML = md.render(contentWithToc);
  markdown.querySelectorAll('*> div:not(:has(nav))')
    .forEach(b => b.classList.add('draggable-block'))


  // TODO Improve it!
  const docLinks = Array.from(container.querySelectorAll('#markdown a[href^="#"][title^="doc"]'))
  docLinks.forEach(link => {
    link.classList.add('with-leader-line', 'doclink')
    link.lines = []

    link.onmouseover = () => {
      const target = document.querySelector(link.getAttribute('href'))
      if (!target?.checkVisibility()) return

      const line = new LeaderLine({
        start: link,
        end: target,
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
  })
  //}}}
}

export const generateMaps = async (container) => {
  // LeaderLine {{{

  // Get anchors with "geo:" scheme
  const markdown = container.querySelector('#markdown')
  markdown.anchors = []

  // Set focusArea
  const focusArea = container.querySelector('#map')
  const mapPlaceholder = document.createElement('div')
  mapPlaceholder.id = 'mapPlaceholder'
  focusArea.appendChild(mapPlaceholder)

  // Links points to map by geo schema and id
  const geoLinks = Array.from(container.querySelectorAll('#markdown a[href^="geo:"]'))
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
      link.onmouseover = () => addLeaderLines(link)
      link.onmouseout = () => removeLeaderLines(link)
      link.onclick = (event) => {
        event.preventDefault()
        markdown.anchors
          .filter(isAnchorPointedBy(link))
          .forEach(updateMapByMarker(xy))
        // TODO Just hide leader line and show it again
        removeLeaderLines(link)
      }

      return true
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
    link.lines = markdown.anchors
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
    mapContainer.querySelectorAll('.marker')
      .forEach(marker => markdown.anchors.push(marker))

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
  }

  const markerOptions = geoLinks.map(link => ({
    targets: link.targets,
    xy: link.xy,
    title: link.url.pathname
  }))


  // Render each code block with "language-map" class
  const renderTargets = Array.from(container.querySelectorAll('pre:has(.language-map)'))
  const renderAllTargets = renderTargets.map(async (target) => {
    // Get text in code block starts with '```map'
    // BE CAREFUL!!! 0xa0 char is "non-breaking spaces" in HTML text content
    // replace it by normal space
    const configText = target.querySelector('.language-map').textContent.replace(/\u00A0/g, '\u0020')

    let configList = []
    try {
      configList = parseConfigsFromYaml(configText).map(result => {
        assignMapId(result)
        const markersFromLinks = markerOptions.filter(marker =>
          !marker.targets || marker.targets.includes(result.id)
        )
        Object.assign(result, { markers: markersFromLinks })
        return result
      })
      /* eslint-disable no-unused-vars */
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
  console.info(renderInfo)

  //}}}
  // CSS observer {{{
  if (!observers.get(container)) {
    observers.set(container, [])
  }
  const obs = observers.get(container)
  if (obs.length) {
    obs.forEach(o => o.disconnect())
    obs.length = 0
  }
  // Layout{{{

  // press key to switch layout
  const layouts = ['none', 'side', 'overlay']
  container.setAttribute("data-layout", layouts[0])
  document.onkeydown = (event) => {
    if (event.key === 'x' && container.querySelector('.map-container')) {
      let currentLayout = container.getAttribute('data-layout')
      currentLayout = currentLayout ? currentLayout : 'none'
      const nextLayout = layouts[(layouts.indexOf(currentLayout) + 1) % layouts.length]

      container.setAttribute("data-layout", nextLayout)
    }
  }

  // Add draggable part for blocks
  markdown.blocks = Array.from(markdown.querySelectorAll('.draggable-block'))
  markdown.blocks.forEach(block => {
    const draggablePart = document.createElement('div');
    draggablePart.classList.add('draggable')
    draggablePart.textContent = '☰'

    // TODO Better way to close block
    draggablePart.onmouseup = (e) => {
      if (e.button === 1) block.style.display = "none";
    }
    block.insertBefore(draggablePart, block.firstChild)
  })

  // observe layout change
  const layoutObserver = new MutationObserver(() => {
    const layout = container.getAttribute('data-layout')
    markdown.blocks.forEach(b => b.style.display = "block")

    if (layout === 'none') {
      mapPlaceholder.innerHTML = ""
      const map = focusArea.querySelector('.map-container')
      // Swap focused map and palceholder in markdown
      if (map) {
        mapPlaceholder.parentElement?.replaceChild(map, mapPlaceholder)
        focusArea.append(mapPlaceholder)
      }
    } else {
      // If paceholder is not set, create one and put map into focusArea
      if (focusArea.contains(mapPlaceholder)) {
        const mapContainer = container.querySelector('.map-container.focus') ?? container.querySelector('.map-container')
        mapPlaceholder.innerHTML = `<div>Placeholder</div>`
        // TODO
        // mapPlaceholder.src = map.map.getCanvas().toDataURL()
        mapContainer.parentElement?.replaceChild(mapPlaceholder, mapContainer)
        focusArea.appendChild(mapContainer)
      }
    }

    if (layout === 'overlay') {
      markdown.blocks.forEach(block => {
        block.draggableInstance = new PlainDraggable(block, { handle: block.querySelector('.draggable') })
        block.draggableInstance.snap = { x: { step: 20 }, y: { step: 20 } }
        // block.draggableInstance.onDragEnd = () => {
        //   links(block).forEach(link => link.line.position())
        // }
      })
    } else {
      markdown.blocks.forEach(block => {
        try {
          block.style.transform = 'none'
          block.draggableInstance.remove()
        } catch (err) {
          console.warn('Fail to remove draggable instance', err)
        }
      })
    }
  });
  layoutObserver.observe(container, {
    attributes: true,
    attributeFilter: ["data-layout"],
    attributeOldValue: true
  });
  obs.push(layoutObserver)
  //}}}
  //}}}
  return container
}
