console.log('content script loaded')

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('receive message', message)
  sendResponse('received')
  if (message === 'map-inline') {
    alert('msg', message)
    return Promise.resolve('done')
  }
  return false
})

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

const blockSelectors = {
  'developer.mozilla': '.section-content',
  'hackmd.io': '#doc > *',
  'www.ptt.cc': '#main-content > span',
  'prosemirror.net': '.ProseMirror > *',
}
const blockSelector = blockSelectors[url.host]

const addBlocks = blockSelector
  ? root => Array.from(root.querySelectorAll(blockSelector))
  : undefined

const simpleRender = window.mapclay.renderWith(config => ({
  use: use ?? 'Leaflet',
  width: '100%',
  height: '200px',
  XYZ: 'https://tile.openstreetmap.jp/styles/osm-bright/512/{z}/{x}/{y}.png',
  ...config,
  aliases: {
    use: window.mapclay.renderers,
    ...(config.aliases ?? {}),
  },
}))

if (!document.querySelector('.Dumby')) {
  window.generateMaps(document.querySelector('main') ?? document.body, {
    crs: url.searchParams.get('crs') ?? 'EPSG:4326',
    addBlocks,
    initialLayout: 'sticky',
    render: simpleRender,
    autoMap: false,
  })
}
