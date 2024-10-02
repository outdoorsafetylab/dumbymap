import MarkdownIt from 'markdown-it'
import MarkdownItAnchor from 'markdown-it-anchor'
import MarkdownItFootnote from 'markdown-it-footnote'
import MarkdownItFrontMatter from 'markdown-it-front-matter'
import MarkdownItTocDoneRight from 'markdown-it-toc-done-right'
import LeaderLine from 'leader-line'
import { renderWith, defaultAliases, parseConfigsFromYaml } from 'mapclay'
import { onRemove, animateRectTransition, throttle, shiftByWindow } from './utils'
import { Layout, SideBySide, Overlay } from './Layout'
import * as utils from './dumbyUtils'
import * as menuItem from './MenuItem'
import PlainModal from 'plain-modal'

const docLinkSelector = 'a[href^="#"][title^="=>"]'
const geoLinkSelector = 'a[href^="geo:"]'

const layouts = [
  new Layout({ name: 'normal' }),
  new SideBySide({ name: 'side-by-side' }),
  new Overlay({ name: 'overlay' })
]
const mapCache = {}

export const markdown2HTML = (container, mdContent) => {
  // Render: Markdown -> HTML {{{
  container.replaceChildren()

  container.innerHTML = '<div class="SemanticHtml"></div>'
  const htmlHolder = container.querySelector('.SemanticHtml')

  const md = MarkdownIt({
    html: true,
    breaks: true
  })
    .use(MarkdownItAnchor, {
      permalink: MarkdownItAnchor.permalink.linkInsideHeader({
        placement: 'before'
      })
    })
    .use(MarkdownItFootnote)
    .use(MarkdownItFrontMatter)
    .use(MarkdownItTocDoneRight)

  // FIXME A better way to generate blocks
  md.renderer.rules.dumby_block_open = () => '<div>'
  md.renderer.rules.dumby_block_close = () => '</div>'

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

  const contentWithToc = '${toc}\n\n\n' + mdContent  // eslint-disable-line
  htmlHolder.innerHTML = md.render(contentWithToc)

  // TODO Do this in markdown-it
  const blocks = htmlHolder.querySelectorAll(':scope > div:not(:has(nav))')
  blocks.forEach(b => {
    b.classList.add('dumby-block')
    b.setAttribute('data-total', blocks.length)
  })

  return container
  // }}}
}
export const generateMaps = (container, { delay, mapCallback }) => {
  container.classList.add('Dumby')
  container.removeAttribute('data-layout')
  container.setAttribute('data-layout', layouts[0].name)
  const htmlHolder = container.querySelector('.SemanticHtml') ?? container
  const blocks = Array.from(htmlHolder.querySelectorAll('.dumby-block'))
  const showcase = document.createElement('div')
  container.appendChild(showcase)
  showcase.classList.add('Showcase')
  const renderPromises = []
  const modalContent = document.createElement('div')
  container.appendChild(modalContent)
  const modal = new PlainModal(modalContent)

  const dumbymap = {
    layouts,
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
          container.querySelectorAll('.mapclay[data-render=fulfilled]')
        ).sort((a, b) => a.style.order > b.style.order),
      focusNextMap: throttle(utils.focusNextMap, utils.focusDelay),
      switchToNextLayout: throttle(utils.switchToNextLayout, 300)
    }
  }
  Object.entries(dumbymap.utils).forEach(([util, func]) => {
    dumbymap.utils[util] = func.bind(dumbymap)
  })

  // LeaderLine {{{

  Array.from(container.querySelectorAll(docLinkSelector)).filter(
    utils.createDocLink
  )

  // Get anchors with "geo:" scheme
  htmlHolder.anchors = []
  const geoLinkCallback = link => {
    link.onmouseover = () => addLeaderLines(link)
    link.onmouseout = () => removeLeaderLines(link)
    link.onclick = event => {
      event.preventDefault()
      htmlHolder.anchors
        .filter(isAnchorPointedBy(link))
        .forEach(updateMapByMarker(link.xy))
      // TODO Just hide leader line and show it again
      removeLeaderLines(link)
    }
  }
  const geoLinks = Array.from(
    container.querySelectorAll(geoLinkSelector)
  ).filter(l => utils.createGeoLink(l, geoLinkCallback))

  const isAnchorPointedBy = link => anchor => {
    const mapContainer = anchor.closest('.mapclay')
    const isTarget = !link.targets || link.targets.includes(mapContainer.id)
    return anchor.title === link.url.pathname && isTarget
  }

  const isAnchorVisible = anchor => {
    const mapContainer = anchor.closest('.mapclay')
    return insideWindow(anchor) && insideParent(anchor, mapContainer)
  }

  const drawLeaderLine = link => anchor => {
    const line = new LeaderLine({
      start: link,
      end: anchor,
      hide: true,
      middleLabel: link.url.searchParams.get('text'),
      path: 'magnet'
    })
    line.show('draw', { duration: 300 })
    return line
  }

  const addLeaderLines = link => {
    link.lines = htmlHolder.anchors
      .filter(isAnchorPointedBy(link))
      .filter(isAnchorVisible)
      .map(drawLeaderLine(link))
  }

  const removeLeaderLines = link => {
    if (!link.lines) return
    link.lines.forEach(line => line.remove())
    link.lines = []
  }

  const updateMapByMarker = xy => marker => {
    const renderer = marker.closest('.mapclay')?.renderer
    renderer.updateCamera({ center: xy }, true)
  }

  const insideWindow = element => {
    const rect = element.getBoundingClientRect()
    return (
      rect.left > 0 &&
      rect.right < window.innerWidth + rect.width &&
      rect.top > 0 &&
      rect.bottom < window.innerHeight + rect.height
    )
  }

  const insideParent = (childElement, parentElement) => {
    const childRect = childElement.getBoundingClientRect()
    const parentRect = parentElement.getBoundingClientRect()
    const offset = 20

    return (
      childRect.left > parentRect.left + offset &&
      childRect.right < parentRect.right - offset &&
      childRect.top > parentRect.top + offset &&
      childRect.bottom < parentRect.bottom - offset
    )
  }
  // }}}
  // CSS observer {{{
  // Focus Map {{{
  // Set focusArea

  const mapFocusObserver = () =>
    new window.MutationObserver(mutations => {
      const mutation = mutations.at(-1)
      const target = mutation.target
      const focus = target.classList.contains('focus')
      const shouldBeInShowcase =
        focus &&
        showcase.checkVisibility({
          contentVisibilityAuto: true,
          opacityProperty: true,
          visibilityProperty: true
        })

      if (focus) {
        dumbymap.utils
          .renderedMaps()
          .filter(map => map.id !== target.id)
          .forEach(map => map.classList.remove('focus'))
      }

      if (shouldBeInShowcase) {
        if (showcase.contains(target)) return

        // Placeholder for map in Showcase, it should has the same DOMRect
        const placeholder = target.cloneNode(true)
        placeholder.removeAttribute('id')
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
        placeholder.setAttribute('data-placeholder', target.id)

        // To fit showcase, remove all inline style
        target.removeAttribute('style')
        target.style.order = placeholder.style.order
        showcase.appendChild(target)

        // Resume rect from Semantic HTML to Showcase, with animation
        animateRectTransition(target, placeholder.getBoundingClientRect(), {
          duration: 300,
          resume: true
        })
      } else if (showcase.contains(target)) {
        // Check placeholder is inside Semantic HTML
        const placeholder = htmlHolder.querySelector(
          `[data-placeholder="${target.id}"]`
        )
        if (!placeholder) { throw Error(`Cannot find placeholder for map "${target.id}"`) }

        // Consider animation may fail, write callback
        const afterAnimation = () => {
          target.style = placeholder.style.cssText
          placeholder.remove()
        }

        // animation from Showcase to placeholder
        animateRectTransition(target, placeholder.getBoundingClientRect(), {
          duration: 300
        }).finished.finally(afterAnimation)
      }
    })
  // }}}
  // Layout {{{
  // press key to switch layout

  // observe layout change
  const layoutObserver = new window.MutationObserver(mutations => {
    const mutation = mutations.at(-1)
    const oldLayout = mutation.oldValue
    const newLayout = container.getAttribute(mutation.attributeName)

    // Apply handler for leaving/entering layouts
    if (oldLayout) {
      layouts
        .find(l => l.name === oldLayout)
        ?.leaveHandler?.call(this, dumbymap)
    }

    Object.values(dumbymap)
      .flat()
      .filter(ele => ele instanceof window.HTMLElement)
      .forEach(ele => ele.removeAttribute('style'))

    if (newLayout) {
      layouts
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
    characterDataOldValue: true
  })

  onRemove(htmlHolder, () => layoutObserver.disconnect())
  // }}}
  // }}}
  // Render Maps {{{

  const afterMapRendered = renderer => {
    const mapElement = renderer.target
    // FIXME
    mapElement.renderer = renderer
    mapElement.setAttribute('tabindex', '-1')
    if (mapElement.getAttribute('data-render') === 'fulfilled') {
      mapCache[mapElement.id] = renderer
    }

    // Execute callback from caller
    mapCallback?.call(this, mapElement)
    const markers = geoLinks
      .filter(link => !link.targets || link.targets.includes(mapElement.id))
      .map(link => ({ xy: link.xy, title: link.url.pathname }))

    // Add markers with Geolinks
    renderer.addMarkers(markers)
    mapElement
      .querySelectorAll('.marker')
      .forEach(marker => htmlHolder.anchors.push(marker))

    // Work with Mutation Observer
    const observer = mapFocusObserver()
    mapFocusObserver().observe(mapElement, {
      attributes: true,
      attributeFilter: ['class'],
      attributeOldValue: true
    })
    onRemove(mapElement, () => observer.disconnect())
  }

  // Set unique ID for map container
  const mapIdList = []
  const assignMapId = config => {
    let mapId = config.id
    if (!mapId) {
      mapId = config.use?.split('/')?.at(-1)
      let counter = 1
      while (!mapId || mapIdList.includes(mapId)) {
        mapId = `${config.use ?? 'unnamed'}-${counter}`
        counter++
      }
      config.id = mapId
    }
    mapIdList.push(mapId)
    return config
  }

  // Render each code block with "language-map" class
  const elementsWithMapConfig = Array.from(
    container.querySelectorAll('pre:has(.language-map)') ?? []
  )
  /**
   * updateAttributeByStep.
   *
   * @param {Object} -- renderer which is running steps
   */
  const updateAttributeByStep = ({ results, target, steps }) => {
    let passNum = results.filter(
      r => r.type === 'render' && r.state.match(/success|skip/)
    ).length
    const total = steps.length
    passNum += `/${total}`
    if (results.filter(r => r.type === 'render').length === total) {
      passNum += '\u0020'
    }

    // FIXME HACK use MutationObserver for animation
    if (!target.animations) target.animations = Promise.resolve()
    target.animations = target.animations.then(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      target.setAttribute('data-report', passNum)
    })
  }
  /**
   * config converter for mapclay.renderWith()
   *
   * @param {Object} config
   * @return {Object} -- converted config
   */
  const configConverter = config => ({
    use: config.use ?? 'Leaflet',
    width: '100%',
    ...config,
    aliases: {
      ...defaultAliases,
      ...(config.aliases ?? {})
    },
    stepCallback: updateAttributeByStep
  })
  const render = renderWith(configConverter)
  let order = 0
  elementsWithMapConfig.forEach(target => {
    // Get text in code block starts with markdown text '```map'
    const configText = target
      .querySelector('.language-map')
      .textContent // BE CAREFUL!!! 0xa0 char is "non-breaking spaces" in HTML text content
      // replace it by normal space
      .replace(/\u00A0/g, '\u0020')

    let configList = []
    try {
      configList = parseConfigsFromYaml(configText).map(assignMapId)
    } catch (_) {
      console.warn('Fail to parse yaml config for element', target)
      return
    }

    // If map in cache has the same ID, just put it into target
    // So user won't feel anything changes when editing markdown
    configList.forEach(config => {
      const cache = mapCache[config.id]
      if (!cache) return

      target.appendChild(cache.target)
      config.target = cache.target
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
        })
      },
      delay ?? 1000
    )
    onRemove(htmlHolder, () => {
      clearTimeout(timer)
    })
  })
  // }}}
  // Menu {{{
  const menu = document.createElement('div')
  menu.className = 'menu'
  menu.style.display = 'none'
  menu.onclick = (e) => {
    const keepMenu = e.target.closest('.keep-menu') || e.target.classList.contains('.keep-menu')
    if (keepMenu) return

    menu.style.display = 'none'
  }
  container.appendChild(menu)

  // Menu Items
  container.oncontextmenu = e => {
    menu.replaceChildren()
    menu.style.display = 'block'
    menu.style.cssText = `left: ${e.x - menu.offsetParent.offsetLeft + 10}px; top: ${e.y - menu.offsetParent.offsetTop + 5}px;`
    e.preventDefault()

    // GeoLinks
    const selection = document.getSelection()
    if (selection.type === 'Range') {
      const range = selection.getRangeAt(0)
      menu.appendChild(menuItem.addGeoLink(dumbymap, range))
    }

    // Menu Items for map
    const map = e.target.closest('.mapclay')
    if (map?.renderer?.results) {
      // Focus or Print Map Results
      menu.appendChild(menuItem.toggleMapFocus(map))
      menu.appendChild(menuItem.renderResults(dumbymap, map))
    } else {
      // Toggle block focus
      const block = e.target.closest('.dumby-block')
      if (block) {
        menu.appendChild(menuItem.toggleBlockFocus(block))
      }
    }

    // Menu Items for map/block/layout
    if (!map || map.closest('.Showcase')) {
      menu.appendChild(menuItem.pickMapItem(dumbymap))
      menu.appendChild(menuItem.pickBlockItem(dumbymap))
      menu.appendChild(menuItem.pickLayoutItem(dumbymap))
    }

    shiftByWindow(menu)
  }

  // Remove menu when click outside
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
    document.removeEventListener('click', actionOutsideMenu)
  )
  // }}}
  return Object.seal(dumbymap)
}
