import LeaderLine from 'leader-line'
import { replaceTextNodes, full2Half } from './utils'
import proj4 from 'proj4'
import { coordPattern, GeoLink } from './Link.mjs'

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
 * addMarkerByPoint.
 *
 * @param {Number[]} options.point - page XY
 * @param {HTMLElement} options.map
 */
export const addMarkerByPoint = ({ point, map }) => {
  const rect = map.getBoundingClientRect()
  const [lon, lat] = map.renderer
    .unproject([point[0] - rect.left, point[1] - rect.top])
    .map(value => parseFloat(value.toFixed(6)))

  const marker = map.renderer.addMarker({
    xy: [lon, lat],
  })
  marker.dataset.xy = `${lon},${lat}`

  return marker
}

/**
 * addGeoSchemeByText.
 *
 * @param {Node} node
 */
export const addGeoSchemeByText = async (node) => {
  const digit = '[\\d\\uFF10-\\uFF19]'
  const decimal = '[.\\uFF0E]'
  const coordPatterns = `(-?${digit}+${decimal}?${digit}*)([,\x2F\uFF0C])(-?${digit}+${decimal}?${digit}*)`
  const re = new RegExp(coordPatterns, 'g')

  return replaceTextNodes(node, re, match => {
    const [x, y] = [full2Half(match.at(1)), full2Half(match.at(3))]
    // Don't process string which can be used as date
    if (Date.parse(match.at(0) + ' 1990')) return null

    const a = document.createElement('a')
    a.className = 'not-geolink from-text'
    a.href = `geo:0,0?xy=${x},${y}`
    a.textContent = match.at(0)
    return a
  })
}

/**
 * @description Add more information into Anchor Element within Geo Scheme by CRS
 * @param {String} crs - EPSG/ESRI Code for CRS
 * @return {Function} - Function for link
 */
export const updateGeoSchemeByCRS = (crs) => (link) => {
  const transform = proj4(crs, 'EPSG:4326')
  const params = new URLSearchParams(link.search)
  let xy = params.get('xy')?.split(',')?.map(Number)

  // Set coords for Geo Scheme
  if (link.href.startsWith('geo:0,0')) {
    if (!xy) return null

    const [lon, lat] = transform.forward(xy)
      .map(value => parseFloat(value.toFixed(6)))
    link.href = `geo:${lat},${lon}`
  }

  const [lat, lon] = link.href
    .match(coordPattern)
    .slice(1)
    .map(Number)

  if (!xy) {
    xy = transform.inverse([lon, lat])
    params.set('xy', xy)
  }

  // set query strings
  params.set('crs', crs)
  params.set('q', `${lat},${lon}`)
  link.search = params

  const unit = proj4(crs).oProj.units
  const invalidDegree = unit === 'degrees' &&
    (lon > 180 || lon < -180 || lat > 90 || lat < -90)
  const invalidMeter = unit === 'm' && xy.find(v => v < 100)
  if (invalidDegree || invalidMeter) {
    link.replaceWith(document.createTextNode(link.textContent))
    return null
  }

  return link
}

/**
 * addGeoLinkByDrag.
 *
 * @param {HTMLElement} container
 * @param {Range} range
 */
export const addGeoLinkByDrag = (container, range, endOfLeaderLine) => {
  // link placeholder when dragging
  container.classList.add('dragging-geolink')
  const link = document.createElement('a')
  link.textContent = range.toString()
  link.classList.add('with-leader-line', 'geolink', 'drag', 'from-text')

  // Replace current content with link
  const originContent = range.cloneContents()
  const resumeContent = () => {
    range.deleteContents()
    range.insertNode(originContent)
  }
  range.deleteContents()
  range.insertNode(link)

  // Add leader-line
  const line = new LeaderLine({
    start: link,
    end: endOfLeaderLine,
    path: 'magnet',
  })

  const positionObserver = new window.MutationObserver(() => {
    line.position()
  })
  positionObserver.observe(endOfLeaderLine, {
    attributes: true,
    attributeFilter: ['style'],
  })

  // Handler for dragend
  container.onmouseup = (e) => {
    container.classList.remove('dragging-geolink')
    container.onmousemove = null
    container.onmouseup = null
    link.classList.remove('drag')
    positionObserver.disconnect()
    line.remove()
    endOfLeaderLine.remove()

    const map = document.elementFromPoint(e.clientX, e.clientY)
      .closest('.mapclay[data-render="fulfilled"]')
    if (!map) {
      resumeContent()
      return
    }

    const marker = addMarkerByPoint({ point: [e.clientX, e.clientY], map })
    if (!marker) {
      resumeContent()
      return
    }

    link.href = `geo:${marker.dataset.xy.split(',').reverse()}`
    GeoLink(link)
  }
}
