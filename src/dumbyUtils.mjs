export function focusNextMap(reverse = false) {
  const renderedList = this.utils.renderedMaps();
  const index = renderedList.findIndex(e => e.classList.contains('focus'));
  const nextIndex =
    index === -1 ? 0 : (index + (reverse ? -1 : 1)) % renderedList.length;

  const nextMap = renderedList.at(nextIndex);
  nextMap.classList.add('focus');
}

export function focusNextBlock(reverse = false) {
  const blocks = this.blocks.filter(b =>
    b.checkVisibility({
      contentVisibilityAuto: true,
      opacityProperty: true,
      visibilityProperty: true,
    }),
  );
  const index = blocks.findIndex(e => e.classList.contains('focus'));
  const nextIndex =
    index === -1 ? 0 : (index + (reverse ? -1 : 1)) % blocks.length;

  const nextBlock = blocks.at(nextIndex);
  blocks.forEach(b => b.classList.remove('focus'));
  nextBlock?.classList?.add('focus');
  scrollToBlock(nextBlock);
}

// Consider block is bigger then viewport height
export const scrollToBlock = block => {
  const parentRect = block.parentElement.getBoundingClientRect();
  const scrollBlock =
    block.getBoundingClientRect().height > parentRect.height * 0.8
      ? 'nearest'
      : 'center';
  block.scrollIntoView({ behavior: 'smooth', block: scrollBlock });
};

export function focusDelay() {
  return window.getComputedStyle(this.showcase).display === 'none' ? 50 : 300;
}

export function switchToNextLayout(reverse = false) {
  const layouts = this.layouts;
  const currentLayoutName = this.container.getAttribute('data-layout');
  const currentIndex = layouts.map(l => l.name).indexOf(currentLayoutName);
  const padding = reverse ? -1 : 1;
  const nextIndex =
    currentIndex === -1
      ? 0
      : (currentIndex + padding + layouts.length) % layouts.length;
  const nextLayout = layouts[nextIndex];
  this.container.setAttribute('data-layout', nextLayout.name);
}

export function removeBlockFocus() {
  this.blocks.forEach(b => b.classList.remove('focus'));
}
