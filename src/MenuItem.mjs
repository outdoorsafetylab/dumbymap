class Item extends HTMLDivElement {
  constructor({ text, innerHTML, onclick, style }) {
    super();
    this.innerHTML = innerHTML ?? text;
    this.onclick = onclick;
    this.classList.add('menu-item');
    this.style.cssText = style;

    this.onmouseover = () => {
      this.parentElement
        .querySelectorAll('.sub-menu')
        .forEach(sub => sub.remove());
    }
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

export const pickMapItem = ({ utils }) =>
  new Folder({
    innerHTML: '<span>Maps<span><span class="info">(Tab)</span>',
    items: utils.renderedMaps().map(
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

export const pickBlockItem = ({ blocks, utils }) =>
  new Folder({
    innerHTML: '<span>Blocks<span><span class="info">(n/p)</span>',
    items: blocks.map(
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
            utils.scrollToBlock(block);
          },
        }),
    ),
  });

export const pickLayoutItem = ({ container, layouts }) =>
  new Folder({
    innerHTML: '<span>Layouts<span><span class="info">(x)</span>',
    items: [
      new Item({
        text: 'EDIT',
        onclick: () =>
          container.closest('[data-mode]').setAttribute('data-mode', 'editing'),
      }),
      ...layouts.map(
        layout =>
          new Item({
            text: layout.name,
            onclick: () => container.setAttribute('data-layout', layout.name),
          }),
      ),
      new Item({
        innerHTML: '<a href="https://github.com/outdoorsafetylab/dumbymap#layouts" style="display: block; padding: 0.5rem;">More...</a>',
        style: 'padding: 0;'
      }),
    ],
  });

export const addGeoLink = ({ utils }, range) =>
  new Item({
    text: 'Add GeoLink',
    onclick: () => {
      const content = range.toString();
      // FIXME Apply geolink only on matching sub-range
      const match = content.match(/(^\D*[\d.]+)\D+([\d.]+)\D*$/);
      if (!match) return false;

      const [x, y] = match.slice(1);
      const anchor = document.createElement('a');
      anchor.textContent = content;
      // FIXME apply WGS84
      anchor.href = `geo:${y},${x}?xy=${x},${y}`;

      // FIXME
      if (utils.createGeoLink(anchor)) {
        range.deleteContents();
        range.insertNode(anchor);
      }
    },
  });

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

export const renderResults = ({ modal, modalContent }, map) =>
  new Item({
    text: 'Render Results',
    onclick: () => {
      modal.open();
      modal.overlayBlur = 3;
      modal.closeByEscKey = false;
      // HACK find another way to override inline style
      document.querySelector('.plainmodal-overlay-force').style.position =
        'relative';

      modalContent.innerHTML = '';
      const sourceCode = document.createElement('div')
      sourceCode.innerHTML = `<a href="${map.renderer.url ?? map.renderer.use}">Source Code</a>`
      modalContent.appendChild(sourceCode)
      const printDetails = result => {
        const funcBody = result.func.toString();
        const loc = funcBody.split('\n').length;
        const color =
          {
            success: 'green',
            fail: 'red',
            skip: 'black',
            stop: 'yellow',
          }[result.state] ?? 'black';
        printObject(
          result,
          modalContent,
          `${result.func.name} <span style='float: right;'>${loc}LOC\x20\x20\x20<span style='display: inline-block; width: 100px; color: ${color};'>${result.state}</span></span>`,
        );
      };

      // Add contents about prepare steps
      const prepareHeading = document.createElement('h3');
      prepareHeading.textContent = 'Prepare Steps';
      modalContent.appendChild(prepareHeading);
      const prepareSteps = map.renderer.results.filter(
        r => r.type === 'prepare',
      );
      prepareSteps.forEach(printDetails);

      // Add contents about render steps
      const renderHeading = document.createElement('h3');
      renderHeading.textContent = 'Render Steps';
      modalContent.appendChild(renderHeading);
      const renderSteps = map.renderer.results.filter(r => r.type === 'render');
      renderSteps.forEach(printDetails);
    },
  });

function printObject(obj, parentElement, name = null) {
  // Create <details> and <summary> inside
  const detailsEle = document.createElement('details');
  const details = name ?? (obj instanceof Error ? obj.name : Object.values(obj)[0]);
  detailsEle.innerHTML = `<summary>${details}</summary>`;
  parentElement.appendChild(detailsEle);

  detailsEle.onclick = () => {
    // Don't add items if it has contents
    if (detailsEle.querySelector(':scope > :not(summary)')) return;

    if (obj instanceof Error) {
      // Handle Error objects specially
      const errorProps = ['name', 'message', 'stack', ...Object.keys(obj)];
      errorProps.forEach(key => {
        const value = obj[key];
        const valueString = key === 'stack' ? `<pre>${value}</pre>` : value;
        const propertyElement = document.createElement('p');
        propertyElement.innerHTML = `<strong>${key}</strong>: ${valueString}`;
        detailsEle.appendChild(propertyElement);
      });
    } else {
      // Handle regular objects
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          printObject(value, detailsEle, key);
        } else {
          const valueString =
            typeof value === 'function'
              ? `<pre>${value}</pre>`
              : value ?? typeof value;
          const propertyElement = document.createElement('p');
          propertyElement.innerHTML = `<strong>${key}</strong>: ${valueString}`;
          detailsEle.appendChild(propertyElement);
        }
      });
    }
  };
}

export const toggleBlockFocus = block =>
  new Item({
    text: 'Toggle Focus',
    onclick: () => block.classList.toggle('focus'),
  });

export const toggleMapFocus = map =>
  new Item({
    text: 'Toggle Focus',
    onclick: () => map.classList.toggle('focus'),
  });
