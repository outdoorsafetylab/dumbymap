# Dumbymap

This library generate web maps from Semantic HTML, play around with [demo page](https://outdoorsafetylab.github.io/dumbymap/)

## Getting Started

Node.js:

```bash
npm install dumbymap
```
```js
import { markdown2HTML, generateMaps } from 'dumbymap'

// Create container element
const container = document.createElement('div')
document.body.append(container)

// Convert markdown text into Semantic HTML
markdown2HTML(container, '# Heading\n\n```map\nid: foo\nuse: Maplibre\n```\n')

// Gernerate maps from code block
generateMaps(container)
```

browser (CDN):
- [unpkg](https://unpkg.com/dumbymap@0.1.1/dist/dumbymap.mjs)


## Depandencies

- [leader-line](https://anseki.github.io/leader-line/)
- [plain-draggable](https://anseki.github.io/plain-draggable/)
- [markdown-it](https://github.com/markdown-it/markdown-it/)
- [mapclay](https://github.com/outdoorsafetylab/mapclay)
- [EasyMDE](https://github.com/Ionaru/easy-markdown-editor)


## TODOs

- Semantic HTML
  - context menu for add geolinks
- Editor
  - Reduce fontawesome resources
  - Better way to edit table in markdown
- Add favicon
