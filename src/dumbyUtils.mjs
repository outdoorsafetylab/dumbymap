import LeaderLine from 'leader-line'
import { insideWindow, insideParent, replaceTextNodes } from './utils'
import proj4 from 'proj4'

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
  const labelText = new URL(link).searchParams.get('text') ?? link.textContent
  const line = new LeaderLine({
    start: link,
    end: target,
    hide: true,
    middleLabel: labelText,
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
  link.title = 'Left-Click to move Camera, Middle-Click to clean anchor'

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
  return true
}

/**
 * CreateDocLink.
 *
 * @param {HTMLElement} Elements contains anchor elements for doclinks
 */
export const createDocLink = link => {
  const label = decodeURIComponent(link.href.split('#')[1])
  const selector = link.title.split('=>')[1] ?? label ? '#' + label : null
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
  link.lines.forEach(line => {
    line.hide('draw', { duration: 300 })
    setTimeout(() => {
      line.remove()
    }, 300)
  })
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
    type: 'circle',
  })
  marker.dataset.xy = `${lon},${lat}`

  return marker
}

/**
 * setGeoSchemeByCRS.
 * @description Add more information into Anchor Element within Geo Scheme by CRS
 * @param {String} crs - EPSG/ESRI Code for CRS
 * @return {Function} - Function for link
 */
export const setGeoSchemeByCRS = (crs) => (link) => {
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
  const invalidDegree = unit === 'degrees' && (
    (lon > 180 || lon < -180 || lat > 90 || lat < -90) ||
    (xy.every(v => v.toString().length < 3))
  )
  const invalidMeter = unit === 'm' && xy.find(v => v < 100)
  if (invalidDegree || invalidMeter) {
    link.replaceWith(document.createTextNode(link.textContent))
    return null
  }

  return link
}

/**
 * dragForAnchor.
 *
 * @param {HTMLElement} container
 * @param {Range} range
 */
export const dragForAnchor = (container, range, endOfLeaderLine) => {
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
    geoLink.classList.remove('drag')
    positionObserver.disconnect()
    line.remove()

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

    geoLink.href = `geo:${marker.dataset.xy.split(',').reverse()}`
    createGeoLink(geoLink)
  }
}

export const addGeoSchemeByText = async (element) => {
  const coordPatterns = /(-?\d+\.?\d*)([,\x2F\uFF0C])(-?\d+\.?\d*)/
  const re = new RegExp(coordPatterns, 'g')
  replaceTextNodes(element, re, match => {
    const a = document.createElement('a')
    a.href = `geo:0,0?xy=${match.at(1)},${match.at(3)}`
    a.textContent = match.at(0)
    return a
  })
}
