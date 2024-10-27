browser.contextMenus.create(
  {
    id: 'map-inline-add',
    title: 'Add Links and Maps by content',
    contexts: ['page'],
  },
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
  const id = info.menuItemId
  if (!id.match(/^map-inline/)) return

  browser.tabs.sendMessage(tab.id, id)
})

browser.browserAction.onClicked.addListener((info) => {
  browser.tabs.sendMessage(info.id, 'map-inline-add')
})
