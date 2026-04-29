javascript:(async () => {
  const BASE = 'http://localhost:8003/dist'
  const { generateMaps } = await import(BASE + '/dumbymap.mjs')

  // Inject dumbymap CSS
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = BASE + '/css/dumbymap.css'
  document.head.appendChild(link)

  // --- Element picker ---
  let hovered = null
  const cleanPicker = () => {
    document.removeEventListener('mouseover', onOver, true)
    document.removeEventListener('click', onPick, true)
    document.removeEventListener('keydown', onEsc)
    if (hovered) hovered.style.outline = ''
    document.body.style.cursor = ''
  }
  const onOver = e => {
    if (hovered) hovered.style.outline = ''
    hovered = e.target
    hovered.style.outline = '2px solid royalblue'
  }
  const onPick = e => {
    e.preventDefault()
    e.stopPropagation()
    cleanPicker()
    openModal(e.target)
  }
  const onEsc = e => { if (e.key === 'Escape') cleanPicker() }

  document.body.style.cursor = 'crosshair'
  document.addEventListener('mouseover', onOver, true)
  document.addEventListener('click', onPick, true)
  document.addEventListener('keydown', onEsc)

  // --- Modal ---
  function openModal (source) {
    // Inject style.css for .Dumby layout and typography
    const styleLink = document.createElement('link')
    styleLink.rel = 'stylesheet'
    styleLink.href = BASE + '/css/style.css'
    document.head.appendChild(styleLink)

    // Build modal overlay
    const overlay = document.createElement('div')
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#fff;display:flex;flex-direction:column;'

    // Close button bar
    const bar = document.createElement('div')
    bar.style.cssText = 'display:flex;justify-content:flex-end;padding:8px;background:#f5f5f5;border-bottom:1px solid #ddd;flex-shrink:0;'
    const closeBtn = document.createElement('button')
    closeBtn.textContent = 'Close'
    closeBtn.style.cssText = 'padding:4px 14px;font-size:14px;cursor:pointer;'
    closeBtn.addEventListener('click', () => {
      if (confirm('Close DumbyMap and return to the original page?')) {
        overlay.remove()
        link.remove()
        styleLink.remove()
      }
    })
    bar.appendChild(closeBtn)
    overlay.appendChild(bar)

    // Content container
    const container = document.createElement('div')
    container.style.cssText = 'flex:1;overflow:auto;'
    overlay.appendChild(container)

    // Clone source HTML, strip hardcoded style/class/id
    const clone = source.cloneNode(true)
    clone.removeAttribute('style')
    clone.removeAttribute('class')
    clone.removeAttribute('id')
    clone.querySelectorAll('[style],[class],[id]').forEach(el => {
      el.removeAttribute('style')
      el.removeAttribute('class')
      el.removeAttribute('id')
    })
    container.appendChild(clone)

    document.body.appendChild(overlay)
    generateMaps(container)
  }
})()
