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
export const htmlToMd = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent
    return t.trim() ? t : ''
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const tag = node.tagName.toLowerCase()
  const inner = () => Array.from(node.childNodes).map(htmlToMd).join('')

  switch (tag) {
    case 'h1': return `# ${inner().trim()}\n\n`
    case 'h2': return `## ${inner().trim()}\n\n`
    case 'h3': return `### ${inner().trim()}\n\n`
    case 'h4': return `#### ${inner().trim()}\n\n`
    case 'h5': return `##### ${inner().trim()}\n\n`
    case 'h6': return `###### ${inner().trim()}\n\n`
    case 'p': return `${inner().trim()}\n\n`
    case 'br': return '\n'
    case 'hr': return '---\n\n'
    case 'strong':
    case 'b': return `**${inner()}**`
    case 'em':
    case 'i': return `*${inner()}*`
    case 'a': return `[${inner()}](${node.getAttribute('href') ?? ''})`
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
        .map(li => `- ${htmlToMd(li).trim()}`)
        .join('\n') + '\n\n'
    case 'ol':
      return Array.from(node.children)
        .map((li, i) => `${i + 1}. ${htmlToMd(li).trim()}`)
        .join('\n') + '\n\n'
    default:
      return UNWRAP_TAGS.has(tag) ? inner() : node.outerHTML
  }
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
  const lines = md.split('\n')
  const blocks = []
  let buf = []
  let inFence = false
  let blanks = 0
  for (const line of lines) {
    const wasInFence = inFence
    if (/^```/.test(line)) inFence = !inFence
    if (!wasInFence && line.trim() === '') {
      blanks++
      buf.push(line)
    } else {
      if (!wasInFence && blanks >= 2) {
        const content = buf.slice(0, buf.length - blanks).join('\n').trim()
        if (content) blocks.push(content)
        buf = []
      }
      blanks = 0
      buf.push(line)
    }
  }
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

  md.renderer.rules.dumby_block_open = () => '<article class="dumby-block">'
  md.renderer.rules.dumby_block_close = () => '</article>'
  md.core.ruler.after('block', 'dumby_block', state => {
    const tokens = state.tokens
    const out = []
    let blockOpen = false
    let prevEndLine = -1

    for (const token of tokens) {
      if (token.map) {
        const gap = token.map[0] - prevEndLine
        if (!blockOpen) {
          out.push(new state.Token('dumby_block_open', '', 1))
          blockOpen = true
        } else if (gap >= 2) {
          out.push(new state.Token('dumby_block_close', '', -1))
          out.push(new state.Token('dumby_block_open', '', 1))
        }
        prevEndLine = token.map[1]
      }
      out.push(token)
    }

    if (blockOpen) out.push(new state.Token('dumby_block_close', '', -1))
    state.tokens = out
  })

  return md.render(mdContent)
}
