import { createGeoLink } from './dumbymap'

export class GeoLink {

  constructor({ range }) {
    this.range = range
  }

  createElement = () => {
    const element = document.createElement('div')
    element.className = 'menu-item-add-geolink'
    element.innerText = "Add GeoLink"
    element.onclick = this.addGeoLinkbyRange

    return element
  }

  addGeoLinkbyRange = () => {
    const range = this.range
    const content = range.toString()
    // FIXME Apply geolink only on matching sub-range
    const match = content.match(/(^\D*[\d.]+)\D+([\d.]+)\D*$/)
    if (!match) return false

    const [x, y] = match.slice(1)
    const anchor = document.createElement('a')
    anchor.textContent = content
    // FIXME apply WGS84
    anchor.href = `geo:${y},${x}?xy=${x},${y}`

    if (createGeoLink(anchor)) {
      range.deleteContents()
      range.insertNode(anchor)
    }
  }
}
export class Suggestion {
  constructor({ text, replace }) {
    this.text = text
    this.replace = replace
  }

  createElement(codemirror) {
    const option = document.createElement('div');
    if (this.text.startsWith('<')) {
      option.innerHTML = this.text;
    } else {
      option.innerText = this.text;
    }
    option.classList.add('container__suggestion');
    option.onmouseover = () => {
      Array.from(option.parentElement?.children ?? [])
        .forEach(s => s.classList.remove('focus'))
      option.classList.add('focus')
    }
    option.onmouseout = () => {
      option.classList.remove('focus')
    }
    option.onclick = () => {
      const anchor = codemirror.getCursor()
      codemirror.setSelection(anchor, { ...anchor, ch: 0 })
      codemirror.replaceSelection(this.replace)
      codemirror.focus();
      const newAnchor = { ...anchor, ch: this.replace.length }
      codemirror.setCursor(newAnchor);
    };

    return option
  }
}
