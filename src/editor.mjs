/* global EasyMDE */
import { markdown2HTML, generateMaps } from './dumbymap'
import { defaultAliases, parseConfigsFromYaml } from 'mapclay'
import * as menuItem from './MenuItem'
import { addMarkerByPoint } from './dumbyUtils.mjs'
import { shiftByWindow } from './utils.mjs'
import * as tutorial from './tutorial'

/**
 * @typedef {Object} RefLink
 * @property {string} ref - name of link
 * @property {string} link - content of link
 * @property {string|null} title - title of link
 */

// Set up Containers {{{

/** Variables: page */
const url = new URL(window.location)
const pageParams = url.searchParams
const crs = pageParams.get('crs') ?? 'EPSG:4326'
const initialLayout = pageParams.get('layout')

/** Variables: dumbymap and editor **/
const context = document.querySelector('[data-mode]')
const textArea = document.querySelector('.editor textarea')
const dumbyContainer = document.querySelector('.Dumby')
dumbyContainer.dataset.scrollLine = ''
/** Watch: DumbyMap */
new window.MutationObserver(mutations => {
  const mutation = mutations.at(-1)

  /** Handle layout change */
  const layout = dumbyContainer.dataset.layout
  if (layout !== 'normal' || mutation.oldValue === 'normal') {
    context.dataset.mode = ''
  }
}).observe(dumbyContainer, {
  attributes: true,
  attributeFilter: ['data-layout'],
  attributeOldValue: true,
  childList: true,
  subtree: true,
})
let dumbymap

/** Variables: Reference Style Links in Markdown */
const refLinkPattern = /\[([^\x5B\x5D]+)\]:\s+(\S+)(\s["'](\S+)["'])?/
let refLinks = []

/**
 * Validates if the given anchor name is unique
 *
 * @param {string} anchorName - The anchor name to validate
 * @returns {boolean} True if the anchor name is unique, false otherwise
 */
const validateAnchorName = anchorName =>
  !refLinks.find(obj => obj.ref.toLowerCase() === anchorName.toLowerCase())

/**
 * Appends a reference link to the CodeMirror instance
 *
 * @param {CodeMirror} cm - The CodeMirror instance
 * @param {RefLink} refLink - The reference link to append
 */
const appendRefLink = (cm, refLink) => {
  editor.dataset.update = 'false'

  const { ref, link, title } = refLink
  let refLinkString = `\n[${ref}]: ${link} "${title ?? ''}"`
  const lastLineIsRefLink = cm.getLine(cm.lastLine()).match(refLinkPattern)
  if (!lastLineIsRefLink) refLinkString = '\n' + refLinkString
  cm.replaceRange(refLinkString, { line: Infinity })

  refLinks.push(refLink)
}
/**
 * Watch for changes of editing mode
 *
 * For 'data-mode' attribute of the context element, if the mode is 'editing'
 * and the layout is not 'normal', it sets the layout to 'normal' and switch to editing mode
 */
new window.MutationObserver(() => {
  const mode = context.dataset.mode
  const layout = dumbyContainer.dataset.layout
  if (mode === 'editing' && layout !== 'normal') {
    dumbyContainer.dataset.layout = 'normal'
  }
}).observe(context, {
  attributes: true,
  attributeFilter: ['data-mode'],
  attributeOldValue: true,
})
/**
 * Toggles the editing mode
 */
const toggleEditing = () => {
  const mode = context.dataset.mode
  if (mode === 'editing') {
    context.dataset.mode = ''
  } else {
    context.dataset.mode = 'editing'
  }
}
// }}}
// Set up EasyMDE {{{
/** Editor from EasyMDE **/
const editor = new EasyMDE({
  element: textArea,
  initialValue: tutorial.md,
  autosave: {
    enabled: true,
    uniqueId: 'dumbymap',
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
    toggleOrderedList: null,
  },
  toolbar: [
    {
      name: 'roll',
      title: 'Roll a Dice',
      text: '\u{2684}',
      action: () => addMapRandomlyByPreset(),
    },
    {
      name: 'export',
      title: 'Export current page',
      text: '\u{1F4BE}',
      action: () => {
      },
    },
    {
      name: 'hash',
      title: 'Save content as URL',
      // text: '\u{1F4BE}',
      text: '#',
      action: () => {
        const state = { content: editor.value() }
        window.location.hash = encodeURIComponent(JSON.stringify(state))
        window.location.search = ''
        navigator.clipboard.writeText(window.location.href)
        window.alert('URL updated in address bar, you can save current page as bookmark')
      },
    },
    '|',
    {
      name: 'undo',
      title: 'Undo last editing',
      text: '\u27F2',
      action: EasyMDE.undo,
    },
    {
      name: 'redo',
      text: '\u27F3',
      title: 'Redo editing',
      action: EasyMDE.redo,
    },
    '|',
    {
      name: 'heading-1',
      text: 'H1',
      title: 'Big Heading',
      action: EasyMDE['heading-1'],
    },
    {
      name: 'heading-2',
      text: 'H2',
      title: 'Medium Heading',
      action: EasyMDE['heading-2'],
    },
    '|',
    {
      name: 'link',
      text: '\u{1F517}',
      title: 'Create Link',
      action: EasyMDE.drawLink,
    },
    {
      name: 'image',
      text: '\u{1F5BC}',
      title: 'Create Image',
      action: EasyMDE.drawImage,
    },
    '|',
    {
      name: 'Bold',
      text: '\u{1D401}',
      title: 'Bold',
      action: EasyMDE.toggleBold,
    },
    {
      name: 'Italic',
      text: '\u{1D43C}',
      title: 'Italic',
      action: EasyMDE.toggleItalic,
    },
    '|',
    {
      name: 'tutorial',
      text: '\u{2753}',
      title: 'Reset contents by tutorial',
      action: () => {
        editor.value(tutorial.md)
        refLinks = getRefLinks()
        cm.focus()
        cm.setCursor({ line: 0, ch: 0 })
      },
    },
  ],
})
/** CodeMirror Instance **/
const cm = editor.codemirror

/**
 * getRefLinks from contents of editor
 * @return {RefLink[]} refLinks
 */
const getRefLinks = () => editor.value()
  .split('\n')
  .map(line => {
    const [, ref, link,, title] = line.match(refLinkPattern) ?? []
    return { ref, link, title }
  })
  .filter(({ ref, link }) => ref && link)

refLinks = getRefLinks()

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
 * @param {String} hash
 */
const getContentFromHash = hash => {
  const state = getStateFromHash(hash)
  return state.content
}
/** Hash and Query Parameters in URL **/
const contentFromHash = getContentFromHash(window.location.hash)
window.location.hash = ''

if (url.searchParams.get('content') === 'tutorial') {
  editor.value(tutorial.md)
} else if (contentFromHash) {
  // Seems like autosave would overwrite initialValue, set content from hash here
  editor.cleanup()
  editor.value(contentFromHash)
}
// }}}
// Set up logic about editor content {{{

/**
 * updateScrollLine. Update data attribute by scroll on given element
 *
 * @param {HTMLElement} ele
 */
const updateScrollLine = (ele) => () => {
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

  if (linenumber) {
    ele.closest('[data-scroll-line]').dataset.scrollLine = linenumber + '/' + offset
  }
}

/** sync scroll from HTML to CodeMirror */
new window.MutationObserver(() => {
  clearTimeout(dumbyContainer.timer)
  dumbyContainer.timer = setTimeout(
    () => { dumbyContainer.dataset.scrollLine = '' },
    50,
  )

  const line = dumbyContainer.dataset.scrollLine
  if (line) {
    const [lineNumber, offset] = line.split('/')

    if (!lineNumber || isNaN(lineNumber)) return

    cm.scrollIntoView({ line: lineNumber, ch: 0 }, offset)
  }
}).observe(dumbyContainer, {
  attributes: true,
  attributeFilter: ['data-scroll-line'],
})

/**
 * updateScrollLineByCodeMirror.
 * @param {CodeMirror} cm
 */
const updateCMScrollLine = (cm) => {
  if (dumbyContainer.dataset.scrollLine) return

  const lineNumber = cm.getCursor()?.line ??
    cm.lineAtHeight(cm.getScrollInfo().top, 'local')
  textArea.dataset.scrollLine = lineNumber
}
cm.on('scroll', () => {
  if (cm.hasFocus()) updateCMScrollLine(cm)
})

/** Sync scroll from CodeMirror to HTML **/
new window.MutationObserver(() => {
  clearTimeout(textArea.timer)
  textArea.timer = setTimeout(
    () => { textArea.dataset.scrollLine = '' },
    1000,
  )

  const line = textArea.dataset.scrollLine
  let lineNumber = Number(line)
  let p
  if (!line || isNaN(lineNumber)) return

  const paragraphs = Array.from(dumbymap.htmlHolder.querySelectorAll('p'))
  do {
    p = paragraphs.find(p => Number(p.dataset.sourceLine) === lineNumber)
    lineNumber++
  } while (!p && lineNumber < cm.doc.size)
  p = p ?? paragraphs.at(-1)
  if (!p) return

  const coords = cm.charCoords({ line: lineNumber, ch: 0 })
  p.scrollIntoView({ inline: 'start' })
  const top = p.getBoundingClientRect().top
  dumbymap.htmlHolder.scrollBy(0, top - coords.top + 30)
}).observe(textArea, {
  attributes: true,
  attributeFilter: ['data-scroll-line'],
})

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
 * @param {Object} change - codemirror change object
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
 * menuForEditor.
 *
 * @param {Event} event - Event for context menu
 * @param {HTMLElement} menu - menu of dumbymap
 */
const menuForEditor = (event, menu) => {
  event.preventDefault()

  if (document.getSelection().type === 'Range' && cm.getSelection() && refLinks.length > 0) {
    menu.replaceChildren()
    menu.appendChild(menuItem.addRefLink(cm, refLinks))
  }

  if (context.dataset.mode !== 'editing') {
    const switchToEditingMode = new menuItem.Item({
      innerHTML: '<strong>EDIT</strong>',
      onclick: () => (context.dataset.mode = 'editing'),
    })
    menu.appendChild(switchToEditingMode)
  }

  const map = event.target.closest('.mapclay')
  if (map) {
    const item = new menuItem.Item({
      text: 'Add Anchor',
      onclick: () => {
        let anchorName
        do {
          anchorName = window.prompt(anchorName ? 'Name exists' : 'Name of Anchor')
        } while (refLinks.find(ref => ref === anchorName))
        if (anchorName === null) return

        const marker = addMarkerByPoint({ point: [event.clientX, event.clientY], map })
        const refLink = {
          ref: anchorName,
          link: `geo:${marker.dataset.xy.split(',').reverse()}`,
        }
        appendRefLink(cm, refLink)
      },
    })
    menu.insertBefore(item, menu.firstChild)
  }
}

/**
 * update content of HTML about Dumbymap
 */
const updateDumbyMap = (callback = null) => {
  markdown2HTML(dumbyContainer, editor.value())
  // debounceForMap(dumbyContainer, afterMapRendered)
  dumbymap = generateMaps(dumbyContainer, {
    crs,
  })
  // Set onscroll callback
  const htmlHolder = dumbymap.htmlHolder
  htmlHolder.onscroll = updateScrollLine(htmlHolder)
  // Set oncontextmenu callback
  dumbymap.utils.setContextMenu(menuForEditor)

  callback?.(dumbymap)
}
updateDumbyMap(() => {
  if (initialLayout) {
    dumbyContainer.dataset.layout = initialLayout
  }
})

// Re-render HTML by editor content
cm.on('change', (_, change) => {
  if (editor.dataset?.update !== 'false') {
    textArea.dataset.scrollLine = cm.getCursor().line
    updateDumbyMap(() => {
      updateCMScrollLine(cm)
    })
  } else {
    delete editor.dataset.update
  }
  addClassToCodeLines()
  completeForCodeBlock(change)
})

// Set class for focus
cm.on('focus', () => {
  cm.getWrapperElement().classList.add('focus')
  dumbyContainer.classList.remove('focus')
})

cm.on('beforeChange', (_, change) => {
  // Don't allow more content after YAML doc separator
  if (change.origin && change.origin.match(/^(\+input|paste)$/)) {
    const line = change.to.line
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
  attributeFilter: ['style'],
})
document.body.append(menu)

const rendererOptions = {}

// }}}
// Aliases for map options {{{
const aliasesForMapOptions = {}
const defaultApply = './assets/default.yml'
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
 * @param {Anchor} anchor
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
 * @param {Object} anchor - Codemirror Anchor Object
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
    o.valueOf().toLowerCase().includes(optionTyped.toLowerCase()),
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
        cm,
      }),
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
    cm,
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
      cm,
    })
  }) ?? []
// }}}
/**
 * handleTypingInCodeBlock. Handler for map codeblock {{{
 *
 * @param {Object} anchor - Codemirror Anchor Object
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
 * @param {Object} anchor - Codemirror Anchor Object
 */
const getSuggestions = anchor => {
  const text = cm.getLine(anchor.line)

  // Clear marks on text
  cm.findMarks({ ...anchor, ch: 0 }, { ...anchor, ch: text.length }).forEach(
    m => m.clear(),
  )

  // Mark user input invalid by case
  const markInputIsInvalid = () =>
    cm
      .getDoc()
      .markText(
        { ...anchor, ch: 0 },
        { ...anchor, ch: text.length },
        { className: 'invalid-input' },
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
            `Fail to get valid options from Renderer typed: ${renderer}`,
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
          ...getSuggestionsFromAliases(matchedOption),
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
            cm,
          }),
      )
    return rendererSuggestions.length === 0
      ? []
      : [
          ...rendererSuggestions,
          new menuItem.Item({
            innerHTML: '<a href="https://github.com/outdoorsafetylab/mapclay#renderer" class="external" style="display: block;">More...</a>',
            className: ['suggestion'],
            onclick: () => window.open('https://github.com/outdoorsafetylab/mapclay#renderer', '_blank'),
          }),
        ]
  }
  return []
}
// }}}
/**
 * addSuggestions.  Show element about suggestions {{{
 *
 * @param {Object} anchor - Codemirror Anchor Object
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
  refLinks = getRefLinks()

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
/**
 * addMapRandomlyByPreset. insert random text of valid mapclay yaml into editor
 */
const addMapRandomlyByPreset = () => {
  const yamlText = [
    'apply: ./assets/default.yml',
    'width: 85%',
    'height: 200px',
  ]
  const order = [
    'id',
    'apply',
    'use',
    'width',
    'height',
    'center',
    'XYZ',
    'zoom',
  ]
  const aliasesEntries = Object.entries(aliasesForMapOptions)
    .filter(([key, _]) =>
      order.includes(key) &&
      !yamlText.find(text => text.startsWith(key)),
    )
  if (aliasesEntries.length === 0) return

  aliasesEntries.forEach(([option, aliases]) => {
    const entries = Object.entries(aliases)
    const validEntries = entries
      .filter(([alias, value]) => {
        // FIXME logic about picking XYZ data
        if (option === 'XYZ') {
          const inTaiwan = yamlText.find(text => text.match(/center: TAIWAN/))
          if (!inTaiwan) return !alias.includes('TAIWAN')
        }
        if (option === 'zoom') {
          return value > 6 && value < 15
        }
        return true
      })
    const randomValue = validEntries
      .at((Math.random() * validEntries.length) | 0)
      .at(0)

    yamlText.push(`${option}: ${typeof randomValue === 'object' ? randomValue.value : randomValue}`)

    if (option === 'center') yamlText.push(`id: ${randomValue}`)
  })

  yamlText.sort((a, b) =>
    order.indexOf(a.split(':')[0]) > order.indexOf(b.split(':')[0]),
  )
  const anchor = cm.getCursor()
  cm.replaceRange(
    '\n```map\n' + yamlText.join('\n') + '\n```\n',
    anchor,
  )
}

cm.getWrapperElement().oncontextmenu = e => {
  if (insideCodeblockForMap(cm.getCursor())) return
  e.preventDefault()

  if (cm.getSelection() && refLinks.length > 0) {
    menu.appendChild(menuItem.addRefLink(cm, refLinks))
  }

  if (menu.children.length > 0) {
    menu.style.cssText = `display: block; transform: translate(${e.x}px, ${e.y}px); overflow: visible;`
  }
}

/** HACK Sync selection from HTML to CodeMirror */
document.addEventListener('selectionchange', () => {
  if (cm.hasFocus() || dumbyContainer.onmousemove) {
    return
  }

  const selection = document.getSelection()
  if (selection.type === 'Range') {
    const content = selection.getRangeAt(0).toString()
    const parentWithSourceLine = selection.anchorNode.parentElement.closest('.source-line')
    const lineStart = Number(parentWithSourceLine?.dataset?.sourceLine ?? NaN)
    const nextSourceLine = parentWithSourceLine?.nextSibling?.dataset?.sourceLine
    const lineEnd = Number(nextSourceLine) ?? cm.doc.size
    // TODO Also return when range contains anchor element
    if (content.includes('\n') || isNaN(lineStart)) {
      cm.setSelection(cm.getCursor())
      return
    }

    const texts = [content]
    let sibling = selection.anchorNode.previousSibling
    while (sibling) {
      texts.push(sibling.textContent)
      sibling = sibling.previousSibling
    }

    const anchor = { line: lineStart, ch: 0 }

    texts
      .filter(t => t && t !== '\n')
      .map(t => t.replace('\n', ''))
      .reverse()
      .forEach(text => {
        let index = cm.getLine(anchor.line)?.indexOf(text, anchor.ch)
        while (index === -1) {
          anchor.line += 1
          anchor.ch = 0
          if (anchor.line >= lineEnd) return

          index = cm.getLine(anchor.line).indexOf(text)
        }
        anchor.ch = index + text.length
      })

    const focus = { line: anchor.line, ch: anchor.ch - content.length }
    cm.setSelection(focus, anchor)
    cm.scrollIntoView(focus)
  }
})
