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
      Array.from(menu.children).forEach(s => s.classList.remove('focus'))
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
