import * as utils from './utils.mjs';

export default function patterns(options) {
  const __hr = new RegExp('^ {0,3}[-*_]{3,} ?'
                          + utils.escapeRegExp(options.leftDelimiter)
                          + '[^' + utils.escapeRegExp(options.rightDelimiter) + ']');

  return ([
    {
      name: 'fenced code blocks',
      tests: [
        {
          shift: 0,
          block: true,
          info: utils.hasDelimiters('end', options)
        }
      ],
      transform: (tokens, i) => {
        const token = tokens[i];
        const start = token.info.lastIndexOf(options.leftDelimiter);
        const attrs = utils.getAttrs(token.info, start, options);
        utils.addAttrs(attrs, token);
        token.info = utils.removeDelimiter(token.info, options);
      }
    }, {
      name: 'inline nesting 0',
      tests: [
        {
          shift: 0,
          type: 'inline',
          children: [
            {
              shift: -1,
              type: (str) => str === 'image' || str === 'code_inline'
            }, {
              shift: 0,
              type: 'text',
              content: utils.hasDelimiters('start', options)
            }
          ]
        }
      ],
      transform: (tokens, i, j) => {
        const token = tokens[i].children[j];
        const endChar = token.content.indexOf(options.rightDelimiter);
        const attrToken = tokens[i].children[j - 1];
        const attrs = utils.getAttrs(token.content, 0, options);
        utils.addAttrs(attrs, attrToken);
        if (token.content.length === (endChar + options.rightDelimiter.length)) {
          tokens[i].children.splice(j, 1);
        } else {
          token.content = token.content.slice(endChar + options.rightDelimiter.length);
        }
      }
    }, {
      name: 'tables',
      tests: [
        {
          shift: 0,
          type: 'table_close'
        }, {
          shift: 1,
          type: 'paragraph_open'
        }, {
          shift: 2,
          type: 'inline',
          content: utils.hasDelimiters('only', options)
        }
      ],
      transform: (tokens, i) => {
        const token = tokens[i + 2];
        const tableOpen = utils.getMatchingOpeningToken(tokens, i);
        const attrs = utils.getAttrs(token.content, 0, options);
        utils.addAttrs(attrs, tableOpen);
        tokens.splice(i + 1, 3);
      }
    }, {
      name: 'tables thead metadata',
      tests: [
        {
          shift: 0,
          type: 'tr_close',
        }, {
          shift: 1,
          type: 'thead_close'
        }, {
          shift: 2,
          type: 'tbody_open'
        }
      ],
      transform: (tokens, i) => {
        const tr = utils.getMatchingOpeningToken(tokens, i);
        const th = tokens[i - 1];
        let colsnum = 0;
        let n = i;
        while (--n) {
          if (tokens[n] === tr) {
            tokens[n - 1].meta = Object.assign({}, tokens[n + 2].meta, { colsnum });
            break;
          }
          colsnum += (tokens[n].level === th.level && tokens[n].type === th.type) >> 0;
        }
        tokens[i + 2].meta = Object.assign({}, tokens[i + 2].meta, { colsnum });
      }
    }, {
      name: 'tables tbody calculate',
      tests: [
        {
          shift: 0,
          type: 'tbody_close',
          hidden: false
        }
      ],
      transform: (tokens, i) => {
        let idx = i - 2;
        while (idx > 0 && 'tbody_open' !== tokens[--idx].type);

        const calc = tokens[idx].meta.colsnum >> 0;
        if (calc < 2) { return; }

        const level = tokens[i].level + 2;
        for (let n = idx; n < i; n++) {
          if (tokens[n].level > level) { continue; }

          const token = tokens[n];
          const rows = token.hidden ? 0 : token.attrGet('rowspan') >> 0;
          const cols = token.hidden ? 0 : token.attrGet('colspan') >> 0;

          if (rows > 1) {
            let colsnum = calc - (cols > 0 ? cols : 1);
            for (let k = n, num = rows; k < i, num > 1; k++) {
              if ('tr_open' == tokens[k].type) {
                tokens[k].meta = Object.assign({}, tokens[k].meta);
                if (tokens[k].meta && tokens[k].meta.colsnum) {
                  colsnum -= 1;
                }
                tokens[k].meta.colsnum = colsnum;
                num--;
              }
            }
          }

          if ('tr_open' == token.type && token.meta && token.meta.colsnum) {
            const max = token.meta.colsnum;
            for (let k = n, num = 0; k < i; k++) {
              if ('td_open' == tokens[k].type) {
                num += 1;
              } else if ('tr_close' == tokens[k].type) {
                break;
              }
              num > max && (tokens[k].hidden || hidden(tokens[k]));
            }
          }

          if (cols > 1) {
            const one = [];
            let end = n + 3;
            let num = calc;

            for (let k = n; k > idx; k--) {
              if ('tr_open' == tokens[k].type) {
                num = tokens[k].meta && tokens[k].meta.colsnum || num;
                break;
              } else if ('td_open' === tokens[k].type) {
                one.unshift(k);
              }
            }

            for (let k = n + 2; k < i; k++) {
              if ('tr_close' == tokens[k].type) {
                end = k;
                break;
              } else if ('td_open' == tokens[k].type) {
                one.push(k);
              }
            }

            const off = one.indexOf(n);
            let real = num - off;
            real = real > cols ? cols : real;
            cols > real && token.attrSet('colspan', real + '');

            for (let k = one.slice(num + 1 - calc - real)[0]; k < end; k++) {
              tokens[k].hidden || hidden(tokens[k]);
            }
          }
        }
      }
    }, {
      name: 'inline attributes',
      tests: [
        {
          shift: 0,
          type: 'inline',
          children: [
            {
              shift: -1,
              nesting: -1
            }, {
              shift: 0,
              type: 'text',
              content: utils.hasDelimiters('start', options)
            }
          ]
        }
      ],
      transform: (tokens, i, j) => {
        const token = tokens[i].children[j];
        const content = token.content;
        const attrs = utils.getAttrs(content, 0, options);
        const openingToken = utils.getMatchingOpeningToken(tokens[i].children, j - 1);
        utils.addAttrs(attrs, openingToken);
        token.content = content.slice(content.indexOf(options.rightDelimiter) + options.rightDelimiter.length);
      }
    }, {
      name: 'list softbreak',
      tests: [
        {
          shift: -2,
          type: 'list_item_open'
        }, {
          shift: 0,
          type: 'inline',
          children: [
            {
              position: -2,
              type: 'softbreak'
            }, {
              position: -1,
              type: 'text',
              content: utils.hasDelimiters('only', options)
            }
          ]
        }
      ],
      transform: (tokens, i, j) => {
        const token = tokens[i].children[j];
        const content = token.content;
        const attrs = utils.getAttrs(content, 0, options);
        let ii = i - 2;
        while (tokens[ii - 1] &&
          tokens[ii - 1].type !== 'ordered_list_open' &&
          tokens[ii - 1].type !== 'bullet_list_open') { ii--; }
        utils.addAttrs(attrs, tokens[ii - 1]);
        tokens[i].children = tokens[i].children.slice(0, -2);
      }
    }, {
      name: 'list double softbreak',
      tests: [
        {
          shift: 0,
          type: (str) =>
            str === 'bullet_list_close' ||
            str === 'ordered_list_close'
        }, {
          shift: 1,
          type: 'paragraph_open'
        }, {
          shift: 2,
          type: 'inline',
          content: utils.hasDelimiters('only', options),
          children: (arr) => arr.length === 1
        }, {
          shift: 3,
          type: 'paragraph_close'
        }
      ],
      transform: (tokens, i) => {
        const token = tokens[i + 2];
        const content = token.content;
        const attrs = utils.getAttrs(content, 0, options);
        const openingToken = utils.getMatchingOpeningToken(tokens, i);
        utils.addAttrs(attrs, openingToken);
        tokens.splice(i + 1, 3);
      }
    }, {
      name: 'list item end',
      tests: [
        {
          shift: -2,
          type: 'list_item_open'
        }, {
          shift: 0,
          type: 'inline',
          children: [
            {
              position: -1,
              type: 'text',
              content: utils.hasDelimiters('end', options)
            }
          ]
        }
      ],
      transform: (tokens, i, j) => {
        const token = tokens[i].children[j];
        const content = token.content;
        const attrs = utils.getAttrs(content, content.lastIndexOf(options.leftDelimiter), options);
        utils.addAttrs(attrs, tokens[i - 2]);
        const trimmed = content.slice(0, content.lastIndexOf(options.leftDelimiter));
        token.content = last(trimmed) !== ' ' ?
          trimmed : trimmed.slice(0, -1);
      }
    }, {
      name: '\n{.a} softbreak then curly in start',
      tests: [
        {
          shift: 0,
          type: 'inline',
          children: [
            {
              position: -2,
              type: 'softbreak'
            }, {
              position: -1,
              type: 'text',
              content: utils.hasDelimiters('only', options)
            }
          ]
        }
      ],
      transform: (tokens, i, j) => {
        const token = tokens[i].children[j];
        const attrs = utils.getAttrs(token.content, 0, options);
        let ii = i + 1;
        while (tokens[ii + 1] && tokens[ii + 1].nesting === -1) { ii++; }
        const openingToken = utils.getMatchingOpeningToken(tokens, ii);
        utils.addAttrs(attrs, openingToken);
        tokens[i].children = tokens[i].children.slice(0, -2);
      }
    }, {
      name: 'horizontal rule',
      tests: [
        {
          shift: 0,
          type: 'paragraph_open'
        },
        {
          shift: 1,
          type: 'inline',
          children: (arr) => arr.length === 1,
          content: (str) => str.match(__hr) !== null,
        },
        {
          shift: 2,
          type: 'paragraph_close'
        }
      ],
      transform: (tokens, i) => {
        const token = tokens[i];
        token.type = 'hr';
        token.tag = 'hr';
        token.nesting = 0;
        const content = tokens[i + 1].content;
        const start = content.lastIndexOf(options.leftDelimiter);
        const attrs = utils.getAttrs(content, start, options);
        utils.addAttrs(attrs, token);
        token.markup = content;
        tokens.splice(i + 1, 2);
      }
    }, {
      name: 'end of block',
      tests: [
        {
          shift: 0,
          type: 'inline',
          children: [
            {
              position: -1,
              content: utils.hasDelimiters('end', options),
              type: (t) => t !== 'code_inline' && t !== 'math_inline'
            }
          ]
        }
      ],
      transform: (tokens, i, j) => {
        const token = tokens[i].children[j];
        const content = token.content;
        const attrs = utils.getAttrs(content, content.lastIndexOf(options.leftDelimiter), options);
        let ii = i + 1;
        do if (tokens[ii] && tokens[ii].nesting === -1) { break; } while (ii++ < tokens.length);
        const openingToken = utils.getMatchingOpeningToken(tokens, ii);
        utils.addAttrs(attrs, openingToken);
        const trimmed = content.slice(0, content.lastIndexOf(options.leftDelimiter));
        token.content = last(trimmed) !== ' ' ?
          trimmed : trimmed.slice(0, -1);
      }
    }
  ]);
}

function last(arr) {
  return arr.slice(-1)[0];
}

function hidden(token) {
  token.hidden = true;
  token.children && token.children.forEach(t => (
    t.content = '',
    hidden(t),
    undefined
  ));
}
