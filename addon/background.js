console.log('background')

browser.contextMenus.create(
  {
    id: 'map-inline-add',
    title: 'Add a Map',
    contexts: ['page'],
  },
  () => void browser.runtime.lastError,
)

browser.contextMenus.create(
  {
    id: 'map-inline-open',
    title: 'Open in DumbyMap',
    contexts: ['page', 'selection'],
  },
  () => void browser.runtime.lastError,
)

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.menuItemId.match(/^map-inline/)) return

  browser.tabs.sendMessage(tab.id, info.menuItemId)
})
