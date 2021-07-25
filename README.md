# Stack

This stack combines [React JSX](https://reactjs.org/docs/introducing-jsx.html) and [Custom Elements v1](https://developers.google.com/web/fundamentals/web-components/customelements). In order to render custom elements a new property `element` was introduced to HTMLDivElement.

```tsx
<div element="custom-element" className="additional-class"></div>
```

... compiles into ...

```html
<custom-element class="additional-class"></custom-element>
```

More modifications like global data or inline event support can be added to `/assets/js/dom.ts` and `/.node/render.tsx`.

## Requirements

- [node](https://nodejs.org/)

## Installation

```bash
yarn install
```

## Usage

###### Clean `out/` directory

```bash
yarn clean
```

###### Start local server

- Clean directory
- Render templates and watch for changes
- Start webpack server

```bash
yarn start
```

###### Render templates

- Check `ssr` config setting
- Render either **one** root `index.html` or **each page** as `index.html` and `body.html`
- Parameters
  - `--mode=[development|production]`
  - `--watch`

```bash
yarn render
```

###### Bundle files

- Clean directory
- Render templates
- Bundle JS, CSS, and assets

```bash
yarn build
```

###### Serve from `out/`

```bash
yarn serve:static # ssr enabled
yarn serve:dynamic # ssr disabled
```

###### Lint and fix files

```bash
yarn lint:js
yarn lint:css
```

###### Test anchors

```bash
yarn test:anchors
```

## Config Files

- `package.json`
- `config.json`
- `.env`
- `server/`

## TODOs

- [ ] SVG import as JSX Element

## License

MIT License

Copyright (c) 2020 BASIC®

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
