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
  characters: Node[],
  fontSize: number,
  dimensions: {
    width: number,
    height: number,
    spacing: number
  }
}

interface LineGenerated {
  words: Node[],
  fontSize: number,
  dimensions: {
    width: number,
    height: number
  }
}

class Design {

  poster: PosterState;
  theme: Theme;

  constructor(poster: PosterState) {
    this.poster = poster;
    this.theme = poster.theme;
  }

  generateWord(word: WordState, fontSize = 100):WordGenerated {
    let wordWidth = 0;

    const wordCharacters:Node[] = [];
    const wordHeight = fontSize * this.poster.scale;
    const charSpacer = 0.12 * wordHeight * this.poster.scale;
    let charOffset = 0;

    for (let i = 0; i < word.characters.length; i++) {
      const character = word.characters[i];
      const svgCharacter = AssetsController.getCharacter(character.glyph, character.variationIndex);
      const [width, height] = svgCharacter.dimension;
      const factor = wordHeight / height;
      const newWidth = width * factor;
      wordWidth += newWidth + (i > 0 ? charSpacer / factor : 0);
      charOffset = wordWidth - newWidth;
      wordCharacters.push(
        <g key={`char${character.variationIndex}`} transform={`translate(${charOffset} 0) scale(${factor})`} data-character>
          {[...svgCharacter.paths].map((path, index) => {
            const d = path.getAttribute('d');
            return d ? (
              <path key={index} d={d} fill={!character.variationIndex ? this.theme.colors.dark : character.colors[index]}></path>
            ) : null;
          })}
        </g>
      );
    }

    return {
      characters: wordCharacters,
      fontSize: fontSize,
      dimensions: {
        width: wordWidth,
        height: wordHeight,
        spacing: charSpacer,
      }
    };
  }

  generateLine(showUserDesign = true): LineGenerated {
    const words = [];
    let k = 0;
    let wordOffset = 0;
    let fontSize = 0;
    let lineHeight = 0;
    let spacing = 0;
    do {
      const renderedWord = this.poster.word.clone();

      if (!showUserDesign || k) {
        if (this.poster.isRandomColors) renderedWord.shuffleColors();
        if (this.poster.isRandomWords) renderedWord.shuffleCharacters();
      }

      const wordData: WordGenerated = this.generateWord(renderedWord);
      lineHeight = Math.max(lineHeight, wordData.dimensions.height);
      fontSize = Math.max(fontSize, wordData.fontSize);
      ({ spacing } = wordData.dimensions);

      words.push((
        <g key={`word${k}`} transform={`translate(${wordOffset} 0)`} data-word>
          {wordData.characters}
        </g>
      ));
      wordOffset += wordData.dimensions.width + wordData.dimensions.spacing;
      k++;
    } while (wordOffset < this.poster.width);

    const lineWidth = wordOffset - spacing;

    return {
      words,
      fontSize: fontSize,
      dimensions: {
        width: lineWidth,
        height: lineHeight,
      }
    };
  }

  renderPoster(): Node {
    // put lines together to fill poster

    const lines = [];
    const lineSpacer = 10 * this.poster.scale;
    let j = 0;
    let lineOffset = 0;
    let wordCount = 0;

    do {
      const lineData = this.generateLine(!wordCount);
      const { words } = lineData;
      const lineHeight: number = lineData.dimensions.height;
      lines.push((
        <g key={`line${j}`} transform={`translate(0, ${lineOffset})`} data-line>
          {words}
        </g>
      ));
      j++;
      lineOffset = lineHeight * j + lineSpacer * j;
      wordCount += words.length;
    } while (lineOffset < this.poster.height);

    // generate footer

    const data = AssetsController.getFooter('template1.tsx', this.theme.slug);
    const [width, height] = data.dimension;
    const footerWidth = this.poster.width;
    const factor = footerWidth / width;
    const footerHeight = factor * height;

    const footer = (
      <g transform={`translate(0 ${this.poster.height - footerHeight}) scale(${factor})`} data-footer>
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

}

export default Design;