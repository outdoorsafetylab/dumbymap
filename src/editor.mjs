/*global EasyMDE*/
/*eslint no-undef: "error"*/
import { markdown2HTML, generateMaps } from './dumbymap'
import { defaultAliases, parseConfigsFromYaml } from 'mapclay'
import { createDocLinks } from './dumbymap.mjs'

// Set up Containers {{{

const HtmlContainer = document.querySelector(".DumbyMap")
const textArea = document.querySelector(".editor textarea")
let dumbymap

const toggleEditing = () => {
  if (document.body.getAttribute("data-mode") === "editing") {
    document.body.removeAttribute("data-mode")
  } else {
    document.body.setAttribute("data-mode", "editing")
  }
  HtmlContainer.setAttribute("data-layout", "normal")
}
// }}}
// Set up EasyMDE {{{

// Content values for editor

const defaultContent = '## Links\n\n- [Go to marker](geo:24,121?id=foo,leaflet&text=normal "Link Test")\n\n```map\nid: foo\nuse: Maplibre\n```\n'
const editor = new EasyMDE({
  element: textArea,
  initialValue: defaultContent,
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
    "map": "Ctrl-Alt-M",
    "debug": "Ctrl-Alt-D",
    "toggleUnorderedList": null,
    "toggleOrderedList": null,
  },
  toolbar: [
    {
      name: 'map',
      title: 'Toggle Map Generation',
      text: "🌏",
      action: () => toggleEditing(),
    },
    {
      name: 'debug',
      title: 'Save content as URL',
      text: "🤔",
      action: () => {
        const state = { content: editor.value() }
        window.location.hash = encodeURIComponent(JSON.stringify(state))
        navigator.clipboard.writeText(window.location.href)
        alert('URL copied to clipboard')
      },
    }, 'undo', 'redo', '|', 'heading-1', 'heading-2', '|', 'link', 'image', '|', 'bold', 'italic', 'strikethrough', 'code', 'clean-block', '|', 'unordered-list', 'ordered-list', 'quote', 'table'
  ],
});

const cm = editor.codemirror

const getStateFromHash = (hash) => {
  const hashValue = hash.substring(1);
  const stateString = decodeURIComponent(hashValue)
  try { return JSON.parse(stateString) ?? {} }
  catch (_) { return {} }
}

const getContentFromHash = (hash) => {
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
markdown2HTML(HtmlContainer, editor.value())
createDocLinks(HtmlContainer)

// Quick hack to style lines inside code block
const addClassToCodeLines = () => {
  const lines = cm.getLineHandle(0).parent.lines
  let insideCodeBlock = false
  lines.forEach((line, index) => {
    if (line.text.match(/^[\u0060]{3}/)) {
      insideCodeBlock = !insideCodeBlock
    } else if (insideCodeBlock) {
      cm.addLineClass(index, "text", "inside-code-block")
    } else {
      cm.removeLineClass(index, "text", "inside-code-block")
    }
  })
}
addClassToCodeLines()

const completeForCodeBlock = (change) => {
  const line = change.to.line
  if (change.origin === "+input") {
    const text = change.text[0]

    // Completion for YAML doc separator
    if (text === "-" && change.to.ch === 0 && insideCodeblockForMap(cm.getCursor())) {
      cm.setSelection({ line: line, ch: 0 }, { line: line, ch: 1 })
      cm.replaceSelection(text.repeat(3) + '\n')
    }

    // Completion for Code fence
    if (text === "`" && change.to.ch === 0) {
      cm.setSelection({ line: line, ch: 0 }, { line: line, ch: 1 })
      cm.replaceSelection(text.repeat(3))
      const numberOfFences = cm.getValue()
        .split('\n')
        .filter(line => line.match(/[\u0060]{3}/))
        .length
      if (numberOfFences % 2 === 1) {
        cm.replaceSelection('map\n\n```')
        cm.setCursor({ line: line + 1 })
      }
    }
  }

  // For YAML doc separator, <hr> and code fence
  // Auto delete to start of line
  if (change.origin === "+delete") {
    const match = change.removed[0].match(/^[-\u0060]$/)?.at(0)
    if (match && cm.getLine(line) === match.repeat(2) && match) {
      cm.setSelection({ line: line, ch: 0 }, { line: line, ch: 2 })
      cm.replaceSelection('')
    }
  }
}

const debounceForMap = (() => {
  let timer = null;

  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      dumbymap = generateMaps.apply(this, args)
    }, 1000);
  }
})()

const afterMapRendered = (_) => {
  // mapHolder.oncontextmenu = (event) => {
  //   event.preventDefault()
  //   const lonLat = mapHolder.renderer.unproject([event.x, event.y])
  //   // TODO...
  // }
}

const updateDumbyMap = () => {
  markdown2HTML(HtmlContainer, editor.value())
  createDocLinks(HtmlContainer)
  // TODO Test if generate maps intantly is OK with map cache
  // debounceForMap(HtmlContainer, afterMapRendered)
  dumbymap = generateMaps(HtmlContainer, afterMapRendered)
}

updateDumbyMap()

// Re-render HTML by editor content
cm.on("change", (_, change) => {
  updateDumbyMap()
  addClassToCodeLines()
  completeForCodeBlock(change)
})

cm.on("beforeChange", (_, change) => {
  const line = change.to.line
  // Don't allow more content after YAML doc separator
  if (change.origin.match(/^(\+input|paste)$/)) {
    if (cm.getLine(line) === "---" && change.text[0] !== "") {
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
const suggestionsEle = document.createElement('div')
suggestionsEle.classList.add('container__suggestions');
document.body.append(suggestionsEle)

const rendererOptions = {}

class Suggestion {
  constructor({ text, replace }) {
    this.text = text
    this.replace = replace
  }
}
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
//  FUNCTION: Check if current token is inside code block {{{
const insideCodeblockForMap = (anchor) => {
  const token = cm.getTokenAt(anchor)
  const insideCodeBlock = token.state.overlay.codeBlock && !cm.getLine(anchor.line).match(/^[\u0060]{3}/)
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
// FUNCTION: Get Renderer by cursor position in code block {{{
const getLineWithRenderer = (anchor) => {
  const currentLine = anchor.line
  if (!cm.getLine) return null

  const match = (line) => cm.getLine(line).match(/^use: /)

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
// FUNCTION: Return suggestions for valid options {{{
const getSuggestionsForOptions = (optionTyped, validOptions) => {
  let suggestOptions = []

  const matchedOptions = validOptions
    .filter(o => o.valueOf().toLowerCase().includes(optionTyped.toLowerCase()))

  if (matchedOptions.length > 0) {
    suggestOptions = matchedOptions
  } else {
    suggestOptions = validOptions
  }

  return suggestOptions
    .map(o => new Suggestion({
      text: `<span>${o.valueOf()}</span><span class='info' title="${o.desc ?? ''}">ⓘ</span>`,
      replace: `${o.valueOf()}: `,
    }))
}
// }}}
// FUNCTION: Return suggestion for example of option value {{{
const getSuggestionFromMapOption = (option) => {
  if (!option.example) return null

  const text = option.example_desc
    ? `<span>${option.example_desc}</span><span class="truncate"style="color: gray">${option.example}</span>`
    : `<span>${option.example}</span>`

  return new Suggestion({
    text: text,
    replace: `${option.valueOf()}: ${option.example ?? ""}`,
  })
}
// }}}
// FUNCTION: Return suggestions from aliases {{{
const getSuggestionsFromAliases = (option) => Object.entries(aliasesForMapOptions[option.valueOf()] ?? {})
  ?.map(record => {
    const [alias, value] = record
    const valueString = JSON.stringify(value).replaceAll('"', '')
    return new Suggestion({
      text: `<span>${alias}</span><span class="truncate" style="color: gray">${valueString}</span>`,
      replace: `${option.valueOf()}: ${valueString}`,
    })
  })
  ?? []
// }}}
// FUCNTION: Handler for map codeblock {{{
const handleTypingInCodeBlock = (anchor) => {
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
// FUNCTION: get suggestions by current input {{{
const getSuggestions = (anchor) => {
  const text = cm.getLine(anchor.line)

  // Clear marks on text
  cm.findMarks(
    { ...anchor, ch: 0 },
    { ...anchor, ch: text.length }
  ).forEach(m => m.clear())

  // Mark user input invalid by case
  const markInputIsInvalid = () =>
    cm.getDoc().markText(
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
          console.warn(`Fail to get valid options from Renderer typed: ${renderer}`)
        })
      return []
    }

    // If input is "key:value" (no space left after colon), then it is invalid
    const isKeyFinished = text.includes(':');
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
        ].filter(s => s instanceof Suggestion)
      }
      if (valueTyped && !isValidValue) {
        markInputIsInvalid()
        return []
      }
    }

  } else {
    // Suggestion for "use"
    const rendererSuggestions = Object.entries(defaultAliases.use)
      .filter(([renderer,]) => {
        const suggestion = `use: ${renderer}`
        const suggestionPattern = suggestion.replace(' ', '').toLowerCase()
        const textPattern = text.replace(' ', '').toLowerCase()
        return suggestion !== text &&
          (suggestionPattern.includes(textPattern))
      })
      .map(([renderer, info]) =>
        new Suggestion({
          text: `<span>use: ${renderer}</span><span class='info' title="${info.desc}">ⓘ</span>`,
          replace: `use: ${renderer}`,
        })
      )
    return rendererSuggestions.length > 0 ? rendererSuggestions : []
  }
  return []
}
// }}}
// {{{ FUNCTION: Show element about suggestions
const addSuggestions = (anchor, suggestions) => {

  if (suggestions.length === 0) {
    suggestionsEle.style.display = 'none';
    return
  } else {
    suggestionsEle.style.display = 'block';
  }

  suggestionsEle.innerHTML = ''
  suggestions.forEach((suggestion) => {
    const option = document.createElement('div');
    if (suggestion.text.startsWith('<')) {
      option.innerHTML = suggestion.text;
    } else {
      option.innerText = suggestion.text;
    }
    option.classList.add('container__suggestion');
    option.onmouseover = () => {
      Array.from(suggestionsEle.children).forEach(s => s.classList.remove('focus'))
      option.classList.add('focus')
    }
    option.onmouseout = () => {
      option.classList.remove('focus')
    }
    option.onclick = () => {
      cm.setSelection(anchor, { ...anchor, ch: 0 })
      cm.replaceSelection(suggestion.replace)
      cm.focus();
      const newAnchor = { ...anchor, ch: suggestion.replace.length }
      cm.setCursor(newAnchor);
    };
    suggestionsEle.appendChild(option);
  });

  const widgetAnchor = document.createElement('div')
  cm.addWidget(anchor, widgetAnchor, true)
  const rect = widgetAnchor.getBoundingClientRect()
  suggestionsEle.style.left = `calc(${rect.left}px + 2rem)`;
  suggestionsEle.style.top = `calc(${rect.bottom}px + 1rem)`;
  suggestionsEle.style.maxWidth = `calc(${window.innerWidth}px - ${rect.x}px - 3rem)`;
  suggestionsEle.style.display = 'block'
}
// }}}
// EVENT: Suggests for current selection {{{
// FIXME Dont show suggestion when selecting multiple chars
cm.on("cursorActivity", (_) => {
  suggestionsEle.style.display = 'none'
  const anchor = cm.getCursor()

  if (insideCodeblockForMap(anchor)) {
    handleTypingInCodeBlock(anchor)
  }
});
cm.on("blur", () => {
  suggestionsEle.style.display = 'none'
})
// }}}
// EVENT: keydown for suggestions {{{
const keyForSuggestions = ['Tab', 'Enter', 'Escape']
cm.on('keydown', (_, e) => {
  if (!cm.hasFocus || !keyForSuggestions.includes(e.key) || suggestionsEle.style.display === 'none') return;

  // Directly add a newline when no suggestion is selected
  const currentSuggestion = suggestionsEle.querySelector('.container__suggestion.focus')
  if (!currentSuggestion && e.key === 'Enter') return

  // Override default behavior
  e.preventDefault();

  // Suggestion when pressing Tab or Shift + Tab
  const nextSuggestion = currentSuggestion?.nextSibling ?? suggestionsEle.querySelector('.container__suggestion:first-child')
  const previousSuggestion = currentSuggestion?.previousSibling ?? suggestionsEle.querySelector('.container__suggestion:last-child')
  const focusSuggestion = e.shiftKey ? previousSuggestion : nextSuggestion

  // Current editor selection state
  const anchor = cm.getCursor()
  switch (e.key) {
    case 'Tab':
      Array.from(suggestionsEle.children).forEach(s => s.classList.remove('focus'))
      focusSuggestion.classList.add('focus')
      focusSuggestion.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      break;
    case 'Enter':
      currentSuggestion.onclick()
      break;
    case 'Escape':
      suggestionsEle.style.display = 'none';
      // Focus editor again
      setTimeout(() => cm.focus() && cm.setCursor(anchor), 100)
      break;
  }
});

document.onkeydown = (e) => {
  if (e.altKey && e.ctrlKey && e.key === 'm') {
    toggleEditing()
    e.preventDefault()
    return null
  }
  if (!cm.hasFocus()) {
    if (!dumbymap) return

    if (e.key === 'Tab') {
      e.preventDefault()
      dumbymap.utils.focusNextMap(e.shiftKey)
    }
    if (e.key === 'x') {
      e.preventDefault()
      dumbymap.utils.switchToNextLayout()
    }
    if (e.key === 'n') {
      e.preventDefault()
      dumbymap.utils.focusNextBlock()
    }
    if (e.key === 'p') {
      e.preventDefault()
      dumbymap.utils.focusNextBlock(true)
    }
  }
}

// }}}
// }}}
const layoutObserver = new MutationObserver(() => {
  const layout = HtmlContainer.getAttribute('data-layout')
  if (layout !== 'normal') {
    document.body.removeAttribute('data-mode')
  }
})

layoutObserver.observe(HtmlContainer, {
  attributes: true,
  attributeFilter: ["data-layout"],
  attributeOldValue: true
});

// vim: sw=2 ts=2 foldmethod=marker foldmarker={{{,}}}
