// import swearjar from 'swearjar';

class Characters {

  bright = '#F4EADF';
  dark = '#231F20';
  colors = [
    '#FB4C00',
    '#3483AE',
    '#514C8F',
    '#065B2F',
    '#F8ACA4',
    '#FEC045'
  ];

  characters: {
    [character: string]: Array<{
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
    } catch (e) {
      // console.log(e);
    }
  }

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

  shuffleColors() {
    return [...this.colors].sort(() => Math.random() - 0.5);
  }

  pxToRem(value: number) {
    return value / 10;
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
            index: special ? 0 : Math.floor(Math.random() * 3),
            colors: this.shuffleColors()
          };
        }
      }
    });
    this.value.length = value.length;
  }

  change(index: number) {
    if (this.value[index] && !this.value[index].special) {
      let characterIndex = this.value[index].index + 1;
      if (characterIndex >= 3) characterIndex = 0;
      this.value[index].index = characterIndex;
      this.value[index].colors = this.shuffleColors();
    }
  }

  render() {
    const figures = [];
    for (const character of this.value) {
      const data = this.characters[character.character][character.index];
      const [width, height] = data.dimension;
      const phraseHeight = 100;
      figures.push(
        <figure style={{ width: `${this.pxToRem(width * (phraseHeight / height))}rem`, height: `${this.pxToRem(phraseHeight)}rem` }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`}>
            {[...data.paths].map((path, index) => {
              const d = path.getAttribute('d');
              return d ? (
                <path key={index} d={d} fill={!character.index ? this.bright : character.colors[index]}></path>
              ) : null;
            })}
          </svg>
        </figure>
      );
    }
    return figures;
  }

  generatePoster($container: HTMLElement | null = null, renderDom = false) {
    const posterWidth = 1350;
    const posterHeight = 1800;
    const zoomFactor = 0.4 + Math.round(Math.random() * 10) / 3;

    let phraseWidth = 0;
    const phraseFontSize = 100;
    const phraseHeight = phraseFontSize * zoomFactor;
    const charSpacer = 0.12 * phraseHeight * zoomFactor;
    const wordSpacer = charSpacer;
    const lineSpacer = 10 * zoomFactor;

    // TODO: multiple templates - build out into classes?

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
          <g key={`char${character.index}`} transform={`translate(${charOffset} 0) scale(${factor})`}>
            {[...data.paths].map((path, index) => {
              const d = path.getAttribute('d');
              return d ? (
                <path key={index} d={d} fill={!character.index ? this.dark : character.colors[index]}></path>
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
        <g key={`word${k}`} transform={`translate(${phraseOffset} 0)`}>
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
        <g key={`line${j}`} transform={`translate(0, ${lineOffset})`}>
          {line}
        </g>
      );
      lines.push(linePositioned);

      j++;
      lineOffset = phraseHeight * j + lineSpacer * j;
    } while (lineOffset < posterHeight);

    // generate poster

    const $output = (
      <figure style={{
        position: 'relative', width: '100%', height: 'auto', paddingTop: '133.33%'
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${posterWidth} ${posterHeight}`} style={{
          position: 'absolute', top: '0', left: '0', width: '100%', height: '100%'
        }}>
          <rect width="1350" height="1800" fill={this.bright} />
          {lines}
        </svg>
      </figure>
    );

    if (renderDom) {
      $container.innerHTML = $output.outerHTML;
    }

    return $output;
  }

  generatePosters($container: HTMLElement = document.body) {
    if ($container) {
      const $posterWrappers = $container.querySelectorAll('[data-poster]');
      for (const $posterWrapper of $posterWrappers) {
        console.log($posterWrapper);
        this.generatePoster($posterWrapper, true);
      }
    }
  }

}

export default new Characters();