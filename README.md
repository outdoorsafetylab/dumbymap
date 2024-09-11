# Dumbymap

This library generate web maps from Semantic HTML, see [demo page](https://outdoorsafetylab.github.io/dumbymap/)

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

## TODOs

- Editor
  - Better way to edit table in markdown
  - `Ctrl-z` to resume last modificatioo
  - Reduce fontawesome resources
- Add favicon

