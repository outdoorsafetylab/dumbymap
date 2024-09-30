import { createGeoLink } from './dumbymap';
import { scrollToBlock } from './dumbyUtils';

class Item extends HTMLDivElement {
  constructor({ text, innerHTML, onclick }) {
    super();
    this.innerHTML = innerHTML ?? text;
    this.onclick = onclick;
    this.classList.add('menu-item');
  }
}
window.customElements.define('menu-item', Item, { extends: 'div' });

class Folder extends HTMLDivElement {
  constructor({ text, innerHTML, items }) {
    super();
    this.innerHTML = innerHTML ?? text;
    this.classList.add('folder', 'menu-item');
    this.items = items;
    this.onmouseover = () => {
      if (this.querySelector('.sub-menu')) return;
      // Prepare submenu
      const submenu = document.createElement('div');
      submenu.className = 'sub-menu';
      submenu.style.cssText = `position: absolute; left: 105%; top: 0px;`;
      this.items.forEach(item => submenu.appendChild(item));

      // hover effect
      this.parentElement
        .querySelectorAll('.sub-menu')
        .forEach(sub => sub.remove());
      this.appendChild(submenu);
    };
  }
}
window.customElements.define('menu-folder', Folder, { extends: 'div' });

export const pickMapItem = dumbymap =>
  new Folder({
    innerHTML: '<span>Maps<span><span class="info">(Tab)</span>',
    items: dumbymap.utils.renderedMaps().map(
      map =>
        new Item({
          text: map.id,
          onclick: () => {
            map.classList.add('focus');
            map.scrollIntoView({ behavior: 'smooth' });
          },
        }),
    ),
  });

export const pickBlockItem = dumbymap =>
  new Folder({
    innerHTML: '<span>Blocks<span><span class="info">(n/p)</span>',
    items: dumbymap.blocks.map(
      (block, index) =>
        new Item({
          text:
            `<strong>(${index})</strong>` +
            block
              .querySelector('p')
              ?.textContent.substring(0, 15)
              .concat(' ...'),
          onclick: () => {
            block.classList.add('focus');
            scrollToBlock(block);
          },
        }),
    ),
  });

export const pickLayoutItem = dumbymap =>
  new Folder({
    innerHTML: '<span>Layouts<span><span class="info">(x)</span>',
    items: [
      new Item({
        text: 'EDIT',
        onclick: () =>
          dumbymap.container
            .closest('[data-mode]')
            .setAttribute('data-mode', 'editing'),
      }),
      ...dumbymap.layouts.map(
        layout =>
          new Item({
            text: layout.name,
            onclick: () =>
              dumbymap.container.setAttribute('data-layout', layout.name),
          }),
      ),
    ],
  });

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
      Array.from(option.parentElement?.children)?.forEach(s =>
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

export const renderResults = (dumbymap, map) =>
  new Item({
    text: 'Render Results',
    onclick: e => {
      const modal = dumbymap.modal;
      modal.open();
      modal.overlayBlur = 3;
      modal.closeByEscKey = false;
      // HACK find another way to override inline style
      document.querySelector('.plainmodal-overlay-force').style.position =
        'static';
      console.log(map.renderer.results)
    },
  });
