import { markdown2HTML, generateMaps } from './dumbymap'
import { defaultAliasesForRenderer, parseConfigsFromYaml } from 'mapclay'
import { createDocLinks } from './dumbymap.mjs'

// Set up Editor {{{

const HtmlContainer = document.querySelector(".result-html")
const textArea = document.querySelector(".editor textarea")

const toggleMaps = (container) => {
  if (!container.querySelector('.Showcase')) {
    generateMaps(container)
    document.activeElement.blur();
  } else {
    markdown2HTML(HtmlContainer, editor.value())
    createDocLinks(container)
    container.setAttribute('data-layout', 'none')
  }
}

// Content values for editor
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
const queryParams = new URL(window.location).searchParams
window.location.hash = ''
const contentFromHash = initialState.content
const lastContent = localStorage.getItem('editorContent')
const defaultContent = '## Links\n\n- [Go to marker](geo:24,121?id=foo,leaflet&text=normal "Link Test")\n\n```map\nid: foo\nuse: Maplibre\n```\n'

// Set up EasyMDE {{{
const editor = new EasyMDE({
  element: textArea,
  indentWithTabs: false,
  initialValue: contentFromHash ?? lastContent ?? defaultContent,
  lineNumbers: true,
  promptURLs: true,
  uploadImage: true,
  autosave: {
    enabled: true,
    uniqueId: 'dumbymap',
  },
  spellChecker: false,
  toolbarButtonClassPrefix: 'mde',
  status: false,
  shortcuts: {
    "map": "Ctrl-Alt-M",
    "debug": "Ctrl-Alt-D",
    "toggleUnorderedList": "Ctrl-Shift-L",
  },
  toolbar: [
    {
      name: 'map',
      title: 'Toggle Map Generation',
      text: "🌏",
      action: () => toggleMaps(HtmlContainer),
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
    }, 'undo', 'redo', '|', 'heading-1', 'heading-2', '|', 'link', 'image', '|', 'bold', 'italic', 'strikethrough', 'code', 'clean-block', '|', 'unordered-list', 'ordered-list', 'quote', 'table', '|', 'fullscreen'
  ],
});

const cm = editor.codemirror
markdown2HTML(HtmlContainer, editor.value())
createDocLinks(HtmlContainer)

if (queryParams.get('render')) {
  toggleMaps(HtmlContainer)
}

// Re-render HTML by editor content
cm.on("change", () => {
  markdown2HTML(HtmlContainer, editor.value())
  createDocLinks(HtmlContainer)
})
// }}}

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
// FUNCTION: Check cursor is inside map code block {{{
// const insideCodeblockForMap = (currentLine) => {
//   let tokens = cm.getLineTokens(currentLine)
//
//   if (!tokens.includes("comment") || tokens.includes('formatting-code-block')) return false
//
//   do {
//     line = line - 1
//     if (line < 0) return false
//     tokens = cm.getLineTokens(line)
//   } while (!tokens.includes('formatting-code-block'))
//
//   return true
// }
// }}}
//  FUNCTION Check if current token is inside code block {{{
const insideCodeblockForMap = (token) =>
  token.state.overlay.codeBlock && !token.string.match(/^````*/)
// }}}
// FUNCTION: Get renderer by cursor position in code block {{{
const getLineWithRenderer = (anchor) => {
  const currentLine = anchor.line
  const match = (line) => cm.getLine(line).match(/^use: /)
  if (match(currentLine)) return currentLine

  const getToken = (line) => cm.getTokenAt({ line: line, ch: 1 })

  // Look backward/forward for pattern of used renderer: /use: .+/
  let ps = currentLine - 1
  while (ps > 0 && insideCodeblockForMap(getToken(ps))) {
    if (match(ps)) {
      return ps
    } else if (cm.getLine(ps).match(/^---/)) {
      // If yaml doc separator is found
      break
    }
    ps = ps - 1
  }

  let ns = currentLine + 1
  while (insideCodeblockForMap(getToken(ns))) {
    if (match(ns)) {
      return ns
    } else if (cm.getLine(ns).match(/^---/)) {
      // If yaml doc separator is found
      return null
    }
    ns = ns + 1
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
  const markInputIsInvalid = () => cm.getDoc().markText(
    { ...anchor, ch: 0 },
    { ...anchor, ch: -1 },
    { className: 'invalid-input' },
  )
  let suggestions = []

  // Check if "use: <renderer>" is set
  const lineWithRenderer = getLineWithRenderer(anchor)
  const renderer = cm.getLine(lineWithRenderer).split(' ')[1]
  if (renderer) {
    // Do not check properties
    if (text.startsWith('  ')) return []

    // If no valid options for current used renderer, go get it!
    const validOptions = rendererOptions[renderer]
    if (!validOptions) {
      // Get list of valid options for current renderer
      const rendererUrl = defaultAliasesForRenderer.use[renderer]?.value
      import(rendererUrl)
        .then(rendererModule => {
          rendererOptions[renderer] = rendererModule.default.validOptions
        })
        .catch(() => {
          markInputIsInvalid(lineWithRenderer)
          console.warn(`Fail to get valid options from renderer with URL ${rendererUrl}`)
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
      suggestions = getSuggestionsForOptions(keyTyped, validOptions)
      markInputIsInvalid()
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
        suggestions = [
          getSuggestionFromMapOption(matchedOption),
          ...getSuggestionsFromAliases(matchedOption)
        ].filter(s => s instanceof Suggestion)
      }
      if (valueTyped && !isValidValue) {
        markInputIsInvalid()
      }
    }

  } else {
    // Suggestion for "use"
    const rendererSuggestions = Object.entries(defaultAliasesForRenderer.use)
      .filter(([renderer,]) => {
        const suggestion = `use: ${renderer}`
        const suggetionNoSpace = suggestion.replace(' ', '')
        const textNoSpace = text.replace(' ', '')
        return suggestion !== text &&
          (suggetionNoSpace.includes(textNoSpace))
      })
      .map(([renderer, info]) =>
        new Suggestion({
          text: `<span>use: ${renderer}</span><span class='info' title="${info.desc}">ⓘ</span>`,
          replace: `use: ${renderer}`,
        })
      )
    suggestions = rendererSuggestions.length > 0 ? rendererSuggestions : []
  }
  return suggestions
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

  cm.addWidget(anchor, suggestionsEle, true)
  const rect = suggestionsEle.getBoundingClientRect()
  suggestionsEle.style.maxWidth = `calc(${window.innerWidth}px - ${rect.x}px - 2rem)`;
  suggestionsEle.style.display = 'block'
}
// }}}
// EVENT: suggests for current selection {{{
// FIXME Dont show suggestion when selecting multiple chars
cm.on("beforeSelectionChange", (_, obj) => {
  const anchor = (obj.ranges[0].anchor)
  const token = cm.getTokenAt(anchor)

  if (insideCodeblockForMap(token)) {
    handleTypingInCodeBlock(anchor)
  }
});
// }}}
// EVENT: keydown for suggestions {{{
cm.on('keydown', (_, e) => {

  // Only the following keys are used
  const keyForSuggestions = ['Tab', 'Enter', 'Escape'].includes(e.key)
  if (!keyForSuggestions || suggestionsEle.style.display === 'none') return;

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
      const anchor = cm.getCursor()
      suggestionsEle.style.display = 'none';
      // Focus editor again
      setTimeout(() => cm.focus() && cm.setCursor(anchor), 100)
      break;
  }
});

document.onkeydown = (e) => {
  if (e.altKey && e.ctrlKey && e.key === 'm') {
    toggleMaps(HtmlContainer)
  }
}

// }}}
// }}}

// vim: sw=2 ts=2 foldmethod=marker foldmarker={{{,}}}
