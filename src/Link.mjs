import LeaderLine from 'leader-line'
import { insideWindow, insideParent } from './utils'

/** VAR: pattern for coodinates */
export const coordPattern = /^geo:([-]?[0-9.]+),([-]?[0-9.]+)/

/**
 * Class: GeoLink - link for maps
 *
 * @extends {window.HTMLAnchorElement}
 */
export class GeoLink extends window.HTMLAnchorElement {
  static replaceWith = (link) =>
    link.replaceWith(new GeoLink(link))

  /**
   * Creates a new GeoLink instance
   *
   * @param {HTMLAnchorElement} link
   */
  constructor (link) {
    super()
    this.innerHTML = link.innerHTML
    this.href = link.href

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
    this.dataset.lon = lon
    this.dataset.lat = lat
    this.dataset.crs = params.get('crs')
    this.classList.add('with-leader-line', 'geolink')
    this.classList.remove('not-geolink')
    // TODO refactor as data attribute
    this.targets = params.get('id')?.split(',') ?? null
    this.title = 'Left-Click to move Camera, Middle-Click to clean anchor'
    this.lines = []

    // Hover link for LeaderLine
    this.onmouseover = () => this.getMarkersFromMaps(this)
      .filter(isAnchorVisible)
      .forEach(anchor => {
        const labelText = new URL(this).searchParams.get('text') ?? this.textContent
        const line = new LeaderLine({
          start: this,
          end: anchor,
          hide: true,
          middleLabel: labelText,
          path: 'magnet',
        })
        line.show('draw', { duration: 300 })

        this.lines.push(line)
      })

    this.onmouseout = () => removeLeaderLines(this)

    // Click to move camera
    this.onclick = (event) => {
      event.preventDefault()
      removeLeaderLines(this)
      this.getMarkersFromMaps().forEach(marker => {
        const map = marker.closest('.mapclay')
        map.scrollIntoView({ behavior: 'smooth' })
        updateMapCameraByMarker([
          Number(this.dataset.lon),
          Number(this.dataset.lat),
        ])(marker)
      })
    }

    // Use middle click to remove markers
    this.onauxclick = (e) => {
      if (e.which !== 2) return
      e.preventDefault()
      removeLeaderLines(this)
      this.getMarkersFromMaps()
        .forEach(marker => marker.remove())
    }
  }

  /**
   * getMarkersFromMaps. Get marker elements by GeoLink
   *
   * @param {HTMLAnchorElement} link
   * @return {HTMLElement[]} markers
   */
  getMarkersFromMaps () {
    const params = new URLSearchParams(this.search)
    const maps = Array.from(
      this.closest('.Dumby')
        .querySelectorAll('.mapclay[data-render="fulfilled"]'),
    )
    return maps
      .filter(map => this.targets ? this.targets.includes(map.id) : true)
      .map(map => {
        const renderer = map.renderer
        const lonLat = [Number(this.dataset.lon), Number(this.dataset.lat)]

        const marker = map.querySelector(`.marker[data-xy="${lonLat}"]`) ??
          renderer.addMarker({
            xy: lonLat,
            type: params.get('type') ?? null,
          })
        marker.dataset.xy = lonLat
        marker.title = new URLSearchParams(this.search).get('xy') ?? lonLat
        const crs = this.dataset.crs
        if (crs && crs !== 'EPSG:4326') {
          marker.title += '@' + this.dataset.crs
        }

        return marker
      })
  }
}
if (!window.customElements.get('dumby-geolink')) {
  window.customElements.define('dumby-geolink', GeoLink, { extends: 'a' })
}

/**
 * Class: DocLink - link for DOM
 *
 * @extends {window.HTMLAnchorElement}
 */
export class DocLink extends window.HTMLAnchorElement {
  static replaceWith = (link) =>
    link.replaceWith(new DocLink(link))

  /**
   * Creates a new DocLink instance
   *
   * @param {HTMLAnchorElement} link
   */
  constructor (link) {
    super()
    this.innerHTML = link.innerHTML
    this.href = link.href

    const label = decodeURIComponent(link.href.split('#')[1])
    const selector = link.title.split('=>')[1] ?? (label ? '#' + label : null)
    if (!selector) return false

    this.classList.add('with-leader-line', 'doclink')
    this.lines = []

    this.onmouseover = () => {
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
          start: this,
          end: target,
          middleLabel: LeaderLine.pathLabel({
            text: label,
            fontWeight: 'bold',
          }),
          hide: true,
          path: 'magnet',
        })
        this.lines.push(line)
        line.show('draw', { duration: 300 })
      })
    }

    this.onmouseout = () => {
      removeLeaderLines(this)

      // resume targets from highlight
      const targets = document.querySelectorAll(selector)
      targets.forEach(target => {
        target.style.cssText = target.dataset.style
        delete target.dataset.style
      })
    }
  }
}
if (!window.customElements.get('dumby-doclink')) {
  window.customElements.define('dumby-doclink', DocLink, { extends: 'a' })
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
