console.log('background')

browser.contextMenus.create(
  {
    id: 'map-inline',
    title: 'MapInline',
    contexts: ['page', 'selection'],
  },
  () => void browser.runtime.lastError,
)

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'map-inline') return

  browser.tabs.sendMessage(tab.id, 'map-inline')
})
