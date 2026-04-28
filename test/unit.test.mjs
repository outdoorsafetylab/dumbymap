import { describe, it, expect, vi, beforeEach } from 'vitest'

// These mocks must be declared before the module import.
// Vitest hoists vi.mock() calls so they run before any import statements.

vi.mock('mapclay', () => ({
  renderWith: vi.fn(() => vi.fn()),
  defaultAliases: {},
  parseConfigsFromYaml: vi.fn(() => [
    { aliases: { use: { osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' } } },
  ]),
}))

vi.mock('plain-modal', () => ({
  default: class PlainModal { constructor () {} },
}))

vi.mock('ol/proj/proj4', () => ({
  register: vi.fn(),
  fromEPSGCode: vi.fn(),
}))

vi.mock('proj4', () => ({ default: {} }))

import {
  setupContainer,
  md2dumbyBlocks,
  createShowcase,
  createModal,
  buildDumbymap,
  fetchDefaultAliases,
  splitMd,
  assignMapId,
  htmlToMd,
} from '../src/dumbymap.mjs'

// ─── helpers ──────────────────────────────────────────────────────────────────

const makeContainer = (innerHTML = '') => {
  const container = document.createElement('div')
  const htmlHolder = document.createElement('div')
  htmlHolder.className = 'SemanticHtml'
  htmlHolder.innerHTML = innerHTML
  container.appendChild(htmlHolder)
  const showcase = document.createElement('div')
  showcase.className = 'Showcase'
  container.appendChild(showcase)
  return container
}

const makeBuildArgs = () => {
  const container = makeContainer()
  const modal = {}
  const modalContent = document.createElement('div')
  return { container, modal, modalContent }
}

// ─── setupContainer ───────────────────────────────────────────────────────────

describe('setupContainer', () => {
  it('adds Dumby class', () => {
    const el = document.createElement('div')
    setupContainer(el)
    expect(el.classList.contains('Dumby')).toBe(true)
  })

  it('defaults crs to EPSG:4326', () => {
    const el = document.createElement('div')
    setupContainer(el)
    expect(el.dataset.crs).toBe('EPSG:4326')
  })

  it('sets custom crs', () => {
    const el = document.createElement('div')
    setupContainer(el, { crs: 'EPSG:3857' })
    expect(el.dataset.crs).toBe('EPSG:3857')
  })

  it('sets layout from initialLayout', () => {
    const el = document.createElement('div')
    setupContainer(el, { initialLayout: 'overlay' })
    expect(el.dataset.layout).toBe('overlay')
  })

  it('falls back to first default layout name when initialLayout omitted', () => {
    const el = document.createElement('div')
    setupContainer(el)
    expect(el.dataset.layout).toBe('normal')
  })

  it('clears existing children', () => {
    const el = document.createElement('div')
    el.innerHTML = '<p>old content</p><span>more</span>'
    setupContainer(el)
    expect(el.querySelector('p')).toBeNull()
    expect(el.querySelector('span')).toBeNull()
  })

  it('creates a .SemanticHtml child', () => {
    const el = document.createElement('div')
    setupContainer(el)
    expect(el.querySelector('.SemanticHtml')).not.toBeNull()
  })
})


// ─── md2dumbyBlocks ───────────────────────────────────────────────────────────

describe('md2dumbyBlocks', () => {
  it('returns a string', () => {
    expect(typeof md2dumbyBlocks('hello')).toBe('string')
  })

  it('wraps content in a .dumby-block article', () => {
    const html = md2dumbyBlocks('# Title\n\nsome text')
    const div = document.createElement('div')
    div.innerHTML = html
    expect(div.querySelector('article.dumby-block')).not.toBeNull()
  })

  it('produces a single block when no triple newline', () => {
    const html = md2dumbyBlocks('para one\n\npara two')
    const div = document.createElement('div')
    div.innerHTML = html
    expect(div.querySelectorAll('.dumby-block').length).toBe(1)
  })

  it('splits on 2+ blank lines (triple newline)', () => {
    const html = md2dumbyBlocks('block one\n\n\nblock two')
    const div = document.createElement('div')
    div.innerHTML = html
    expect(div.querySelectorAll('.dumby-block').length).toBe(2)
  })

  it('produces multiple blocks for multi-section markdown', () => {
    const html = md2dumbyBlocks('# A\n\npara\n\n\n# B\n\npara')
    const div = document.createElement('div')
    div.innerHTML = html
    expect(div.querySelectorAll('.dumby-block').length).toBe(2)
  })

  it('passes inline HTML through unchanged', () => {
    const html = md2dumbyBlocks('<p class="custom">text</p>')
    expect(html).toContain('class="custom"')
  })
})


// ─── createShowcase ───────────────────────────────────────────────────────────

describe('createShowcase', () => {
  it('appends .Showcase div to container', () => {
    const container = document.createElement('div')
    const showcase = createShowcase(container)
    expect(showcase.classList.contains('Showcase')).toBe(true)
    expect(container.contains(showcase)).toBe(true)
  })

  it('returns the created element', () => {
    const container = document.createElement('div')
    const result = createShowcase(container)
    expect(result).toBe(container.querySelector('.Showcase'))
  })
})

// ─── createModal ──────────────────────────────────────────────────────────────

describe('createModal', () => {
  it('returns modal and modalContent', () => {
    const container = document.createElement('div')
    const result = createModal(container)
    expect(result).toHaveProperty('modal')
    expect(result).toHaveProperty('modalContent')
  })

  it('appends modalContent to container', () => {
    const container = document.createElement('div')
    const { modalContent } = createModal(container)
    expect(container.contains(modalContent)).toBe(true)
  })
})

// ─── buildDumbymap ────────────────────────────────────────────────────────────

describe('buildDumbymap', () => {
  it('sets container reference', () => {
    const { container, modal, modalContent } = makeBuildArgs()
    const dumbymap = buildDumbymap(container, { modal, modalContent })
    expect(dumbymap.container).toBe(container)
  })

  it('initialises aliases as empty object', () => {
    const { container, modal, modalContent } = makeBuildArgs()
    const dumbymap = buildDumbymap(container, { modal, modalContent })
    expect(dumbymap.aliases).toEqual({})
  })

  it('includes default layouts', () => {
    const { container, modal, modalContent } = makeBuildArgs()
    const dumbymap = buildDumbymap(container, { modal, modalContent })
    expect(dumbymap.layouts.length).toBeGreaterThan(0)
    expect(dumbymap.layouts[0]).toHaveProperty('name')
  })

  it('merges extra layout objects', () => {
    const { container, modal, modalContent } = makeBuildArgs()
    const extra = { name: 'custom' }
    const dumbymap = buildDumbymap(container, { modal, modalContent, layouts: [extra] })
    expect(dumbymap.layouts.map(l => l.name)).toContain('custom')
  })

  it('accepts extra layouts given as strings', () => {
    const { container, modal, modalContent } = makeBuildArgs()
    const dumbymap = buildDumbymap(container, { modal, modalContent, layouts: ['custom'] })
    expect(dumbymap.layouts.map(l => l.name)).toContain('custom')
  })

  it('htmlHolder getter resolves .SemanticHtml', () => {
    const { container, modal, modalContent } = makeBuildArgs()
    const dumbymap = buildDumbymap(container, { modal, modalContent })
    expect(dumbymap.htmlHolder).toBe(container.querySelector('.SemanticHtml'))
  })

  it('showcase getter resolves .Showcase', () => {
    const { container, modal, modalContent } = makeBuildArgs()
    const dumbymap = buildDumbymap(container, { modal, modalContent })
    expect(dumbymap.showcase).toBe(container.querySelector('.Showcase'))
  })

  it('blocks getter returns .dumby-block elements', () => {
    const { container, modal, modalContent } = makeBuildArgs()
    const block = document.createElement('article')
    block.className = 'dumby-block'
    container.querySelector('.SemanticHtml').appendChild(block)
    const dumbymap = buildDumbymap(container, { modal, modalContent })
    expect(dumbymap.blocks).toHaveLength(1)
    expect(dumbymap.blocks[0]).toBe(block)
  })
})

// ─── splitMd ──────────────────────────────────────────────────────────────────

describe('splitMd', () => {
  it('returns empty array for empty string', () => {
    expect(splitMd('')).toEqual([])
  })

  it('returns single block when no double blank lines', () => {
    const md = 'line one\nline two\nline three'
    expect(splitMd(md)).toEqual([md])
  })

  it('splits on two consecutive blank lines', () => {
    const md = 'block one\n\n\nblock two'
    const result = splitMd(md)
    expect(result).toHaveLength(2)
    expect(result[0]).toBe('block one')
    expect(result[1]).toBe('block two')
  })

  it('does not split on a single blank line', () => {
    const md = 'para one\n\npara two'
    expect(splitMd(md)).toHaveLength(1)
  })

  it('does not split inside a fenced code block', () => {
    const md = '```\ncode\n\n\nstill in fence\n```'
    expect(splitMd(md)).toHaveLength(1)
  })

  it('splits before and after a fenced block containing blank lines', () => {
    const md = 'intro\n\n\n```\ncode\n\n\nstill fence\n```\n\n\noutro'
    const result = splitMd(md)
    expect(result).toHaveLength(3)
    expect(result[0]).toBe('intro')
    expect(result[1]).toBe('```\ncode\n\n\nstill fence\n```')
    expect(result[2]).toBe('outro')
  })

  it('trims leading/trailing whitespace from each block', () => {
    const md = '  block one  \n\n\n  block two  '
    const result = splitMd(md)
    expect(result[0]).toBe('block one')
    expect(result[1]).toBe('block two')
  })

  it('ignores leading/trailing blank lines (no empty blocks)', () => {
    const md = '\n\nblock\n\n'
    const result = splitMd(md)
    expect(result).toHaveLength(1)
    expect(result[0]).toBe('block')
  })

  it('handles three or more consecutive blank lines as a single separator', () => {
    const md = 'a\n\n\n\n\nb'
    const result = splitMd(md)
    expect(result).toHaveLength(2)
    expect(result[0]).toBe('a')
    expect(result[1]).toBe('b')
  })

  it('returns multiple blocks when split occurs multiple times', () => {
    const md = 'one\n\n\ntwo\n\n\nthree'
    const result = splitMd(md)
    expect(result).toHaveLength(3)
    expect(result).toEqual(['one', 'two', 'three'])
  })
})

// ─── fetchDefaultAliases ──────────────────────────────────────────────────────

describe('fetchDefaultAliases', () => {
  beforeEach(() => vi.unstubAllGlobals())

  it('does nothing when url is falsy', () => {
    const dumbymap = { aliases: {} }
    expect(() => fetchDefaultAliases(null, dumbymap)).not.toThrow()
    expect(dumbymap.aliases).toEqual({})
  })

  it('populates aliases from fetched YAML', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      text: () => Promise.resolve('aliases:\n  use:\n    osm: https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
    }))
    const dumbymap = { aliases: {} }
    fetchDefaultAliases('http://fake/default.yml', dumbymap)
    await vi.waitFor(() => expect(Object.keys(dumbymap.aliases).length).toBeGreaterThan(0))
  })

  it('warns on fetch failure without throwing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))
    const dumbymap = { aliases: {} }
    fetchDefaultAliases('http://fake/default.yml', dumbymap)
    await vi.waitFor(() => expect(warnSpy).toHaveBeenCalled())
    warnSpy.mockRestore()
  })
})

// ─── htmlToMd ─────────────────────────────────────────────────────────────────

describe('htmlToMd — anchor reference links', () => {
  const makeA = (href, text) => {
    const a = document.createElement('a')
    a.setAttribute('href', href)
    a.textContent = text
    return a
  }

  const wrap = (...children) => {
    const div = document.createElement('div')
    for (const c of children) div.appendChild(c)
    return div
  }

  it('emits shorthand [text] when there are no other anchors', () => {
    const root = wrap(makeA('https://foo.example.com', 'foo'))
    const out = htmlToMd(root)
    expect(out).toContain('[foo]')
    expect(out).toContain('[foo]: https://foo.example.com')
  })

  it('appends no ref section when there are no anchors', () => {
    const root = document.createElement('p')
    root.textContent = 'plain text'
    const out = htmlToMd(root)
    expect(out).not.toContain('[')
    expect(out).not.toContain(':')
  })

  it('reuses label for same URL, emits [text][label] for second anchor', () => {
    const root = wrap(
      makeA('https://foo.example.com', 'foo'),
      makeA('https://foo.example.com', 'bar'),
    )
    const out = htmlToMd(root)
    expect(out).toContain('[foo]')
    expect(out).toContain('[bar][foo]')
    // Only one definition for the shared URL
    expect(out.match(/\[foo\]: https:\/\/foo\.example\.com/g)).toHaveLength(1)
  })

  it('creates separate definitions for distinct URLs', () => {
    const root = wrap(
      makeA('https://foo.example.com', 'foo'),
      makeA('https://bar.example.com', 'bar'),
    )
    const out = htmlToMd(root)
    expect(out).toContain('[foo]: https://foo.example.com')
    expect(out).toContain('[bar]: https://bar.example.com')
  })

  it('resolves label collision (same text, different URL) with -2 suffix', () => {
    const root = wrap(
      makeA('https://foo.example.com', 'foo'),
      makeA('https://other.example.com', 'foo'),
    )
    const out = htmlToMd(root)
    expect(out).toContain('[foo]: https://foo.example.com')
    expect(out).toContain('[foo-2]: https://other.example.com')
    expect(out).toContain('[foo][foo-2]')
  })

  it('increments suffix until unique for repeated collision', () => {
    const root = wrap(
      makeA('https://a.example.com', 'x'),
      makeA('https://b.example.com', 'x'),
      makeA('https://c.example.com', 'x'),
    )
    const out = htmlToMd(root)
    expect(out).toContain('[x]: https://a.example.com')
    expect(out).toContain('[x-2]: https://b.example.com')
    expect(out).toContain('[x-3]: https://c.example.com')
  })

  it('renders empty href as inline [text]() without adding a ref', () => {
    const root = wrap(makeA('', 'nothing'))
    const out = htmlToMd(root)
    expect(out).toContain('[nothing]()')
    expect(out).not.toContain('[nothing]:')
  })

  it('collects refs from anchors nested inside paragraphs', () => {
    const p = document.createElement('p')
    p.appendChild(makeA('https://foo.example.com', 'foo'))
    const root = wrap(p)
    const out = htmlToMd(root)
    expect(out).toContain('[foo]')
    expect(out).toContain('[foo]: https://foo.example.com')
  })
})

// ─── htmlToMd — footnotes ─────────────────────────────────────────────────────

describe('htmlToMd — footnotes', () => {
  const fromHtml = (html) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div
  }

  it('converts footnote-ref <sup> to [^N]', () => {
    const div = fromHtml('<p>Hello<sup class="footnote-ref"><a href="#fn1" id="fnref1">[1]</a></sup></p>')
    expect(htmlToMd(div)).toContain('[^1]')
  })

  it('suppresses <hr class="footnotes-sep">', () => {
    const hr = document.createElement('hr')
    hr.className = 'footnotes-sep'
    expect(htmlToMd(hr)).toBe('')
  })

  it('still emits --- for regular <hr>', () => {
    const hr = document.createElement('hr')
    expect(htmlToMd(hr)).toBe('---\n\n')
  })

  it('passes through regular <sup> as outerHTML', () => {
    const sup = document.createElement('sup')
    sup.textContent = '2'
    expect(htmlToMd(sup)).toBe('<sup>2</sup>')
  })

  it('converts footnote section to [^N]: definition', () => {
    const div = fromHtml(`
      <section class="footnotes">
        <ol class="footnotes-list">
          <li id="fn1" class="footnote-item">
            <p>Short note. <a href="#fnref1" class="footnote-backref">↩︎</a></p>
          </li>
        </ol>
      </section>`)
    const out = htmlToMd(div)
    expect(out).toContain('[^1]: Short note.')
    expect(out).not.toContain('↩')
  })

  it('handles multi-paragraph footnote with indented continuation', () => {
    const div = fromHtml(`
      <section class="footnotes">
        <ol class="footnotes-list">
          <li id="fn2" class="footnote-item">
            <p>First.</p>
            <p>Continued. <a href="#fnref2" class="footnote-backref">↩︎</a></p>
          </li>
        </ol>
      </section>`)
    const out = htmlToMd(div)
    expect(out).toContain('[^2]: First.')
    expect(out).toContain('    Continued.')
  })

  it('suppresses footnote-backref link', () => {
    const a = document.createElement('a')
    a.className = 'footnote-backref'
    a.textContent = '↩︎'
    expect(htmlToMd(a)).toBe('')
  })

  it('full tree: ref in body + definitions in section', () => {
    const div = fromHtml(`
      <p>Hello<sup class="footnote-ref"><a href="#fn1" id="fnref1">[1]</a></sup></p>
      <hr class="footnotes-sep">
      <section class="footnotes">
        <ol class="footnotes-list">
          <li id="fn1" class="footnote-item">
            <p>Footnote text. <a href="#fnref1" class="footnote-backref">↩︎</a></p>
          </li>
        </ol>
      </section>`)
    const out = htmlToMd(div)
    expect(out).toContain('[^1]')
    expect(out).toContain('[^1]: Footnote text.')
    expect(out).not.toContain('↩')
    expect(out).not.toContain('footnotes-sep')
  })
})

// ─── assignMapId ──────────────────────────────────────────────────────────────

describe('assignMapId', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('derives id from use: renderer name', () => {
    const config = assignMapId({ use: 'Leaflet' })
    expect(config.id).toBe('Leaflet')
  })

  it('appends numeric suffix on collision', () => {
    const map = document.createElement('div')
    map.className = 'mapclay'
    map.id = 'Leaflet'
    document.body.appendChild(map)
    const config = assignMapId({ use: 'Leaflet' })
    expect(config.id).toBe('Leaflet-1')
  })

  it('increments suffix until unique', () => {
    for (const id of ['Leaflet', 'Leaflet-1', 'Leaflet-2']) {
      const map = document.createElement('div')
      map.className = 'mapclay'
      map.id = id
      document.body.appendChild(map)
    }
    const config = assignMapId({ use: 'Leaflet' })
    expect(config.id).toBe('Leaflet-3')
  })

  it('replaces spaces with underscores in explicit id', () => {
    const config = assignMapId({ id: 'my map', use: 'Leaflet' })
    expect(config.id).toBe('my_map')
  })

  it('uses unnamed-N when use: is absent', () => {
    const config = assignMapId({})
    expect(config.id).toMatch(/^unnamed-\d+$/)
  })
})
