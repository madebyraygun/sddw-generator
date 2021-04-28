// import swearjar from 'swearjar';

import TwentyTwentyOne from '../../../components/themes/twenty-twenty-one';

class Characters {

  config: {
    randomizeColors: boolean,
    randomizeEachWord: boolean,
    character: {
      variationsTotal: number,
    },
  } = {
    randomizeColors: false,
    randomizeEachWord: false,
    character: {
      variationsTotal: 3
    }
  };

  theme: TwentyTwentyOne;

  characters: {
    [character: string]: Array<{
      svg: SVGElement | null,
      paths: SVGPathElement[],
      dimension: number[]
    }>
  } = {};

  footers: {
    [footer: string]: Array<{
      svg: SVGElement | null,
      paths: SVGPathElement[],
      dimension: number[]
    }>
  } = {};

  value: Array<{
    character: string,
    special: boolean,
    index: number,
    colors: string[]
  }> = [];

  constructor() {
    try {
      this.#requireCharacters();
      this.#requirePosterFooters();
      this.theme = new TwentyTwentyOne();
    } catch (e) {
      // console.log(e);
    }
  }

  // load svgs

  #requireCharacters = () => {
    const required = require.context('../../vectors/characters/', true, /\.tsx$/);
    required.keys().map((path: string) => {
      const character = path.split('/')[1].toLowerCase();
      const { default: Character } = required(path);
      const svg = Character({});
      const paths = svg.querySelectorAll('path');
      const [,, width, height] = svg.getAttribute('viewBox').split(' ');
      const dimension = [parseFloat(width), parseFloat(height)];
      if (!this.characters[character]) this.characters[character] = [];
      this.characters[character].push({
        svg,
        paths,
        dimension
      });
    });
  }

  #requirePosterFooters = () => {
    const required = require.context('../../vectors/footers/', true, /\.tsx$/);
    required.keys().map((path: string) => {
      const footer = path.split('/')[1].toLowerCase();
      const { default: Footer } = required(path);
      const svg = Footer({});
      const paths = svg.querySelectorAll('path, rect, circle');
      const [,, width, height] = svg.getAttribute('viewBox').split(' ');
      const dimension = [parseFloat(width), parseFloat(height)];
      this.footers[footer] = {
        svg,
        paths,
        dimension
      };
    });
  }

  // update current configuration

  updateConfig = (config: { value: boolean }) => {
    const goodValues = {};

    for (const key in config) {
      console.log('config', key, config[key]);
    }

    // this.config = { ...this.config, ...goodValues };
  }

  // render phrases and characters

  nextCharacter(index: number, $container: HTMLElement | null, callback?: (value) => void) {
    this.changeCharacter(index, this.value[index].index + 1);

    if ($container) {
      this.renderPhrase($container);
    }

    if (callback) {
      callback({ ...this.value[index] });
    }
  }

  prevCharacter(index: number, $container: HTMLElement | null, callback?: (value) => void) {
    this.changeCharacter(index, this.value[index].index - 1);

    if ($container) {
      this.renderPhrase($container);
    }

    if (callback) {
      callback({ ...this.value[index] });
    }
  }

  shuffleCharacter(index: number, $container: HTMLElement | null, callback?: (value) => void) {
    let randomIndex = index;
    while (randomIndex === index) {
      randomIndex = Math.round(Math.random() * (this.config.character.variationsTotal - 1));
    }

    this.changeCharacter(index, randomIndex);

    if ($container) {
      this.renderPhrase($container);
    }

    if (callback) {
      callback({ ...this.value[index] });
    }
  }

  shufflePhrase($container: HTMLElement | null, callback?: (value) => void) {
    for (let i = 0; i < this.value.length; i++) {
      this.shuffleCharacter(i);
    }

    if ($container) {
      this.renderPhrase($container);
    }

    if (callback) {
      callback({ ...this.value });
    }
  }

  // utilities

  shuffleColors() {
    return [...this.theme.colors].sort(() => Math.random() - 0.5);
  }

  pxToRem(value: number) {
    return value / 10;
  }

  changeCharacter(characterIndex: number, nextIndex: number) {
    if (this.value[characterIndex] && !this.value[characterIndex].special) {
      let curCharacterIndex = nextIndex;

      if (curCharacterIndex >= this.config.character.variationsTotal) curCharacterIndex = 0;
      if (curCharacterIndex < 0) curCharacterIndex = this.config.character.variationsTotal - 1;

      this.value[characterIndex].index = curCharacterIndex;
      this.value[characterIndex].colors = this.shuffleColors();
    }
  }

  feed(value: string) {
    // if (swearjar.profane(value)) value = '';
    value.split('').map((character: string, index: number) => {
      if (this.characters[character]) {
        if (!this.value[index] || (this.value[index] && this.value[index].character !== character)) {
          const special = /^[&@#]+$/.test(character);
          this.value[index] = {
            character,
            special,
            index: special ? 0 : Math.round(Math.random() * (this.config.character.variationsTotal - 1)),
            colors: this.shuffleColors()
          };
        }
      }
    });
    this.value.length = value.length;
  }

  // render characters to container
  // TODO: separate characters from this class - make it a data object that can be passed

  renderPhrase($container: HTMLElement | null) {
    const figures = [];
    for (const character of this.value) {
      const data = this.characters[character.character][character.index];
      const [width, height] = data.dimension;
      const phraseHeight = 100;
      figures.push(
        <figure data-character style={{ width: `${this.pxToRem(width * (phraseHeight / height))}rem`, height: `${this.pxToRem(phraseHeight)}rem` }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`}>
            {[...data.paths].map((path, index) => {
              const d = path.getAttribute('d');
              return d ? (
                <path key={index} d={d} fill={!character.index ? this.theme.bright : character.colors[index]}></path>
              ) : null;
            })}
          </svg>
        </figure>
      );
    }

    if ($container) {
      $container.innerHTML = '';
      $container.appendChild((
        <figure data-phrase>
          { figures }
        </figure>
      ));
    }

    return figures;
  }

  // TODO: multiple templates / designs - build out into classes

  renderPoster($container: HTMLElement | null = null, renderDom = false) {
    const posterWidth = 1350;
    const posterHeight = 1800;
    const zoomFactor = 0.4 + Math.round(Math.random() * 10) / 3;

    let phraseWidth = 0;
    const phraseFontSize = 100;
    const phraseHeight = phraseFontSize * zoomFactor;
    const charSpacer = 0.12 * phraseHeight * zoomFactor;
    const wordSpacer = charSpacer;
    const lineSpacer = 10 * zoomFactor;

    // generate word

    const phrase = [];
    let i = 0;
    let charOffset = 0;

    for (const character of this.value) {
      if (this.characters[character.character][character.index]) {
        const data = this.characters[character.character][character.index];
        const [width, height] = data.dimension;
        const factor = phraseHeight / height;
        const newWidth = width * factor;
        phraseWidth += newWidth + (i > 0 ? charSpacer / factor : 0);
        charOffset = phraseWidth - newWidth;
        phrase.push((
          <g key={`char${character.index}`} transform={`translate(${charOffset} 0) scale(${factor})`} data-character>
            {[...data.paths].map((path, index) => {
              const d = path.getAttribute('d');
              return d ? (
                <path key={index} d={d} fill={!character.index ? this.theme.dark : character.colors[index]}></path>
              ) : null;
            })}
          </g>
        ));
      }
      i++;
    }

    // put words together into a line

    const line = [];
    let k = 0;
    let phraseOffset = 0;

    do {
      phraseOffset = phraseWidth * k + wordSpacer * Math.max(0, k - 1);

      const phrasePositioned = (
        <g key={`word${k}`} transform={`translate(${phraseOffset} 0)`} data-word>
          {phrase}
        </g>
      );
      line.push(phrasePositioned);
      k++;
    } while (phraseOffset < posterWidth);

    // put lines together to fill poster

    const lines = [];
    let j = 0;
    let lineOffset = 0;

    do {
      const linePositioned = (
        <g key={`line${j}`} transform={`translate(0, ${lineOffset})`} data-line>
          {line}
        </g>
      );
      lines.push(linePositioned);

      j++;
      lineOffset = phraseHeight * j + lineSpacer * j;
    } while (lineOffset < posterHeight);

    // generate footer

    const data = this.footers['template1.tsx'];
    const [width, height] = data.dimension;
    const footerWidth = posterWidth;
    const factor = footerWidth / width;
    const footerHeight = factor * height;
    const footer = (
      <g transform={`translate(0 ${posterHeight - footerHeight}) scale(${factor})`} data-footer>
        {[...data.paths].map((path, index) => {
          const pathD = path.getAttribute('d');
          const pathFill = path.getAttribute('fill');
          const pathWidth = path.getAttribute('width');
          const pathHeight = path.getAttribute('height');

          if (path.nodeName === 'path') {
            return (<path key={index} d={pathD} fill={pathFill}></path>);
          } else if (path.nodeName === 'circle') {
            return (<circle key={index} width={pathWidth} height={pathHeight} fill={pathFill}></circle>);
          } else if (path.nodeName === 'rect') {
            return (<rect key={index} width={pathWidth} height={pathHeight} fill={pathFill}></rect>);
          }

          return null;
        })}
      </g>
    );

    // generate poster

    const $output = (
      <figure style={{
        position: 'relative', width: '100%', height: 'auto', paddingTop: '133.33%'
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${posterWidth} ${posterHeight}`} style={{
          position: 'absolute', top: '0', left: '0', width: '100%', height: '100%'
        }}>
          <rect width="1350" height="1800" fill={this.theme.bright} />
          {lines}
          {footer}
        </svg>
      </figure>
    );

    if (renderDom) {
      $container.innerHTML = $output.outerHTML;
    }

    return $output;
  }

  renderPosters($container: HTMLElement = document.body) {
    if ($container) {
      const $posterWrappers = $container.querySelectorAll('[data-poster]');
      for (const $posterWrapper of $posterWrappers) {
        this.renderPoster($posterWrapper, true);
      }
    }
  }

}

export default new Characters();