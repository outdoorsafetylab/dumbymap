import TinyMDE from 'tiny-markdown-editor'
import { markdown2HTML, generateMaps } from './dumbymap'
import { defaultAliasesForRenderer, parseConfigsFromYaml } from 'mapclay'

// Set up Editor {{{

const HtmlContainer = document.querySelector(".result-html")
const mdeElement = document.querySelector("#tinymde")

const getContentFromHash = (cleanHash = false) => {
  const hashValue = location.hash.substring(1);
  if (cleanHash) window.location.hash = ''
  return hashValue.startsWith('text=')
    ? decodeURIComponent(hashValue.substring(5))
    : null
}

// Add Editor
const contentFromHash = getContentFromHash(true)
const lastContent = localStorage.getItem('editorContent')
const defaultContent = '## Links\n\n- [Go to marker](geo:24,121?id=foo,leaflet&text=normal "Link Test")\n\n```map\nid: foo\nuse: Maplibre\n```\n'

const tinyEditor = new TinyMDE.Editor({
  element: 'tinymde',
  content: contentFromHash ?? lastContent ?? defaultContent
});
mdeElement.querySelectorAll('span').forEach(e => e.setAttribute('spellcheck', 'false'))

onhashchange = () => {
  const contentFromHash = getContentFromHash()
  if (contentFromHash) tinyEditor.setContent(contentFromHash)
}

// Add command bar for editor
// Use this command to render maps and geoLinks
const mapCommand = {
  name: 'map',
  title: 'Switch Map Generation',
  innerHTML: `<div style="font-size: 16px; line-height: 1.1;">🌏</div>`,
  action: () => {
    if (!HtmlContainer.querySelector('.map-container')) {
      generateMaps(HtmlContainer)
      document.activeElement.blur();
    } else {
      markdown2HTML(HtmlContainer, tinyEditor.getContent())
      HtmlContainer.setAttribute('data-layout', 'none')
    }
  },
  hotkey: 'Ctrl-m'
}
const debugCommand = {
  name: 'debug',
  title: 'show debug message',
  innerHTML: `<div style="font-size: 16px; line-height: 1.1;">🤔</div>`,
  action: () => {
    window.location.hash = '#text=' + encodeURIComponent(tinyEditor.getContent())
  },
  hotkey: 'Ctrl-i'
}
// Set up command bar
new TinyMDE.CommandBar({
  element: 'tinymde_commandbar', editor: tinyEditor,
  commands: [mapCommand, debugCommand, '|', 'h1', 'h2', '|', 'insertLink', 'insertImage', '|', 'bold', 'italic', 'strikethrough', 'code', '|', 'ul', 'ol', '|', 'blockquote']
});

// Render HTML to result container
markdown2HTML(HtmlContainer, tinyEditor.getContent())

// FIXME DEBUGONLY
// generateMaps(HtmlContainer)
// setTimeout(() => {
//   HtmlContainer.setAttribute("data-layout", 'side')
// }, 500)

// }}}
// Event Listener: change {{{

// Save editor content to local storage, set timeout for 3 seconds
let cancelLastSave
const saveContent = (content) => {
  new Promise((resolve, reject) => {
    // If user is typing, the last change cancel previous ones
    if (cancelLastSave) cancelLastSave(content.length)
    cancelLastSave = reject

    setTimeout(() => {
      localStorage.setItem('editorContent', content)
      resolve('Content Saved')
    }, 3000)
  }).catch((err) => console.warn('Fail to save content', err))
}

// Render HTML to result container and save current content
tinyEditor.addEventListener('change', e => {
  markdown2HTML(HtmlContainer, e.content)
  saveContent(e.content)
});
// }}}
// Completion in Code Blok {{{
// Elements about suggestions {{{
const suggestionsEle = document.createElement('div')
suggestionsEle.classList.add('container__suggestions');
mdeElement.appendChild(suggestionsEle)

const rendererOptions = {}

class Suggestion {
  constructor({ text, replace }) {
    this.text = text
    this.replace = replace
  }
}

// }}}
// {{{ Aliases for map options
const aliasesForMapOptions = {}
const defaultApply = '/default.yml'
fetch(defaultApply)
  .then(res => res.text())
  .then(rawText => {
    const config = parseConfigsFromYaml(rawText)?.at(0)
    Object.assign(aliasesForMapOptions, config.aliases ?? {})
  })
  .catch(err => console.warn(`Fail to get aliases from ${defaultApply}`, err))
// }}}
// FUNCTION: Check cursor is inside map code block {{{
const insideCodeblockForMap = (element) => {
  const code = element.closest('.TMFencedCodeBacktick')
  if (!code) return false

  let ps = code.previousSibling
  if (!ps) return false

  // Look backward to find pattern of code block: /```map/
  while (!ps.classList.contains('TMCodeFenceBacktickOpen')) {
    ps = ps.previousSibling
    if (!ps) return false
    if (ps.classList.contains('TMCodeFenceBacktickClose')) return false
  }

  return ps.querySelector('.TMInfoString')?.textContent === 'map'
}
// }}}
// FUNCTION: Get renderer by cursor position in code block {{{
const getLineWithRenderer = (element) => {
  const currentLine = element.closest('.TMFencedCodeBacktick')
  if (!currentLine) return null

  // Look backward/forward for pattern of used renderer: /use: .+/
  let ps = currentLine
  do {
    ps = ps.previousSibling
    if (ps.textContent.match(/^use: /)) {
      return ps
    } else if (ps.textContent.match(/^---/)) {
      // If yaml doc separator is found
      break
    }
  } while (ps && ps.classList.contains('TMFencedCodeBacktick'))

  let ns = currentLine
  do {
    ns = ns.nextSibling
    if (ns.textContent.match(/^use: /)) {
      return ns
    } else if (ns.textContent.match(/^---/)) {
      // If yaml doc separator is found
      return null
    }
  } while (ns && ns.classList.contains('TMFencedCodeBacktick'))

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
const handleTypingInCodeBlock = (currentLine, selection) => {
  const text = currentLine.textContent
  if (text.match(/^\s\+$/) && text.length % 2 !== 0) {
    // TODO Completion for even number of spaces
  } else if (text.match(/^-/)){
    // TODO Completion for YAML doc separator
  } else {
    addSuggestions(currentLine, selection)
  }
}
// FUNCTION: Add HTML element for List of suggestions {{{
const addSuggestions = (currentLine, selection) => {
  const text = currentLine.textContent
  const markInputIsInvalid = (ele) => (ele ?? currentLine).classList.add('invalid-input')
  let suggestions = []

  // Check if "use: <renderer>" is set
  const lineWithRenderer = getLineWithRenderer(currentLine)
  const renderer = lineWithRenderer?.textContent.split(' ')[1]
  if (renderer) {

    // Do not check properties
    if (text.startsWith('  ')) return

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
          console.error('Fail to get valid options from renderer, URL is', rendererUrl)
        })
      return
    }

    // If input is "key:value" (no space left after colon), then it is invalid
    const isKeyFinished = text.includes(':');
    const isValidKeyValue = text.match(/^[^:]+:\s+/)
    if (isKeyFinished && !isValidKeyValue) {
      markInputIsInvalid()
      return
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
      const newFocus = { ...selection.focus, col: 0 }
      const newAnchor = { ...selection.anchor, col: text.length }
      tinyEditor.paste(suggestion.replace, newFocus, newAnchor)
      suggestionsEle.style.display = 'none';
      option.classList.remove('focus')
    };
    suggestionsEle.appendChild(option);
  });

  const rect = currentLine.getBoundingClientRect();
  suggestionsEle.style.top = `${rect.top + rect.height + 12}px`;
  suggestionsEle.style.left = `${rect.right}px`;
  suggestionsEle.style.maxWidth = `calc(${window.innerWidth}px - ${rect.right}px - 2rem)`;
}
// }}}
// EVENT: suggests for current selection {{{
tinyEditor.addEventListener('selection', selection => {
  // Check selection is inside editor contents
  const node = selection?.anchor?.node
  if (!node) return

  // FIXME Better way to prevent spellcheck across editor
  // Get HTML element for current selection
  const element = node instanceof HTMLElement
    ? node
    : node.parentNode
  element.setAttribute('spellcheck', 'false')

  // To trigger click event on suggestions list, don't set suggestion list invisible
  if (suggestionsEle.querySelector('.container__suggestion.focus:hover') !== null) {
    return
  } else {
    suggestionsEle.style.display = 'none';
  }

  // Do not show suggestion by attribute
  if (suggestionsEle.getAttribute('data-keep-close') === 'true') {
    suggestionsEle.setAttribute('data-keep-close', 'false')
    return
  }

  // Show suggestions for map code block
  if (insideCodeblockForMap(element)) {
    handleTypingInCodeBlock(element, selection)
  }
});
// }}}
// EVENT: keydown for suggestions {{{
mdeElement.addEventListener('keydown', (e) => {
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
  const selection = tinyEditor.getSelection(true)
  switch (e.key) {
    case 'Tab':
      Array.from(suggestionsEle.children).forEach(s => s.classList.remove('focus'))
      focusSuggestion.classList.add('focus')
      focusSuggestion.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      break;
    case 'Enter':
      currentSuggestion.onclick()
      suggestionsEle.style.display = 'none';
      break;
    case 'Escape':
      suggestionsEle.style.display = 'none';
      // Prevent trigger selection event again
      suggestionsEle.setAttribute('data-keep-close', 'true')
      setTimeout(() => tinyEditor.setSelection(selection), 100)
      break;
  }
});
// }}}
// }}}

// vim: sw=2 ts=2 foldmethod=marker foldmarker={{{,}}}
