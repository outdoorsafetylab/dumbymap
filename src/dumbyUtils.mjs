import LeaderLine from 'leader-line'
import { insideWindow, insideParent } from './utils'

/**
 * focusNextMap.
 *
 * @param {Boolean} reverse -- focus previous map
 */
export function focusNextMap (reverse = false) {
  const renderedList = this.utils.renderedMaps()
  const index = renderedList.findIndex(e => e.classList.contains('focus'))
  const nextIndex = (index + (reverse ? -1 : 1)) % renderedList.length

  const nextMap = renderedList.at(nextIndex)
  nextMap.classList.add('focus')
  nextMap.scrollIntoView({ behavior: 'smooth' })
}

/**
 * focusNextBlock.
 *
 * @param {Boolean} reverse -- focus previous block
 */
export function focusNextBlock (reverse = false) {
  const blocks = this.blocks.filter(b =>
    b.checkVisibility({
      contentVisibilityAuto: true,
      opacityProperty: true,
      visibilityProperty: true
    })
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
 * @param {HTMLElement} block -- Scroll to this element
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
 * @param {Boolean} reverse -- Switch to previous one
 */
export function switchToNextLayout (reverse = false) {
  const layouts = this.layouts
  const currentLayoutName = this.container.getAttribute('data-layout')
  const currentIndex = layouts.map(l => l.name).indexOf(currentLayoutName)
  const padding = reverse ? -1 : 1
  const nextIndex =
    currentIndex === -1
      ? 0
      : (currentIndex + padding + layouts.length) % layouts.length
  const nextLayout = layouts[nextIndex]
  this.container.setAttribute('data-layout', nextLayout.name)
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
      .querySelectorAll('.mapclay[data-render="fulfilled"]')
  )
  return maps
    .filter(map => link.targets ? link.targets.includes(map.id) : true)
    .map(map => {
      const renderer = map.renderer
      const markerTitle = `${link.targets ?? 'all'}@${link.xy}`

      return map.querySelector(`.marker[title="${markerTitle}"]`) ??
        renderer.addMarker({
          xy: link.xy,
          title: markerTitle
        })
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
    middleLabel: link.url.searchParams.get('text'),
    path: 'magnet'
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
  const xyInParams = url.searchParams.get('xy')?.split(',')?.map(Number)
  const xy = xyInParams ?? url?.href
    ?.match(/^geo:([0-9.,]+)/)
    ?.at(1)
    ?.split(',')
    ?.reverse()
    ?.map(Number)

  if (!xy || isNaN(xy[0]) || isNaN(xy[1])) return false

  // Geo information in link
  link.url = url
  link.xy = xy
  link.classList.add('with-leader-line', 'geolink')
  link.targets = link.url.searchParams.get('id')?.split(',') ?? null

  link.lines = []

  // LeaderLine
  link.onmouseover = () => {
    const anchors = getMarkersFromMaps(link)
    anchors
      .filter(isAnchorVisible)
      .forEach(anchor => {
        const line = addLeaderLine(link, anchor)
        link.lines.push(line)
      })
  }
  link.onmouseout = () => removeLeaderLines(link)
  link.onclick = (event) => {
    event.preventDefault()
    removeLeaderLines(link)
    getMarkersFromMaps(link).forEach(updateMapCameraByMarker(link.xy))
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

  link.onmouseover = () => {
    const label = decodeURIComponent(link.href.split('#')[1])
    const selector = link.title.split('=>')[1] ?? '#' + label
    const targets = document.querySelectorAll(selector)

    targets.forEach(target => {
      if (!target?.checkVisibility()) return

      const line = new LeaderLine({
        start: link,
        end: target,
        middleLabel: LeaderLine.pathLabel({
          text: label,
          fontWeight: 'bold'
        }),
        hide: true,
        path: 'magnet'
      })
      link.lines.push(line)
      line.show('draw', { duration: 300 })
    })
  }
  link.onmouseout = () => {
    link.lines.forEach(line => line.remove())
    link.lines.length = 0
  }
}

/**
 * removeLeaderLines. clean lines start from link
 *
 * @param {HTMLAnchorElement} link
 */
const removeLeaderLines = link => {
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
const updateMapCameraByMarker = xy => marker => {
  console.log('update')
  const renderer = marker.closest('.mapclay')?.renderer
  renderer.updateCamera({ center: xy }, true)
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
