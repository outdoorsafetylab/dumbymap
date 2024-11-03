## Setting up development environment

### Installing dependencies

The minimum requirements are:
- GNU Bash
- [GNU Coreutils](https://www.gnu.org/software/coreutils/)
- Git
- Node.js (version 16 and above)

To install the project dependencies run

```sh
# install dependencies
npm install

# install rollup or use npx
npm install -g rollup standard
```


## Style guidelines

We use [StandardJS](https://standardjs.com/) with pre-defined ESLint rules to ensure a consistent coding style and catch potential bugs. For checking lint, run

```
npm run lint
```


## Linking Package

```sh
# without code minified
npm build

# with code minified
PRODUCTION=true npm build
```

## Firefox Addon

1. To build addon(after `dist/` is generated from `npm build`), run

```sh
npm run addon
```

2. Then go to `about:debugging` page in Firfox Browser, then press `This Firefox` for extension page

3. Press `Load Temporary Add-on...`, then select `manifest.json` in `addon/`
