import { createGeoLink } from './dumbymap';

class Item {
  constructor({ text, innerHTML, onclick }) {
    this.text = text;
    this.innerHTML = innerHTML;
    this.onclick = onclick;
  }

  get element() {
    const element = document.createElement('div');
    element.innerHTML = this.innerHTML ? this.innerHTML : this.text;
    element.classList.add('menu-item');
    element.onclick = this.onclick;
    return element;
  }
}

class Folder {
  constructor({ text, innerHTML, items }) {
    this.text = text;
    this.innerHTML = innerHTML;
    this.items = items;
    this.utils;
  }

  get element() {
    const element = document.createElement('div');
    element.classList.add(this.className);
    element.className = 'menu-item folder';
    element.innerHTML = this.innerHTML;
    element.style.cssText = 'position: relative; overflow: visible;';
    element.onmouseover = () => {
      if (element.querySelector('.sub-menu')) return;
      // Prepare submenu
      this.submenu = document.createElement('div');
      this.submenu.className = 'sub-menu';
      this.submenu.style.cssText = `position: absolute; left: 105%; top: 0px;`;
      this.items.forEach(item => this.submenu.appendChild(item));

      // hover effect
      element.parentElement
        .querySelectorAll('.sub-menu')
        .forEach(sub => sub.remove());
      element.appendChild(this.submenu);
    };
    return element;
  }
}

export const pickMapItem = dumbymap =>
  new Folder({
    innerHTML: '<span>Focus a Map<span><span class="info">(Tab)</span>',
    items: dumbymap.utils.renderedMaps().map(
      map =>
        new Item({
          text: map.id,
          onclick: () => map.classList.add('focus'),
        }).element,
    ),
  }).element;

export const pickBlockItem = dumbymap =>
  new Folder({
    innerHTML: '<span>Focus Block<span><span class="info">(n/p)</span>',
    items: dumbymap.blocks.map(
      (block, index) =>
        new Item({
          text: `Block ${index}`,
          onclick: () => block.classList.add('focus'),
        }).element,
    ),
  }).element;

export const pickLayoutItem = dumbymap =>
  new Folder({
    innerHTML: '<span>Switch Layout<span><span class="info">(x)</span>',
    items: [
      new Item({
        text: 'EDIT',
        onclick: () => document.body.setAttribute('data-mode', 'editing'),
      }).element,
      ...dumbymap.layouts.map(
        layout =>
          new Item({
            text: layout.name,
            onclick: () =>
              dumbymap.container.setAttribute('data-layout', layout.name),
          }).element,
      ),
    ],
  }).element;

export class GeoLink {
  constructor({ range }) {
    this.range = range;
  }

  createElement = () => {
    const element = document.createElement('div');
    element.className = 'menu-item';
    element.innerText = 'Add GeoLink';
    element.onclick = this.addGeoLinkbyRange;

    return element;
  };

  addGeoLinkbyRange = () => {
    const range = this.range;
    const content = range.toString();
    // FIXME Apply geolink only on matching sub-range
    const match = content.match(/(^\D*[\d.]+)\D+([\d.]+)\D*$/);
    if (!match) return false;

    const [x, y] = match.slice(1);
    const anchor = document.createElement('a');
    anchor.textContent = content;
    // FIXME apply WGS84
    anchor.href = `geo:${y},${x}?xy=${x},${y}`;

    if (createGeoLink(anchor)) {
      range.deleteContents();
      range.insertNode(anchor);
    }
  };
}
export class Suggestion {
  constructor({ text, replace }) {
    this.text = text;
    this.replace = replace;
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
      Array.from(option.parentElement?.children ?? []).forEach(s =>
        s.classList.remove('focus'),
      );
      option.classList.add('focus');
    };
    option.onmouseout = () => {
      option.classList.remove('focus');
    };
    option.onclick = () => {
      const anchor = codemirror.getCursor();
      codemirror.setSelection(anchor, { ...anchor, ch: 0 });
      codemirror.replaceSelection(this.replace);
      codemirror.focus();
      const newAnchor = { ...anchor, ch: this.replace.length };
      codemirror.setCursor(newAnchor);
    };

    return option;
  }
}
