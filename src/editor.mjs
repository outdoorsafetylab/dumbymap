/* global EasyMDE */
/* eslint no-undef: "error" */
import { markdown2HTML, generateMaps } from './dumbymap'
import { defaultAliases, parseConfigsFromYaml } from 'mapclay'
import * as menuItem from './MenuItem'
import { shiftByWindow } from './utils.mjs'

// Set up Containers {{{

const context = document.querySelector('[data-mode]')
const dumbyContainer = document.querySelector('.DumbyMap')
const textArea = document.querySelector('.editor textarea')
let dumbymap

new window.MutationObserver(() => {
  const mode = context.getAttribute('data-mode')
  const layout = dumbyContainer.getAttribute('data-layout')
  if (mode === 'editing' && layout !== 'normal') {
    dumbyContainer.setAttribute('data-layout', 'normal')
  }
}).observe(context, {
  attributes: true,
  attributeFilter: ['data-mode'],
  attributeOldValue: true
})

/**
 * toggle editing mode
 */
const toggleEditing = () => {
  const mode = context.getAttribute('data-mode')
  context.setAttribute('data-mode', mode === 'editing' ? '' : 'editing')
}
// }}}
// Set up EasyMDE {{{

// Content values for editor

const defaultContent =
  '## Links\n\n- [Go to marker](geo:24,121?id=foo,leaflet&text=normal "Link Test")\n\n```map\nid: foo\nuse: Maplibre\n```\n'
const editor = new EasyMDE({
  element: textArea,
  initialValue: defaultContent,
  autosave: {
    enabled: true,
    uniqueId: 'dumbymap'
  },
  indentWithTabs: false,
  lineNumbers: true,
  promptURLs: true,
  uploadImage: true,
  spellChecker: false,
  toolbarButtonClassPrefix: 'mde',
  status: false,
  shortcuts: {
    map: 'Ctrl-Alt-M',
    debug: 'Ctrl-Alt-D',
    toggleUnorderedList: null,
    toggleOrderedList: null
  },
  toolbar: [
    {
      name: 'roll',
      title: 'Roll a dice',
      text: '\u{2684}',
      action: () => toggleEditing()
    },
    {
      name: 'debug',
      title: 'Save content as URL',
      text: '\u{1F4BE}',
      action: () => {
        const state = { content: editor.value() }
        window.location.hash = encodeURIComponent(JSON.stringify(state))
        navigator.clipboard.writeText(window.location.href)
        window.alert('URL copied to clipboard')
      }
    },
    {
      name: 'undo',
      title: 'Undo last editing',
      text: '\u27F2',
      action: EasyMDE.undo
    },
    {
      name: 'redo',
      text: '\u27F3',
      title: 'Redo editing',
      action: EasyMDE.redo
    },
    '|',
    {
      name: 'heading-1',
      text: 'H1',
      title: 'Big Heading',
      action: EasyMDE['heading-1']
    },
    {
      name: 'heading-2',
      text: 'H2',
      title: 'Medium Heading',
      action: EasyMDE['heading-2']
    },
    '|',
    {
      name: 'link',
      text: '\u{1F517}',
      title: 'Create Link',
      action: EasyMDE.drawLink
    },
    {
      name: 'image',
      text: '\u{1F5BC}',
      title: 'Create Image',
      action: EasyMDE.drawImage
    },
    '|',
    {
      name: 'Bold',
      text: '\u{1D401}',
      title: 'Bold',
      action: EasyMDE.toggleBold
    },
    {
      name: 'Italic',
      text: '\u{1D43C}',
      title: 'Italic',
      action: EasyMDE.toggleItalic
    }
  ]
})

const cm = editor.codemirror

/**
 * get state of website from hash string
 *
 * @param {String} hash
 */
const getStateFromHash = hash => {
  const hashValue = hash.substring(1)
  const stateString = decodeURIComponent(hashValue)
  try {
    return JSON.parse(stateString) ?? {}
  } catch (_) {
    return {}
  }
}

/**
 * get editor content from hash string
 *
 * @param {} hash
 */
const getContentFromHash = hash => {
  const state = getStateFromHash(hash)
  return state.content
}

const initialState = getStateFromHash(window.location.hash)
window.location.hash = ''
const contentFromHash = initialState.content

// Seems like autosave would overwrite initialValue, set content from hash here
if (contentFromHash) {
  editor.cleanup()
  editor.value(contentFromHash)
}
// }}}
// Set up logic about editor content {{{

const htmlOnScroll = (ele) => () => {
  if (textArea.dataset.scrollLine) return

  const threshold = ele.scrollTop + window.innerHeight / 2 + 30
  const block = Array.from(ele.children)
    .findLast(e => e.offsetTop < threshold) ??
    ele.firstChild

  const line = Array.from(block.querySelectorAll('p'))
    .findLast(e => e.offsetTop + block.offsetTop < threshold)
  const linenumber = line?.dataset?.sourceLine
  if (!linenumber) return
  const offset = (line.offsetTop + block.offsetTop - ele.scrollTop)

  clearTimeout(dumbyContainer.timer)
  if (linenumber) {
    dumbyContainer.dataset.scrollLine = linenumber + '/' + offset
    dumbyContainer.timer = setTimeout(
      () => delete dumbyContainer.dataset.scrollLine,
      50
    )
  }
}

// Sync CodeMirror LineNumber with HTML Contents
new window.MutationObserver(() => {
  const line = dumbyContainer.dataset.scrollLine
  if (line) {
    const [lineNumber, offset] = line.split('/')

    if (!isNaN(lineNumber)) {
      cm.scrollIntoView({ line: lineNumber, ch: 0 }, offset)
    }
  }
}).observe(dumbyContainer, {
  attributes: true,
  attributeFilter: ['data-scroll-line']
})

cm.on('scroll', () => {
  if (dumbyContainer.dataset.scrollLine) return

  const scrollInfo = cm.getScrollInfo()
  const lineNumber = cm.lineAtHeight(scrollInfo.top, 'local')
  textArea.dataset.scrollLine = lineNumber

  clearTimeout(textArea.timer)
  textArea.timer = setTimeout(
    () => delete textArea.dataset.scrollLine,
    1000
  )
})

// Sync HTML Contents with CodeMirror LineNumber
new window.MutationObserver(() => {
  const line = textArea.dataset.scrollLine
  let lineNumber = Number(line)
  let p
  if (isNaN(lineNumber)) return

  const paragraphs = Array.from(dumbymap.htmlHolder.querySelectorAll('p'))
  do {
    p = paragraphs.find(p => Number(p.dataset.sourceLine) === lineNumber)
    lineNumber++
  } while (!p && lineNumber < cm.doc.size)
  if (!p) return

  const coords = cm.charCoords({ line: lineNumber, ch: 0 }, 'window')
  p.scrollIntoView()
  dumbymap.htmlHolder.scrollBy(0, -coords.top + 30)
}).observe(textArea, {
  attributes: true,
  attributeFilter: ['data-scroll-line']
})

markdown2HTML(dumbyContainer, editor.value())

/**
 * addClassToCodeLines. Quick hack to style lines inside code block
 */
const addClassToCodeLines = () => {
  const lines = cm.getLineHandle(0).parent.lines
  let insideCodeBlock = false
  lines.forEach((line, index) => {
    if (line.text.match(/^[\u0060]{3}/)) {
      insideCodeBlock = !insideCodeBlock
    } else if (insideCodeBlock) {
      cm.addLineClass(index, 'text', 'inside-code-block')
    } else {
      cm.removeLineClass(index, 'text', 'inside-code-block')
    }
  })
}
addClassToCodeLines()

/**
 * completeForCodeBlock.
 *
 * @param {Object} change -- codemirror change object
 */
const completeForCodeBlock = change => {
  const line = change.to.line
  if (change.origin === '+input') {
    const text = change.text[0]

    // Completion for YAML doc separator
    if (
      text === '-' &&
      change.to.ch === 0 &&
      insideCodeblockForMap(cm.getCursor())
    ) {
      cm.setSelection({ line, ch: 0 }, { line, ch: 1 })
      cm.replaceSelection(text.repeat(3) + '\n')
    }

    // Completion for Code fence
    if (text === '`' && change.to.ch === 0) {
      cm.setSelection({ line, ch: 0 }, { line, ch: 1 })
      cm.replaceSelection(text.repeat(3))
      const numberOfFences = cm
        .getValue()
        .split('\n')
        .filter(line => line.match(/[\u0060]{3}/)).length
      if (numberOfFences % 2 === 1) {
        cm.replaceSelection('map\n\n```')
        cm.setCursor({ line: line + 1 })
      }
    }
  }

  // For YAML doc separator, <hr> and code fence
  // Auto delete to start of line
  if (change.origin === '+delete') {
    const match = change.removed[0].match(/^[-\u0060]$/)?.at(0)
    if (match && cm.getLine(line) === match.repeat(2) && match) {
      cm.setSelection({ line, ch: 0 }, { line, ch: 2 })
      cm.replaceSelection('')
    }
  }
}

/* Disable debounce temporarily */
// const debounceForMap = (() => {
//   const timer = null
//
//   return function (...args) {
//     dumbymap = generateMaps.apply(this, args)
// clearTimeout(timer);
// timer = setTimeout(() => {
//   dumbymap = generateMaps.apply(this, args)
// }, 10);
//   }
// })()

/**
 * update content of HTML about Dumbymap
 */
const updateDumbyMap = () => {
  markdown2HTML(dumbyContainer, editor.value())
  // debounceForMap(HtmlContainer, afterMapRendered)
  dumbymap = generateMaps(dumbyContainer)

  const htmlHolder = dumbymap.htmlHolder
  htmlHolder.onscroll = htmlOnScroll(htmlHolder)
}
updateDumbyMap()

// Re-render HTML by editor content
cm.on('change', (_, change) => {
  updateDumbyMap()
  addClassToCodeLines()
  completeForCodeBlock(change)
})

// Set class for focus
cm.on('focus', () => {
  cm.getWrapperElement().classList.add('focus')
  dumbyContainer.classList.remove('focus')
})

cm.on('beforeChange', (_, change) => {
  const line = change.to.line
  // Don't allow more content after YAML doc separator
  if (change.origin.match(/^(\+input|paste)$/)) {
    if (cm.getLine(line) === '---' && change.text[0] !== '') {
      change.cancel()
    }
  }
})

// Reload editor content by hash value
window.onhashchange = () => {
  const content = getContentFromHash(window.location.hash)
  if (content) editor.value(content)
}

// FIXME DEBUGONLY
// generateMaps(HtmlContainer)
// setTimeout(() => {
//   HtmlContainer.setAttribute("data-layout", 'side')
// }, 500)

// }}}
// Completion in Code Blok {{{
// Elements about suggestions {{{
const menu = document.createElement('div')
menu.className = 'menu editor-menu'
menu.style.display = 'none'
menu.onclick = () => (menu.style.display = 'none')
new window.MutationObserver(() => {
  if (menu.style.display === 'none') {
    menu.replaceChildren()
  }
}).observe(menu, {
  attributes: true,
  attributeFilter: ['style']
})
document.body.append(menu)

const rendererOptions = {}

// }}}
// Aliases for map options {{{
const aliasesForMapOptions = {}
const defaultApply = './dist/default.yml'
fetch(defaultApply)
  .then(res => res.text())
  .then(rawText => {
    const config = parseConfigsFromYaml(rawText)?.at(0)
    Object.assign(aliasesForMapOptions, config.aliases ?? {})
  })
  .catch(err => console.warn(`Fail to get aliases from ${defaultApply}`, err))
// }}}
/**
 * insideCodeblockForMap. Check if current token is inside code block {{{
 *
 * @param {} anchor
 */
const insideCodeblockForMap = anchor => {
  const token = cm.getTokenAt(anchor)
  const insideCodeBlock =
    token.state.overlay.codeBlock &&
    !cm.getLine(anchor.line).match(/^[\u0060]{3}/)
  if (!insideCodeBlock) return false

  let line = anchor.line - 1
  while (line >= 0) {
    const content = cm.getLine(line)
    if (content === '```map') {
      return true
    } else if (content === '```') {
      return false
    }
    line = line - 1
  }
  return false
}
// }}}
/**
 * getLineWithRenderer. Get Renderer by cursor position in code block {{{
 *
 * @param {Object} anchor -- Codemirror Anchor Object
 */
const getLineWithRenderer = anchor => {
  const currentLine = anchor.line
  if (!cm.getLine) return null

  const match = line => cm.getLine(line).match(/^use: /)

  if (match(currentLine)) return currentLine

  // Look backward/forward for pattern of used renderer: /use: .+/
  let pl = currentLine - 1
  while (pl > 0 && insideCodeblockForMap(anchor)) {
    const text = cm.getLine(pl)
    if (match(pl)) {
      return pl
    } else if (text.match(/^---|^[\u0060]{3}/)) {
      break
    }
    pl = pl - 1
  }

  let nl = currentLine + 1
  while (insideCodeblockForMap(anchor)) {
    const text = cm.getLine(nl)
    if (match(nl)) {
      return nl
    } else if (text.match(/^---|^[\u0060]{3}/)) {
      return null
    }
    nl = nl + 1
  }

  return null
}
// }}}
/**
 * getSuggestionsForOptions. Return suggestions for valid options {{{
 *
 * @param {Boolean} optionTyped
 * @param {Object[]} validOptions
 */
const getSuggestionsForOptions = (optionTyped, validOptions) => {
  let suggestOptions = []

  const matchedOptions = validOptions.filter(o =>
    o.valueOf().toLowerCase().includes(optionTyped.toLowerCase())
  )

  if (matchedOptions.length > 0) {
    suggestOptions = matchedOptions
  } else {
    suggestOptions = validOptions
  }

  return suggestOptions.map(
    o =>
      new menuItem.Suggestion({
        text: `<span>${o.valueOf()}</span><span class='info' title="${o.desc ?? ''}">ⓘ</span>`,
        replace: `${o.valueOf()}: `,
        cm
      })
  )
}
// }}}
/**
 * getSuggestionFromMapOption. Return suggestion for example of option value {{{
 *
 * @param {Object} option
 */
const getSuggestionFromMapOption = option => {
  if (!option.example) return null

  const text = option.example_desc
    ? `<span>${option.example_desc}</span><span class="truncate"style="color: gray">${option.example}</span>`
    : `<span>${option.example}</span>`

  return new menuItem.Suggestion({
    text,
    replace: `${option.valueOf()}: ${option.example ?? ''}`,
    cm
  })
}
// }}}
/**
 * getSuggestionsFromAliases. Return suggestions from aliases {{{
 *
 * @param {Object} option
 */
const getSuggestionsFromAliases = option =>
  Object.entries(aliasesForMapOptions[option.valueOf()] ?? {})?.map(record => {
    const [alias, value] = record
    const valueString = JSON.stringify(value).replaceAll('"', '')
    return new menuItem.Suggestion({
      text: `<span>${alias}</span><span class="truncate" style="color: gray">${valueString}</span>`,
      replace: `${option.valueOf()}: ${valueString}`,
      cm
    })
  }) ?? []
// }}}
/**
 * handleTypingInCodeBlock. Handler for map codeblock {{{
 *
 * @param {Object} anchor -- Codemirror Anchor Object
 */
const handleTypingInCodeBlock = anchor => {
  const text = cm.getLine(anchor.line)
  if (text.match(/^\s\+$/) && text.length % 2 !== 0) {
    // TODO Completion for even number of spaces
  } else if (text.match(/^-/)) {
    // TODO Completion for YAML doc separator
  } else {
    const suggestions = getSuggestions(anchor)
    addSuggestions(anchor, suggestions)
  }
}
// }}}
/**
 * getSuggestions. Get suggestions by current input {{{
 *
 * @param {Object} anchor -- Codemirror Anchor Object
 */
const getSuggestions = anchor => {
  const text = cm.getLine(anchor.line)

  // Clear marks on text
  cm.findMarks({ ...anchor, ch: 0 }, { ...anchor, ch: text.length }).forEach(
    m => m.clear()
  )

  // Mark user input invalid by case
  const markInputIsInvalid = () =>
    cm
      .getDoc()
      .markText(
        { ...anchor, ch: 0 },
        { ...anchor, ch: text.length },
        { className: 'invalid-input' }
      )

  // Check if "use: <renderer>" is set
  const lineWithRenderer = getLineWithRenderer(anchor)
  const renderer = lineWithRenderer
    ? cm.getLine(lineWithRenderer).split(' ')[1]
    : null
  if (renderer && anchor.line !== lineWithRenderer) {
    // Do not check properties
    if (text.startsWith('  ')) return []

    // If no valid options for current used renderer, go get it!
    const validOptions = rendererOptions[renderer]
    if (!validOptions) {
      // Get list of valid options for current renderer
      const rendererUrl = defaultAliases.use[renderer]?.value
      import(rendererUrl)
        .then(rendererModule => {
          rendererOptions[renderer] = rendererModule.default.validOptions
          const currentAnchor = cm.getCursor()
          if (insideCodeblockForMap(currentAnchor)) {
            handleTypingInCodeBlock(currentAnchor)
          }
        })
        .catch(_ => {
          markInputIsInvalid(lineWithRenderer)
          console.warn(
            `Fail to get valid options from Renderer typed: ${renderer}`
          )
        })
      return []
    }

    // If input is "key:value" (no space left after colon), then it is invalid
    const isKeyFinished = text.includes(':')
    const isValidKeyValue = text.match(/^[^:]+:\s+/)
    if (isKeyFinished && !isValidKeyValue) {
      markInputIsInvalid()
      return []
    }

    // If user is typing option
    const keyTyped = text.split(':')[0].trim()
    if (!isKeyFinished) {
      markInputIsInvalid()
      return getSuggestionsForOptions(keyTyped, validOptions)
    }

    // If user is typing value
    const matchedOption = validOptions.find(o => o.name === keyTyped)
    if (isKeyFinished && !matchedOption) {
      markInputIsInvalid()
    }

    if (isKeyFinished && matchedOption) {
      const valueTyped = text.substring(text.indexOf(':') + 1).trim()
      const isValidValue = matchedOption.isValid(valueTyped)
      if (!valueTyped) {
        return [
          getSuggestionFromMapOption(matchedOption),
          ...getSuggestionsFromAliases(matchedOption)
        ].filter(s => s instanceof menuItem.Suggestion)
      }
      if (valueTyped && !isValidValue) {
        markInputIsInvalid()
        return []
      }
    }
  } else {
    // Suggestion for "use"
    const rendererSuggestions = Object.entries(defaultAliases.use)
      .filter(([renderer]) => {
        const suggestion = `use: ${renderer}`
        const suggestionPattern = suggestion.replace(' ', '').toLowerCase()
        const textPattern = text.replace(' ', '').toLowerCase()
        return suggestion !== text && suggestionPattern.includes(textPattern)
      })
      .map(
        ([renderer, info]) =>
          new menuItem.Suggestion({
            text: `<span>use: ${renderer}</span><span class='info' title="${info.desc}">ⓘ</span>`,
            replace: `use: ${renderer}`,
            cm
          })
      )
    return [
      ...(rendererSuggestions ?? []),
      new menuItem.Item({
        innerHTML: '<a href="https://github.com/outdoorsafetylab/mapclay#renderer" class="external" style="display: block;">More...</a>',
        className: ['suggestion'],
        onclick: () => window.open('https://github.com/outdoorsafetylab/mapclay#renderer', '_blank')
      })
    ]
  }
  return []
}
// }}}
/**
 * addSuggestions.  Show element about suggestions {{{
 *
 * @param {Object} anchor -- Codemirror Anchor Object
 * @param {Suggestion[]} suggestions
 */
const addSuggestions = (anchor, suggestions) => {
  if (suggestions.length === 0) {
    menu.style.display = 'none'
    return
  } else {
    menu.style.display = 'block'
  }

  menu.innerHTML = ''
  suggestions
    .forEach(option => menu.appendChild(option))

  const widgetAnchor = document.createElement('div')
  cm.addWidget(anchor, widgetAnchor, true)
  const rect = widgetAnchor.getBoundingClientRect()
  menu.style.left = `calc(${rect.left}px + 2rem)`
  menu.style.top = `calc(${rect.bottom}px + 1rem)`
  menu.style.display = 'block'
  shiftByWindow(menu)
}
// }}}
// EVENT: Suggests for current selection {{{
// FIXME Dont show suggestion when selecting multiple chars
cm.on('cursorActivity', _ => {
  menu.style.display = 'none'
  const anchor = cm.getCursor()

  if (insideCodeblockForMap(anchor)) {
    handleTypingInCodeBlock(anchor)
  }
})
cm.on('blur', () => {
  if (menu.checkVisibility()) {
    cm.focus()
  } else {
    cm.getWrapperElement().classList.remove('focus')
    dumbyContainer.classList.add('focus')
  }
})
// }}}
// EVENT: keydown for suggestions {{{
const keyForSuggestions = ['Tab', 'Enter', 'Escape']
cm.on('keydown', (_, e) => {
  if (
    !cm.hasFocus ||
    !keyForSuggestions.includes(e.key) ||
    menu.style.display === 'none'
  ) { return }

  // Directly add a newline when no suggestion is selected
  const currentSuggestion = menu.querySelector('.menu-item.focus')
  if (!currentSuggestion && e.key === 'Enter') return

  // Override default behavior
  e.preventDefault()

  // Suggestion when pressing Tab or Shift + Tab
  const nextSuggestion =
    currentSuggestion?.nextSibling ??
    menu.querySelector('.menu-item:first-child')
  const previousSuggestion =
    currentSuggestion?.previousSibling ??
    menu.querySelector('.menu-item:last-child')
  const focusSuggestion = e.shiftKey ? previousSuggestion : nextSuggestion

  // Current editor selection state
  switch (e.key) {
    case 'Tab':
      Array.from(menu.children).forEach(s => s.classList.remove('focus'))
      focusSuggestion.classList.add('focus')
      focusSuggestion.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      break
    case 'Enter':
      currentSuggestion.onclick()
      break
    case 'Escape':
      if (!menu.checkVisibility()) break
      // HACK delay menu display change for blur event, mark cm focus should keep
      setTimeout(() => (menu.style.display = 'none'), 50)
      break
  }
})

document.onkeydown = e => {
  if (e.altKey && e.ctrlKey && e.key === 'm') {
    toggleEditing()
    e.preventDefault()
    return null
  }

  if (!cm.hasFocus()) {
    if (e.key === 'F1') {
      e.preventDefault()
      cm.focus()
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      dumbymap.utils.focusNextMap(e.shiftKey)
    }
    if (e.key === 'x' || e.key === 'X') {
      e.preventDefault()
      dumbymap.utils.switchToNextLayout(e.shiftKey)
    }
    if (e.key === 'n') {
      e.preventDefault()
      dumbymap.utils.focusNextBlock()
    }
    if (e.key === 'p') {
      e.preventDefault()
      dumbymap.utils.focusNextBlock(true)
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      dumbymap.utils.removeBlockFocus()
    }
  }
}

// }}}
// }}}
// Layout Switch {{{
new window.MutationObserver(mutaions => {
  const mutation = mutaions.at(-1)
  const layout = dumbyContainer.getAttribute('data-layout')
  if (layout !== 'normal' || mutation.oldValue === 'normal') {
    context.setAttribute('data-mode', '')
  }
}).observe(dumbyContainer, {
  attributes: true,
  attributeFilter: ['data-layout'],
  attributeOldValue: true
})
// }}}

const addMapRandomlyByPreset = () => {
  if (Object.keys(aliasesForMapOptions).length === 0) return
  cm.replaceRange('\n```map\n```\n', cm.getCursor()); // adds a new line


}

// vim: sw=2 ts=2 foldmethod=marker foldmarker={{{,}}}
