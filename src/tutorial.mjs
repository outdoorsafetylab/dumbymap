export const md = `<!-- banner -->
> <big><br>Hello My Friend! This is DumbyMap!<br><br></big>

\`\`\`map
use: Maplibre
height: 120px
style: https://tile.openstreetmap.jp/styles/openmaptiles/style.json
\`\`\`


DumbyMap generates **interactive document with maps** from raw texts.

You can use it to:

1. [Roll a Dice] for a new map
2. Hover on [GeoLink][example-geolink] to show point in maps.
3. Add GeoLink by dragging **selected text**
4. Change contents by [Editor] with [Markdown] text
5. **Right click** to call context menu, you can:
    + Change focus between maps
    + Select a block for browsing
    + Switch layouts for various use cases


If you want know more, take a look at subjects below:
1. [How to write Markdown text?][Markdown]
1. <details>
      <summary>How to add GeoLink in Markdown</summary>

      The following formats are valid for GeoLink:
      1. Surround coordinated with parenthesis: \`(<x>, <y>)\` or \`(<x>/<y>)\`
         For example: (121,23)
      2. Have leading \`@\` symbol: \`@<x>,<y>\` or \`@<x>/<y>\`
         For example: @121/23
      3. Use geo URI scheme: \`geo:<lat>,<lon>\`
         For example: geo:23,121
   </details>
1. <details>
      <summary>How can I save contents for next use?</summary>

      Since All contents come from raw texts, you can:
      1. Save current page as bookmark by [hash button](#create-hash "=>.mde-hash")
      2. Copy texts in editor and save as \`.txt\` file
      3. Use online service for hosting Markdown, for example: [HackMD](https://hackmd.io)
   </details>
1. <details>
      <summary>I want more features in map!</summary>

      DumbyMap use [mapclay](https://github.com/outdoorsafetylab/mapclay) to render maps.
      1. You can use \`eval\` options to add custom scripts, see [tutorial](https://github.com/outdoorsafetylab/mapclay?tab=readme-ov-file#run-scripts-after-map-is-created) for more details
      2. You can use custom Renderer indtead of default ones, see [tutorial](https://github.com/outdoorsafetylab/mapclay?tab=readme-ov-file#renderer) for more details
   </details>
1. [I am an experienced developer, show me what you got!][dumbymap]


<!-- footer -->
> <big><br>Have Fun ~<br><br></big>

[Roll a Dice]: #Click%20it! "=>.mde-roll"
[example-geolink]: geo:24,121?xy=121,24&text=Use%20yellow%20link%20point%20to%20map
[Markdown]: https://www.markdownguide.org/basic-syntax/
[Editor]: #This%20is%20editor! "=>.editor"
[dumbymap]: https://github.com/outdoorsafetylab/dumbymap`
