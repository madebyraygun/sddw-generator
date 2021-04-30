// import swearjar from 'swearjar';

import ThemeController from './theme';

import PosterState from '../../../components/poster/poster-state';
import WordState from '../../../components/poster/word-state';
import CharacterState from '../../../components/poster/character-state';

class Editor {

  assets: {
    characters: {
      [character: string]: Array<{
        svg: SVGElement | null,
        paths: SVGPathElement[],
        dimension: number[]
      }>
    },
    footers: {
      [footer: string]: Array<{
        svg: SVGElement | null,
        paths: SVGPathElement[],
        dimension: number[]
      }>
    },
  } = {
    characters: {},
    footers: {},
  };

  posters: Array<PosterState>;
  currentPoster: PosterState;
  currentWord: WordState;

  constructor() {
    try {
      this.currentPoster = new PosterState(ThemeController.theme);
      this.#requireCharacters();
      this.#requirePosterFooters();
    } catch (e) {
      console.error(e);
    }
  }

  // load svgs

  #requireCharacters = () => {
    const required:__WebpackModuleApi.RequireContext = this.currentPoster.theme.requiredCharacters;
    required.keys().map((path: string) => {
      const character = path.split('/')[1].toLowerCase();
      const { default: Character } = required(path);
      const svg = Character({});
      const paths = svg.querySelectorAll('path');
      const [,, width, height] = svg.getAttribute('viewBox').split(' ');
      const dimension = [parseFloat(width), parseFloat(height)];
      if (!this.assets.characters[character]) this.assets.characters[character] = [];
      this.assets.characters[character].push({
        svg,
        paths,
        dimension
      });
    });
    console.log(required);
    console.log(this.assets.characters);
  }

  #requirePosterFooters = () => {
    const required:__WebpackModuleApi.RequireContext = this.currentPoster.theme.requiredFooters;
    required.keys().map((path: string) => {
      const footer = path.split('/')[1].toLowerCase();
      const { default: Footer } = required(path);
      const svg = Footer({});
      const paths = svg.querySelectorAll('path, rect, circle');
      const [,, width, height] = svg.getAttribute('viewBox').split(' ');
      const dimension = [parseFloat(width), parseFloat(height)];
      this.assets.footers[footer] = {
        svg,
        paths,
        dimension
      };
    });
  }

  // render phrases and characters

  nextCharacter(word: WordState, characterIndex: number, $container: HTMLElement | null, callback?: (value) => void) {
    word.nextCharacterByIndex(characterIndex);

    if ($container) {
      this.renderWord(word, $container);
    }

    if (callback) {
      callback({ word, characterIndex, $container });
    }
  }

  prevCharacter(word: WordState, characterIndex: number, $container: HTMLElement | null, callback?: (value) => void) {
    word.prevCharacterByIndex(characterIndex);

    if ($container) {
      this.renderWord(word, $container);
    }

    if (callback) {
      callback({ word, characterIndex, $container });
    }
  }

  shuffleCharacter(word: WordState, characterIndex: number, $container: HTMLElement | null, callback?: (value) => void) {
    word.shuffleCharacterByIndex(characterIndex);

    if ($container) {
      this.renderWord(word, $container);
    }

    if (callback) {
      callback({ word, characterIndex, $container });
    }
  }

  shuffleWord(word: WordState, $container: HTMLElement | null, callback?: (value) => void) {
    word.shuffle();

    if ($container) {
      this.renderWord(word, $container);
    }

    if (callback) {
      callback({ word, $container });
    }
  }

  // utilities

  pxToRem(value: number) {
    return value / 10;
  }

  attachWord(word: WordState) {
    this.currentWord = word;
    this.currentPoster.attachWord(this.currentWord);
  }

  // render word to container

  renderWord(word: WordState, $container?: HTMLElement, callback?: (value: NodeList) => void) {
    const $characters: DocumentFragment = document.createDocumentFragment();
    for (const character of word.characters) {
      const data = this.assets.characters[character.glyph][character.variationIndex];
      const [width, height] = data.dimension;
      const phraseHeight = 100;
      $characters.appendChild(
        <figure data-character data-index={$characters.length} style={{ width: `${this.pxToRem(width * (phraseHeight / height))}rem`, height: `${this.pxToRem(phraseHeight)}rem` }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`}>
            {[...data.paths].map((path, index) => {
              const d = path.getAttribute('d');
              return d ? (
                <path key={index} d={d} fill={!character.variationIndex ? this.currentPoster.theme.bright : character.colors[index]}></path>
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
          {$characters}
        </figure>
      ));
    }

    if (callback) callback($characters.childNodes);

    return $characters;
  }

  // render poster to container
  // TODO: multiple templates / designs - build out into classes

  renderPoster(poster: PosterState, $container: HTMLElement | null = null) {
    let wordWidth = 0;
    // TODO: move scale to theme?
    const wordFontSize = 100;
    const wordHeight = wordFontSize * poster.scale;
    const charSpacer = 0.12 * wordHeight * poster.scale;
    const wordSpacer = charSpacer;
    const lineSpacer = 10 * poster.scale;

    // generate word

    const { word } = poster;
    const characters = [];
    let i = 0;
    let charOffset = 0;

    for (const character of word.characters) {
      if (this.assets.characters[character.glyph][character.variationIndex]) {
        const data = this.assets.characters[character.glyph][character.variationIndex];
        const [width, height] = data.dimension;
        const factor = wordHeight / height;
        const newWidth = width * factor;
        wordWidth += newWidth + (i > 0 ? charSpacer / factor : 0);
        charOffset = wordWidth - newWidth;
        characters.push((
          <g key={`char${character.index}`} transform={`translate(${charOffset} 0) scale(${factor})`} data-character>
            {[...data.paths].map((path, index) => {
              const d = path.getAttribute('d');
              return d ? (
                <path key={index} d={d} fill={!character.index ? this.currentPoster.theme.dark : character.colors[index]}></path>
              ) : null;
            })}
          </g>
        ));
      }
      i++;
    }

    // put words together into a line

    const words = [];
    let k = 0;
    let wordOffset = 0;

    do {
      wordOffset = wordWidth * k + wordSpacer * Math.max(0, k - 1);
      words.push((
        <g key={`word${k}`} transform={`translate(${wordOffset} 0)`} data-word>
          {word}
        </g>
      ));
      k++;
    } while (wordOffset < poster.width);

    // put lines together to fill poster

    const lines = [];
    let j = 0;
    let lineOffset = 0;

    do {
      lines.push((
        <g key={`line${j}`} transform={`translate(0, ${lineOffset})`} data-line>
          {words}
        </g>
      ));
      j++;
      lineOffset = wordHeight * j + lineSpacer * j;
    } while (lineOffset < poster.height);

    // generate footer

    const data = this.assets.footers['template1.tsx'];
    const [width, height] = data.dimension;
    const footerWidth = poster.width;
    const factor = footerWidth / width;
    const footerHeight = factor * height;

    const footer = (
      <g transform={`translate(0 ${poster.height - footerHeight}) scale(${factor})`} data-footer>
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${poster.width} ${poster.height}`} style={{
          position: 'absolute', top: '0', left: '0', width: '100%', height: '100%'
        }}>
          <rect width="1350" height="1800" fill={this.currentPoster.theme.bright} />
          {lines}
          {footer}
        </svg>
      </figure>
    );

    if ($container) {
      $container.innerHTML = $output.outerHTML;
    }

    return $output;
  }

  renderPosters($container: HTMLElement = document.body) {
    if ($container) {
      const $posterWrappers: NodeList = $container.querySelectorAll('[data-poster]');
      for (const $posterWrapper of $posterWrappers) {
        this.renderPoster(this.currentPoster, $posterWrapper as HTMLElement);
      }
    }
  }

}

export default new Editor();