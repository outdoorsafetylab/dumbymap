/* global browser */

browser.contextMenus.create(
  {
    id: 'map-inline-add',
    title: 'Add Links and Maps by content',
    contexts: ['all'],
  },
)

browser.contextMenus.create(
  {
    id: 'map-inline-menu',
    title: 'Enable Menu',
    type: 'checkbox',
    checked: true,
    contexts: ['all'],
  },
)

browser.contextMenus.create(
  {
    type: 'separator',
  },
)

browser.contextMenus.create(
  {
    id: 'map-inline-open',
    title: 'Open in DumbyMap',
    contexts: ['all'],
  },
  () => browser.runtime.lastError,
)

browser.contextMenus.onClicked.addListener((info, tab) => {
  const id = info.menuItemId
  const checked = info.checked
  if (!id.match(/^map-inline/)) return

  browser.tabs.sendMessage(tab.id, { id, checked })
})

browser.browserAction.onClicked.addListener((info) => {
  browser.tabs.sendMessage(info.id, 'map-inline-add')
})
