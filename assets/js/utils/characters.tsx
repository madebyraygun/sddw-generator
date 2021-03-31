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
      const newHeight = 100;
      figures.push(
        <figure style={{ width: `${this.pxToRem(width * (newHeight / height))}rem`, height: `${this.pxToRem(newHeight)}rem` }}>
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

  generatePoster() {
    let offset = 0;
    return (
      <figure style={{ width: '135rem', height: '180rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1350 1800">
          <rect width="1350" height="1800" fill={this.bright} />
          {this.value.map((character, key) => {
            if (this.characters[character.character][character.index]) {
              const data = this.characters[character.character][character.index];
              const [width, height] = data.dimension;
              const newHeight = 100;
              const factor = newHeight / height;
              const newWidth = width * factor;
              offset += newWidth + 10;
              return (
                <g key={key} transform={`translate(${offset - newWidth - 10} 0) scale(${factor})`}>
                  {[...data.paths].map((path, index) => {
                    const d = path.getAttribute('d');
                    return d ? (
                      <path key={index} d={d} fill={!character.index ? this.dark : character.colors[index]}></path>
                    ) : null;
                  })}
                </g>
              );
            }
            return null;
          })}
        </svg>
      </figure>
    );
  }

}

export default new Characters();