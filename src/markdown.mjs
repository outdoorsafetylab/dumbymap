import MarkdownIt from 'markdown-it'
import MarkdownItAnchor from 'markdown-it-anchor'
import MarkdownItFootnote from 'markdown-it-footnote'
import MarkdownItFrontMatter from 'markdown-it-front-matter'
import MarkdownItInjectLinenumbers from 'markdown-it-inject-linenumbers'
import MarkdownItAttrs from 'markdown-it-attrs'

const UNWRAP_TAGS = new Set(['div', 'article', 'section', 'main', 'aside', 'header', 'footer', 'nav'])

/**
 * Convert a DOM node (element or text) to a Markdown string.
 * Handles the most common HTML elements so that raw-HTML containers
 * can be round-tripped into editable markdown text.
 *
 * @param {Node} node
 * @returns {string}
 */
export const htmlToMd = (rootNode) => {
  // Bidirectional map for reference-style link deduplication: url → label
  const urlToLabel = new Map()
  const usedLabels = new Set()

  // Return the existing label for a URL, or derive a unique one from the link text
  const getLabel = (href, text) => {
    if (urlToLabel.has(href)) return urlToLabel.get(href)
    let label = text
    if (usedLabels.has(label)) {
      let i = 2
      while (usedLabels.has(`${text}-${i}`)) i++
      label = `${text}-${i}`
    }
    urlToLabel.set(href, label)
    usedLabels.add(label)
    return label
  }

  // Recursively convert a single DOM node to its Markdown representation
  const convert = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent
      return t.trim() ? t : ''
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return ''

    // Helpers: serialize all children, or heading children minus anchor links
    const tag = node.tagName.toLowerCase()
    const inner = () => Array.from(node.childNodes).map(convert).join('')
    const headingInner = (n) =>
      Array.from(n.childNodes)
        .filter(c => !(c.nodeType === Node.ELEMENT_NODE && c.classList?.contains('header-anchor')))
        .map(convert).join('').trim()

    switch (tag) {
      case 'h1': return `# ${headingInner(node)}\n\n`
      case 'h2': return `## ${headingInner(node)}\n\n`
      case 'h3': return `### ${headingInner(node)}\n\n`
      case 'h4': return `#### ${headingInner(node)}\n\n`
      case 'h5': return `##### ${headingInner(node)}\n\n`
      case 'h6': return `###### ${headingInner(node)}\n\n`
      case 'p': return `${inner().trim()}\n\n`
      case 'br': return '\n'
      case 'hr':
        return node.classList.contains('footnotes-sep') ? '' : '---\n\n'
      case 'strong':
      case 'b': return `**${inner()}**`
      case 'em':
      case 'i': return `*${inner()}*`
      case 'sup':
        if (node.classList.contains('footnote-ref')) {
          const fnHref = node.querySelector('a')?.getAttribute('href') ?? ''
          const key = fnHref.replace(/^#fn/, '')
          return `[^${key}]`
        }
        return node.outerHTML
      case 'section':
        if (node.classList.contains('footnotes')) {
          const items = Array.from(node.querySelectorAll('li.footnote-item'))
            .map(li => {
              const key = li.id.replace(/^fn/, '')
              const paras = Array.from(li.children)
                .map(c => convert(c).trim())
                .filter(Boolean)
              const [first, ...rest] = paras
              return `[^${key}]: ${first}` + rest.map(p => `\n\n    ${p}`).join('')
            })
          return items.join('\n\n') + '\n\n'
        }
        return inner()
      case 'a': {
        if (node.classList.contains('footnote-backref')) return ''
        const href = node.getAttribute('href') ?? ''
        if (!href) return `[${inner()}]()`
        const text = inner()
        const label = getLabel(href, text)
        return text === label ? `[${text}]` : `[${text}][${label}]`
      }
      case 'img': return `![${node.getAttribute('alt') ?? ''}](${node.getAttribute('src') ?? ''})`
      case 'code':
        return node.closest('pre')
          ? node.textContent
          : `\`${node.textContent}\``
      case 'pre': {
        const code = node.querySelector('code')
        const lang = (code?.className ?? '').match(/language-(\w+)/)?.[1] ?? ''
        return `\`\`\`${lang}\n${(code ?? node).textContent.trim()}\n\`\`\`\n\n`
      }
      case 'blockquote':
        return inner().trim().split('\n').map(l => `> ${l}`).join('\n') + '\n\n'
      case 'li': return inner()
      case 'ul':
        return Array.from(node.children)
          .map(li => `- ${convert(li).trim()}`)
          .join('\n') + '\n\n'
      case 'ol':
        return Array.from(node.children)
          .map((li, i) => `${i + 1}. ${convert(li).trim()}`)
          .join('\n') + '\n\n'
      default:
        return UNWRAP_TAGS.has(tag) ? inner() : node.outerHTML
    }
  }

  // Serialize root, then append reference link definitions if any were collected
  const body = convert(rootNode)
  if (!urlToLabel.size) return body
  const defs = [...urlToLabel.entries()].map(([url, label]) => `[${label}]: ${url}`).join('\n')
  return `${body}\n${defs}\n`
}

/**
 * Split a markdown string into block strings on 2+ consecutive blank lines.
 * Fence blocks (``` ... ```) are treated as atomic — blank lines inside them
 * do not trigger a split.
 *
 * @param {string} md
 * @returns {string[]}
 */
export const splitMd = (md) => {
  // State: output blocks, current line buffer, fence flag, and consecutive blank-line count
  const lines = md.split('\n')
  const blocks = []
  let buf = []
  let inFence = false
  let blanks = 0

  for (const line of lines) {
    const wasInFence = inFence
    // Toggle fence state on opening/closing ``` markers
    if (/^```/.test(line)) inFence = !inFence

    if (!wasInFence && line.trim() === '') {
      // Accumulate blank lines; they may trigger a block split
      blanks++
      buf.push(line)
    } else {
      // Flush buffer as a new block when ≥2 consecutive blanks were seen outside a fence
      if (!wasInFence && blanks >= 2) {
        const content = buf.slice(0, buf.length - blanks).join('\n').trim()
        if (content) blocks.push(content)
        buf = []
      }
      blanks = 0
      buf.push(line)
    }
  }

  // Flush the final buffer
  if (buf.length > 0) {
    const content = buf.join('\n').trim()
    if (content) blocks.push(content)
  }
  return blocks
}

/**
 * Convert a markdown (superset of HTML) string into an HTML string
 * containing one or more .dumby-block elements.
 * Splits into separate blocks at every gap of 2+ blank lines (\n\n\n).
 *
 * @param {string} mdContent - Text in Markdown (superset of HTML) format
 * @returns {string} HTML string with .dumby-block article elements
 */
export const md2dumbyBlocks = (mdContent) => {
  // Build markdown-it instance with HTML passthrough, anchors, footnotes, and attribute support
  const md = MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
  })
    .use(MarkdownItAnchor, {
      permalink: MarkdownItAnchor.permalink.linkInsideHeader({
        placement: 'before',
      }),
    })
    .use(MarkdownItFootnote)
    .use(MarkdownItFrontMatter)
    .use(MarkdownItInjectLinenumbers)
    .use(MarkdownItAttrs)

  // Register HTML renderer for the synthetic open/close block tokens
  md.renderer.rules.dumby_block_open = () => '<article class="dumby-block">'
  md.renderer.rules.dumby_block_close = () => '</article>'

  // Core rule: inject dumby_block_open / dumby_block_close tokens around groups of
  // block-level tokens separated by ≥2 blank source lines
  md.core.ruler.after('block', 'dumby_block', state => {
    const tokens = state.tokens
    const out = []
    let blockOpen = false
    let prevEndLine = -1

    for (const token of tokens) {
      if (token.map) {
        const gap = token.map[0] - prevEndLine
        if (!blockOpen) {
          // Open the first dumby-block
          out.push(new state.Token('dumby_block_open', '', 1))
          blockOpen = true
        } else if (gap >= 2) {
          // Gap of ≥2 blank lines: close current block and open a new one
          out.push(new state.Token('dumby_block_close', '', -1))
          out.push(new state.Token('dumby_block_open', '', 1))
        }
        prevEndLine = token.map[1]
      }
      out.push(token)
    }

    // Close the last open block
    if (blockOpen) out.push(new state.Token('dumby_block_close', '', -1))
    state.tokens = out
  })

  return md.render(mdContent)
}
