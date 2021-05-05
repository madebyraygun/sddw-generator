import AssetController from '../../assets/js/controllers/assets';
import PosterState from '../poster/poster-state';
import Theme from '../themes/theme';

class Design {

  poster: PosterState;
  theme: Theme;

  adjustments: {
    scale: number,
  } = {
    scale: 1,
  };

  constructor(poster: PosterState) {
    this.poster = poster;
    this.theme = poster.theme;
  }

  renderPoster(): Node {
    let wordWidth = 0;

    const wordFontSize = 100;
    const wordHeight = wordFontSize * this.adjustments.scale;
    const charSpacer = 0.12 * wordHeight * this.adjustments.scale;
    const wordSpacer = charSpacer;
    const lineSpacer = 10 * this.adjustments.scale;

    // generate word

    const { word } = this.poster;
    const wordCharacters:Node[] = [];
    let charOffset = 0;

    for (let i = 0; i < word.characters.length; i++) {
      const character = word.characters[i];
      const svgCharacter = AssetController.getCharacter(character.glyph, character.variationIndex);
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

    // put words together into a line

    const words = [];
    let k = 0;
    let wordOffset = 0;

    do {
      wordOffset = wordWidth * k + wordSpacer * Math.max(0, k - 1);
      words.push((
        <g key={`word${k}`} transform={`translate(${wordOffset} 0)`} data-word>
          {wordCharacters}
        </g>
      ));
      k++;
    } while (wordOffset < this.poster.width);

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
    } while (lineOffset < this.poster.height);

    // generate footer

    const data = AssetController.getFooter('template1.tsx', this.theme.slug);
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

  shuffle() {
    this.adjustments.scale = 0.4 + Math.round(Math.random() * 10) / 3;
  }

}

export default Design;