export function focusNextMap(reverse = false) {
  const renderedList = Array.from(
    this.htmlHolder.querySelectorAll('[data-render=fulfilled]'),
  );
  const mapNum = renderedList.length;
  if (mapNum === 0) return;

  // Get current focused map element
  const currentFocus = this.container.querySelector('.mapclay.focus');

  // Remove class name of focus for ALL candidates
  // This may trigger animation
  renderedList.forEach(ele => ele.classList.remove('focus'));

  // Get next existing map element
  const padding = reverse ? -1 : 1;
  let nextIndex = currentFocus
    ? renderedList.indexOf(currentFocus) + padding
    : 0;
  nextIndex = (nextIndex + mapNum) % mapNum;
  const nextFocus = renderedList[nextIndex];
  nextFocus.classList.add('focus');

  return nextFocus;
}

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

export function focusNextBlock(reverse = false) {
  const blocks = this.blocks.filter(b =>
    b.checkVisibility({
      contentVisibilityAuto: true,
      opacityProperty: true,
      visibilityProperty: true,
    }),
  );
  const currentBlock = blocks.find(b => b.classList.contains('focus'));
  const currentIndex = blocks.indexOf(currentBlock);
  const padding = reverse ? -1 : 1;
  const nextIndex =
    currentIndex === -1
      ? 0
      : (currentIndex + padding + blocks.length) % blocks.length;
  const nextBlock = blocks[nextIndex];
  blocks.forEach(b => b.classList.remove('focus'));
  nextBlock?.classList?.add('focus');
  const scrollBlock =
    nextBlock.getBoundingClientRect().height >
    nextBlock.parentElement.getBoundingClientRect().height * 0.8
      ? 'nearest'
      : 'center';
  nextBlock.scrollIntoView({ behavior: 'smooth', block: scrollBlock });
}

export function removeBlockFocus() {
  this.blocks.forEach(b => b.classList.remove('focus'));
}
