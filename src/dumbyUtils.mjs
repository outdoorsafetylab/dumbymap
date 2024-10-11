import LeaderLine from 'leader-line'
import { insideWindow, insideParent } from './utils'

export const coordPattern = /^geo:([-]?[0-9.]+),([-]?[0-9.]+)/

/**
 * focusNextMap.
 * @param {Boolean} reverse - focus previous map
 */
export function focusNextMap (reverse = false) {
  const renderedList = this.utils.renderedMaps()
  const index = renderedList.findIndex(e => e.classList.contains('focus'))
  const nextIndex = (index + (reverse ? -1 : 1)) % renderedList.length

  const nextMap = renderedList.at(nextIndex)
  nextMap.classList.add('focus', 'focus-manual')
  nextMap.scrollIntoView({ behavior: 'smooth' })
}

/**
 * focusNextBlock.
 *
 * @param {Boolean} reverse - focus previous block
 */
export function focusNextBlock (reverse = false) {
  const blocks = this.blocks.filter(b =>
    b.checkVisibility({
      contentVisibilityAuto: true,
      opacityProperty: true,
      visibilityProperty: true,
    }),
  )
  const index = blocks.findIndex(e => e.classList.contains('focus'))
  const nextIndex = (index + (reverse ? -1 : 1)) % blocks.length

  blocks.forEach(b => b.classList.remove('focus'))
  const nextBlock = blocks.at(nextIndex)
  nextBlock?.classList?.add('focus')
  scrollToBlock(nextBlock)
}

/**
 * scrollToBlock. Smoothly scroll to target block.
 * If block is bigger than viewport, then pick strategy wisely.
 *
 * @param {HTMLElement} block - Scroll to this element
 */
export const scrollToBlock = block => {
  const parentRect = block.parentElement.getBoundingClientRect()
  const scrollBlock =
    block.getBoundingClientRect().height > parentRect.height * 0.8
      ? 'nearest'
      : 'center'
  block.scrollIntoView({ behavior: 'smooth', block: scrollBlock })
}

/**
 * focusDelay. Delay of throttle, value changes by cases
 */
export function focusDelay () {
  return window.window.getComputedStyle(this.showcase).display === 'none' ? 50 : 300
}

/**
 * switchToNextLayout.
 *
 * @param {Boolean} reverse - Switch to previous one
 */
export function switchToNextLayout (reverse = false) {
  const layouts = this.layouts
  const currentLayoutName = this.container.dataset.layout
  const currentIndex = layouts.map(l => l.name).indexOf(currentLayoutName)
  const padding = reverse ? -1 : 1
  const nextIndex =
    currentIndex === -1
      ? 0
      : (currentIndex + padding + layouts.length) % layouts.length
  const nextLayout = layouts[nextIndex]
  this.container.dataset.layout = nextLayout.name
}

/**
 * removeBlockFocus.
 */
export function removeBlockFocus () {
  this.blocks.forEach(b => b.classList.remove('focus'))
}

/**
 * getMarkersFromMaps. Get marker elements by GeoLink
 *
 * @param {HTMLAnchorElement} link
 * @return {HTMLElement[]} markers
 */
const getMarkersFromMaps = link => {
  const maps = Array.from(
    link.closest('.Dumby')
      .querySelectorAll('.mapclay[data-render="fulfilled"]'),
  )
  return maps
    .filter(map => link.targets ? link.targets.includes(map.id) : true)
    .map(map => {
      const renderer = map.renderer
      const lonLat = [Number(link.dataset.lon), Number(link.dataset.lat)]

      const marker = map.querySelector(`.marker[data-xy="${lonLat}"]`) ??
        renderer.addMarker({
          xy: lonLat,
          type: link.type,
        })
      marker.dataset.xy = lonLat
      marker.title = new URLSearchParams(link.search).get('xy') ?? lonLat
      const crs = link.dataset.crs
      if (crs && crs !== 'EPSG:4326') {
        marker.title += '@' + link.dataset.crs
      }

      return marker
    })
}

/**
 * addLeaderLine, from link element to target element
 *
 * @param {HTMLAnchorElement} link
 * @param {Element} target
 */
const addLeaderLine = (link, target) => {
  const line = new LeaderLine({
    start: link,
    end: target,
    hide: true,
    middleLabel: link.title,
    path: 'magnet',
  })
  line.show('draw', { duration: 300 })

  return line
}

/**
 * Create geolinks, which points to map by geo schema and id
 *
 * @param {HTMLElement} Elements contains anchor elements for doclinks
 * @returns {Boolean} ture is link is created, false if coordinates are invalid
 */
export const createGeoLink = (link) => {
  const url = new URL(link.href)
  const params = new URLSearchParams(link.search)
  const xyInParams = params.get('xy')?.split(',')?.map(Number)
  const [lon, lat] = url.href
    ?.match(coordPattern)
    ?.slice(1)
    ?.reverse()
    ?.map(Number)
  const xy = xyInParams ?? [lon, lat]

  if (!xy || isNaN(xy[0]) || isNaN(xy[1])) return false

  // Geo information in link
  link.dataset.lon = lon
  link.dataset.lat = lat
  link.dataset.crs = params.get('crs')
  link.classList.add('with-leader-line', 'geolink')
  // TODO refactor as data attribute
  link.targets = params.get('id')?.split(',') ?? null
  link.type = params.get('type') ?? null

  link.lines = []

  // Hover link for LeaderLine
  link.onmouseover = () => {
    if (link.dataset.valid === 'false') return

    const anchors = getMarkersFromMaps(link)
    anchors
      .filter(isAnchorVisible)
      .forEach(anchor => {
        const line = addLeaderLine(link, anchor)
        link.lines.push(line)
      })
  }
  link.onmouseout = () => removeLeaderLines(link)

  // Click to move camera
  link.onclick = (event) => {
    event.preventDefault()
    if (link.dataset.valid === 'false') return

    removeLeaderLines(link)
    getMarkersFromMaps(link)
      .forEach(updateMapCameraByMarker([
        Number(link.dataset.lon),
        Number(link.dataset.lat),
      ]))
  }

  // Use middle click to remove markers
  link.onauxclick = (e) => {
    if (e.which !== 2) return
    e.preventDefault()
    removeLeaderLines(link)
    getMarkersFromMaps(link)
      .forEach(marker => marker.remove())
  }
  return true
}

/**
 * CreateDocLink.
 *
 * @param {HTMLElement} Elements contains anchor elements for doclinks
 */
export const createDocLink = link => {
  link.classList.add('with-leader-line', 'doclink')
  link.lines = []
  const label = decodeURIComponent(link.href.split('#')[1])
  const selector = link.title.split('=>')[1] ?? '#' + label

  link.onmouseover = () => {
    const targets = document.querySelectorAll(selector)

    targets.forEach(target => {
      if (!target?.checkVisibility()) return

      // highlight selected target
      target.dataset.style = target.style.cssText
      const rect = target.getBoundingClientRect()
      const isTiny = rect.width < 100 || rect.height < 100
      if (isTiny) {
        target.style.background = 'lightPink'
      } else {
        target.style.outline = 'lightPink 6px dashed'
      }

      // point to selected target
      const line = new LeaderLine({
        start: link,
        end: target,
        middleLabel: LeaderLine.pathLabel({
          text: label,
          fontWeight: 'bold',
        }),
        hide: true,
        path: 'magnet',
      })
      link.lines.push(line)
      line.show('draw', { duration: 300 })
    })
  }
  link.onmouseout = () => {
    link.lines.forEach(line => line.remove())
    link.lines.length = 0

    // resume targets from highlight
    const targets = document.querySelectorAll(selector)
    targets.forEach(target => {
      target.style.cssText = target.dataset.style
      delete target.dataset.style
    })
  }
}

/**
 * removeLeaderLines. clean lines start from link
 *
 * @param {HTMLAnchorElement} link
 */
export const removeLeaderLines = link => {
  if (!link.lines) return
  link.lines.forEach(line => line.remove())
  link.lines = []
}

/**
 * updateMapByMarker. get function for updating map camera by marker
 *
 * @param {Number[]} xy
 * @return {Function} function
 */
const updateMapCameraByMarker = lonLat => marker => {
  const renderer = marker.closest('.mapclay')?.renderer
  renderer.updateCamera({ center: lonLat }, true)
}

/**
 * isAnchorVisible. check anchor(marker) is visible for current map camera
 *
 * @param {Element} anchor
 */
const isAnchorVisible = anchor => {
  const mapContainer = anchor.closest('.mapclay')
  return insideWindow(anchor) && insideParent(anchor, mapContainer)
}

/**
 * addAnchorByPoint.
 *
 * @param {point} options.point - object has {x, y} for window coordinates
 * @param {HTMLElement} options.map
 * @param {Function} options.validateAnchorName - validate anchor name is OK to use
 */
export const addAnchorByPoint = ({
  defaultName,
  point,
  map,
  validateAnchorName = () => true,
}) => {
  const rect = map.getBoundingClientRect()
  const [x, y] = map.renderer
    .unproject([point.x - rect.left, point.y - rect.top])
    .map(coord => parseFloat(coord.toFixed(6)))

  let prompt
  let anchorName

  do {
    prompt = prompt ? 'Anchor name exists' : 'Name this anchor'
    anchorName = window.prompt(prompt, defaultName ?? '')
  }
  while (anchorName !== null && !validateAnchorName(anchorName))
  if (anchorName === null) return

  const desc = window.prompt('Description', anchorName) ?? anchorName

  const link = `geo:${y},${x}?xy=${x},${y}&id=${map.id}&type=circle`
  const marker = map.renderer.addMarker({
    xy: [x, y],
    type: 'circle',
  })
  marker.dataset.xy = `${x},${y}`

  return { ref: anchorName, link, title: desc }
}
