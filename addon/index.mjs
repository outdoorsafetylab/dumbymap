const { Leaflet } = window.mapclay.renderers
const simpleRender = window.mapclay.renderWith(config => ({
  use: 'Leaflet',
  width: '100%',
  height: '200px',
  XYZ: 'https://tile.openstreetmap.jp/styles/osm-bright/512/{z}/{x}/{y}.png',
  ...config,
  aliases: {
    use: { Leaflet },
    ...(config.aliases ?? {}),
  },
}))

window.generateMaps(document.querySelector('main') ?? document.body, {
  initialLayout: '',
  render: simpleRender,
})
