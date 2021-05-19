/*  *** DESIGN ***
    Differentiating Poster vs Design:
    Poster contains the user's configuration - their word, tweaks, etc.
    Design is a template to translate Poster data into a specific look.
*/

import AssetsController from '../../assets/js/controllers/assets';
import PosterState from '../poster/poster-state';
import WordState from '../poster/word-state';
import Theme from '../themes/theme';

interface WordGenerated {
  characterElements: Node[],
  dimensions: {
    width: number,
    height: number,
    spacing: number
  },
  el: HTMLElement,
  fontSize: number,
  state: WordState,
}

interface LineGenerated {
  fontSize: number,
  dimensions: {
    width: number,
    height: number
  },
  el: HTMLElement,
  wordsGenerated: WordGenerated[],
}

class Design {

  config: {
    rotationMin: number,
    rotationMax: number,
    scaleMin: number,
    scaleMax: number,
  } = {
    rotationMin: -90,
    rotationMax: 90,
    scaleMin: 0.4,
    scaleMax: 3,
  };

  state: {
    lines: LineGenerated[]
  }

  poster: PosterState;
  theme: Theme;

  constructor(poster: PosterState) {
    this.poster = poster;
    this.theme = poster.theme;
  }

  rebuild() {
    // build lines filled with maximum number of words
    // display number of words that will appear on screen with render function
    // will need separate checks from render to decide what shows up
    // word wrap will be its own problem later
  }

  generateWord(word: WordState, fontSize = 100):WordGenerated {
    let wordWidth = 0;

    const characterElements:Node[] = [];
    const wordHeight = fontSize * this.poster.scale;
    const charSpacer = 0.12 * wordHeight * this.poster.scale;
    let charOffset = 0;

    for (let i = 0; i < word.characters.length; i++) {
      const character = word.characters[i];
      const svgCharacter = AssetsController.getCharacter(character.glyph, character.variationIndex);
      const [width, height] = svgCharacter?.dimension ?? [0, 0];
      const factor = wordHeight / height;
      const newWidth = width * factor;
      wordWidth += newWidth + (i > 0 ? charSpacer / factor : 0);
      charOffset = wordWidth - newWidth;
      characterElements.push(
        <g key={`char${character.variationIndex}`} transform={`translate(${charOffset} 0) scale(${factor})`} data-character>
          {[...svgCharacter.children ?? []].map((path, index) => {
            const d = path.getAttribute('d');
            return d ? (
              <path key={index} d={d} fill={!character.variationIndex ? this.theme.colors.dark : character.colors[index]}></path>
            ) : null;
          })}
        </g>
      );
    }

    const wordElement = (
      <g key={`word${Date.now()}`} data-word>
        {characterElements}
      </g>
    ) as HTMLElement;

    return {
      characterElements,
      dimensions: {
        width: wordWidth,
        height: wordHeight,
        spacing: charSpacer,
      },
      el: wordElement,
      fontSize,
      state: word
    };
  }

  generateLine(showUserDesign = true, render = true): LineGenerated {
    const wordsGenerated: WordGenerated[] = [];
    const wordsElements: HTMLElement[] = [];
    let k = 0;
    let wordOffset = 0;
    let fontSize = 0;
    let lineHeight = 0;
    let spacing = 0;

    do {
      const curWordState = this.poster.word.clone();

      if (!showUserDesign || k) {
        if (this.poster.isRandomColors) curWordState.shuffleColors();
        if (this.poster.isRandomWords) curWordState.shuffleCharacters(true);
      }

      const wordGenerated: WordGenerated = this.generateWord(curWordState);
      lineHeight = Math.max(lineHeight, wordGenerated.dimensions.height);
      fontSize = Math.max(fontSize, wordGenerated.fontSize);
      ({ spacing } = wordGenerated.dimensions);

      if (render) {
        wordGenerated.el.style.transform = `translate(${wordOffset}px, 0)`;
      }

      wordsGenerated.push(wordGenerated);
      wordsElements.push(wordGenerated.el);

      wordOffset += wordGenerated.dimensions.width + wordGenerated.dimensions.spacing;
      k++;
    } while (wordOffset < this.poster.width);

    const lineWidth = wordOffset - spacing;
    const lineElement = (
      <g key={`line${Date.now()}`} data-line>
        {wordsElements}
      </g>
    ) as HTMLElement;

    return {
      fontSize,
      dimensions: {
        width: lineWidth,
        height: lineHeight,
      },
      el: lineElement,
      wordsGenerated,
    };
  }

  renderPoster(rebuild = false): Node {
    if (rebuild) this.rebuild();

    // put lines together to fill poster

    const lines: HTMLElement[] = [];
    const lineSpacer = 10 * this.poster.scale;
    let j = 0;
    let lineOffsetYNoRotation = 0;
    let wordCount = 0;

    do {
      const lineGenerated = this.generateLine(!wordCount);
      const { wordsGenerated } = lineGenerated;
      const lineHeight = lineGenerated.dimensions.height;
      const radians = this.poster.rotation / 180 * Math.PI;
      lineOffsetYNoRotation = lineHeight * j + lineSpacer * j;

      const lineOffsetX = Math.sin(radians) * (0 - lineOffsetYNoRotation);
      const lineOffsetY = Math.cos(radians) * (lineOffsetYNoRotation);
      const lineElement: HTMLElement = lineGenerated.el;
      lineElement.style.transform = `translate(${lineOffsetX}px, ${lineOffsetY}px) rotate(${this.poster.rotation}deg)`;
      lines.push(lineElement);
      j++;
      wordCount += wordsGenerated.length;
    } while (lineOffsetYNoRotation < this.poster.height);

    // generate footer

    const data = AssetsController.getFooter('light', '2021');
    const [width, height] = data.dimension;
    const footerWidth = this.poster.width;
    const factor = footerWidth / width;
    const footerHeight = factor * height;

    const footer = (
      <g transform={`translate(0 ${this.poster.height - footerHeight}) scale(${factor})`} data-footer>
        {[...data.children].map((path, index) => {
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

    return (
      <figure style={{
        position: 'relative', width: '100%', height: 'auto', paddingTop: '133.33%'
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${this.poster.width} ${this.poster.height}`} style={{
          position: 'absolute', top: '0', left: '0', width: '100%', height: '100%'
        }}>
          <rect width="1350" height="1800" fill={this.theme.colors.bright} />
          {lines}
          {footer}
        </svg>
      </figure>
    );
  }

  // getters

  get rotationMin(): number {
    return this.config.rotationMin;
  }

  get rotationMax(): number {
    return this.config.rotationMax;
  }

  get scaleMin(): number {
    return this.config.scaleMin;
  }

  get scaleMax(): number {
    return this.config.scaleMax;
  }

}

export default Design;