import LeaderLine from 'leader-line'

export function focusNextMap (reverse = false) {
  const renderedList = this.utils.renderedMaps()
  const index = renderedList.findIndex(e => e.classList.contains('focus'))
  const nextIndex =
    index === -1 ? 0 : (index + (reverse ? -1 : 1)) % renderedList.length

  const nextMap = renderedList.at(nextIndex)
  nextMap.classList.add('focus')
}

export function focusNextBlock (reverse = false) {
  const blocks = this.blocks.filter(b =>
    b.checkVisibility({
      contentVisibilityAuto: true,
      opacityProperty: true,
      visibilityProperty: true
    })
  )
  const index = blocks.findIndex(e => e.classList.contains('focus'))
  const nextIndex =
    index === -1 ? 0 : (index + (reverse ? -1 : 1)) % blocks.length

  blocks.forEach(b => b.classList.remove('focus'))
  const nextBlock = blocks.at(nextIndex)
  nextBlock?.classList?.add('focus')
  scrollToBlock(nextBlock)
}

// Consider block is bigger then viewport height
export const scrollToBlock = block => {
  const parentRect = block.parentElement.getBoundingClientRect()
  const scrollBlock =
    block.getBoundingClientRect().height > parentRect.height * 0.8
      ? 'nearest'
      : 'center'
  block.scrollIntoView({ behavior: 'smooth', block: scrollBlock })
}

export function focusDelay () {
  return window.window.getComputedStyle(this.showcase).display === 'none' ? 50 : 300
}

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

export function removeBlockFocus () {
  this.blocks.forEach(b => b.classList.remove('focus'))
}

/**
 * Create geolinks, which points to map by geo schema and id
 *
 * @param {HTMLElement} Elements contains anchor elements for doclinks
 * @returns {Boolean} ture is link is created, false if coordinates are invalid
 */
export const createGeoLink = (link, callback = null) => {
  const url = new URL(link.href)
  const xyInParams = url.searchParams.get('xy')
  const xy = xyInParams
    ? xyInParams.split(',')?.map(Number)
    : url?.href
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

  // LeaderLine
  link.lines = []
  callback?.call(this, link)

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
    const target = document.querySelector(selector)
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
  }
  link.onmouseout = () => {
    link.lines.forEach(line => line.remove())
    link.lines.length = 0
  }
}
