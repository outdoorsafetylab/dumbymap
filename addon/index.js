/* global browser */
/* eslint-disable-next-line no-console */
console.log('content script loaded')

const url = new URL(window.location)
const use = url.searchParams.get('use')
if (url.host === 'www.ptt.cc') {
  const content = document.querySelector('#main-content')
  Array.from(content.childNodes)
    .filter(n => !(n instanceof window.HTMLElement))
    .forEach(text => {
      const span = document.createElement('span')
      span.innerText = text.textContent
      text.replaceWith(span)
    })
}

const contentSelectors = {
  'developer.mozilla': ':has(.section-content)',
  'hackmd.io': '#doc',
  'www.ptt.cc': '#main-content',
  'prosemirror.net': '.ProseMirror',
}
const contentSelector = contentSelectors[url.host]

const simpleRender = globalThis.renderWith(config => ({
  use: use ?? 'Leaflet',
  width: '100%',
  height: '200px',
  XYZ: 'https://tile.openstreetmap.jp/styles/osm-bright/512/{z}/{x}/{y}.png',
  ...config,
  aliases: {
    use: globalThis.mapclayRenderer,
    ...(config.aliases ?? {}),
  },
}))

const container = document.querySelector(contentSelector ?? 'main') ?? document.body

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  /* eslint-disable-next-line no-console */
  console.log('receive message', message)
  sendResponse('received')
  if (message.id === 'map-inline-add') {
    globalThis.generateMaps(container, {
      crs: url.searchParams.get('crs') ?? 'EPSG:4326',
      render: simpleRender,
    })
    return Promise.resolve('done')
  } else if (message.id === 'map-inline-menu') {
    container.dataset.menu = message.checked ? 'enabled' : 'disabled'
    return Promise.resolve('done')
  }
  return false
})
