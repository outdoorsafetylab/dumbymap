import LeaderLine from 'leader-line'
import { insideWindow, insideParent } from './utils'
import * as markers from './marker.mjs'

/**
 * GeoLink: anchor element with geo scheme and properties about maps
 * @typedef {Object} GeoLink
 * @extends HTMLAnchorElement
 * @property {string[]} targets - ids of target map elements
 * @property {LeaderLine[]} lines
 * @property {Object} dataset
 * @property {string} dataset.lon - longitude string of geo scheme
 * @property {string} dataset.lat - latitude string of geo scheme
 * @property {string} dataset.crs - short name of CRS in EPSG/ESRI format
 */

/**
 * DocLink: anchor element which points to DOM node by filter
 * @typedef {Object} DocLink
 * @extends HTMLAnchorElement
 * @property {LeaderLine[]} lines
 */

/** VAR: pattern for coodinates */
export const coordPattern = /^geo:([-]?[0-9.]+),([-]?[0-9.]+)/

/**
 * GeoLink: append GeoLink features onto anchor element
 * @param {HTMLAnchorElement} link
 * @return {GeoLink}
 */
export const GeoLink = (link) => {
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
  link.classList.remove('not-geolink')
  // TODO refactor as data attribute
  link.title = 'Left-Click to move Camera, Middle-Click to clean anchor'
  link.targets = params.get('id')?.split(',') ?? null
  link.lines = []

  // Hover link for LeaderLine
  link.onmouseover = () => getMarkersFromMaps(link)
    .filter(isAnchorVisible)
    .forEach(anchor => {
      const labelText = new URL(link).searchParams.get('text') ?? link.textContent
      const line = new LeaderLine({
        start: link,
        end: anchor,
        hide: true,
        middleLabel: labelText,
        path: 'magnet',
        path: link.dataset.linePath ?? 'magnet',
      })
      line.show('draw', { duration: 300 })

      link.lines.push(line)
    })

  link.onmouseout = () => removeLeaderLines(link)

  // Click to move camera
  link.onclick = (event) => {
    event.preventDefault()
    removeLeaderLines(link)
    getMarkersFromMaps(link).forEach(marker => {
      const map = marker.closest('.mapclay')
      map.scrollIntoView({ behavior: 'smooth' })
      updateMapCameraByMarker([
        Number(link.dataset.lon),
        Number(link.dataset.lat),
      ])(marker)
    })
  }

  // Use middle click to remove markers
  link.onauxclick = (e) => {
    if (e.which !== 2) return
    e.preventDefault()
    removeLeaderLines(link)
    getMarkersFromMaps(link)
      .forEach(marker => marker.remove())
  }

  return link
}

/**
 * GeoLink: getMarkersFromMaps. Get marker elements by GeoLink
 *
 * @param {GeoLink} link
 * @return {HTMLElement[]} markers
 */
export const getMarkersFromMaps = (link) => {
  const params = new URLSearchParams(link.search)
  const maps = Array.from(
    link.closest('.Dumby')
      .querySelectorAll('.mapclay[data-render="fulfilled"]'),
  )
  return maps
    .filter(map => link.targets ? link.targets.includes(map.id) : true)
    .map(map => {
      const renderer = map.renderer
      const lonLat = [Number(link.dataset.lon), Number(link.dataset.lat)]
      const type = params.get('type') ?? 'pin'
      const svg = markers[type]
      const element = document.createElement('div')
      element.style.cssText = `width: ${svg.size[0]}px; height: ${svg.size[1]}px;`
      element.innerHTML = svg.html

      const marker = map.querySelector(`.marker[data-xy="${lonLat}"]`) ??
        renderer.addMarker({
          xy: lonLat,
          element,
          // FIXME In conten script, leaflet cannot render marker with HTMLElement
          // so pass html string here
          html: svg.html,
          type,
          anchor: svg.anchor,
          size: svg.size,
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
 * DocLink: append DocLink features onto anchor element
 * @param {HTMLAnchorElement} link
 * @return {DocLink}
 */
export const DocLink = (link) => {
  const label = decodeURIComponent(link.href.split('#')[1])
  const selector = link.title.split('=>')[1] ?? (label ? '#' + label : null)
  if (!selector) return false

  link.classList.add('with-leader-line', 'doclink')
  link.lines = []

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
        path: link.dataset.linePath ?? 'magnet',
      })
      link.lines.push(line)
      line.show('draw', { duration: 300 })
    })
  }

  link.onmouseout = () => {
    removeLeaderLines(link)

    // resume targets from highlight
    const targets = document.querySelectorAll(selector)
    targets.forEach(target => {
      target.style.cssText = target.dataset.style
      delete target.dataset.style
    })
  }

  return link
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
 * removeLeaderLines. clean lines start from link
 *
 * @param {GeoLink} link
 */
export const removeLeaderLines = link => {
  if (!link.lines) return
  link.lines.forEach(line => {
    line.hide('draw', { duration: 300 })
    setTimeout(() => {
      line.remove()
    }, 300)
  })
  link.lines = []
}
