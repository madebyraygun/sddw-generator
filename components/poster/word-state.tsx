import Theme from '../themes/theme';
import CharacterState from './character-state';
import PosterState from './poster-state';
import AssetController from '../../assets/js/controllers/assets';
import PxToRem from '../../assets/js/utils/pxToRem';

class WordState {

  characters: Array<CharacterState> = [];

  poster: PosterState | undefined;
  theme: Theme;

  rotation: 0;
  scale: 1;
  x: 0;
  y: 0;

  constructor(characters: CharacterState[] | string, theme: Theme, poster?: PosterState) {
    this.theme = theme;

    if (typeof (characters) === 'string') {
      this.characters = this.charactersFromString(String(characters));
    } else {
      this.characters = [...characters] as CharacterState[];
    }

    this.poster = poster;
  }

  attachPoster(poster: PosterState) {
    this.poster = poster;
    this.theme = this.poster.theme;
  }

  // add new glyph
  addCharacter(character: CharacterState) {
    if (character) {
      this.characters.push(character);
    }
  }

  removeCharacter(character: CharacterState) {
    if (character) {
      this.characters.splice(this.characters.indexOf(character), 1);
    }
  }

  // generate characters from a string
  charactersFromString(characterString: string): CharacterState[] {
    const characters: CharacterState[] = [];
    for (let i = 0; i < characterString.length; i++) {
      const glyph: string = characterString[i];
      characters.push(new CharacterState(glyph, this.theme.getShuffledColors(), this.getShuffledVariationIndex(), /^[&@#]+$/.test(glyph)));
    }
    return characters;
  }

  // update text by string
  feed(characterString: string) {
    this.updateCharacters(this.charactersFromString(characterString));
  }

  updateCharacters(characters: CharacterState[]) {
    for (let i = 0; i < characters.length; i++) {
      const character: CharacterState = characters[i];
      if (this?.characters[i] && this.characters[i].glyph !== character.glyph) {
        this.changeCharacter(character, character.variationIndex, character.glyph);
      } else {
        this.addCharacter(character);
      }
    }

    this.characters = [...characters];
  }

  // change character's symbol, colors
  changeCharacter(character: CharacterState, variationIndex: number, glyph?: string, colors?: string[]) {
    if (character && !character.special) {
      // change glyph variation
      let curVariationIndex = variationIndex;
      if (curVariationIndex >= this.theme.characterVariationsTotal) curVariationIndex = 0;
      if (curVariationIndex < 0) curVariationIndex = this.theme.characterVariationsTotal - 1;
      character.variationIndex = curVariationIndex;

      // use existing color sequence or new random order
      if (colors) {
        character.colors = [...colors];
      } else if (!character?.colors.length) {
        character.colors = this.getShuffledColors();
      }

      // change glyph
      if (glyph) character.glyph = glyph;
      else if (typeof glyph !== 'undefined') this.removeCharacter(character);
    }
  }

  changeCharacterByIndex(characterIndex:number, variationIndex: number) {
    const character = this.getCharacterByIndex(characterIndex);
    if (character) {
      this.changeCharacter(character, variationIndex);
    }
  }

  // next character
  nextCharacter(character: CharacterState) {
    this.changeCharacter(character, character.variationIndex + 1);
  }

  nextCharacterByIndex(characterIndex:number) {
    const character = this.getCharacterByIndex(characterIndex);
    if (character) {
      this.nextCharacter(character);
    }
  }

  // prev character
  prevCharacter(character: CharacterState) {
    this.changeCharacter(character, character.variationIndex - 1);
  }

  prevCharacterByIndex(characterIndex:number) {
    const character = this.getCharacterByIndex(characterIndex);
    if (character) {
      this.prevCharacter(character);
    }
  }

  // shuffle character
  shuffleCharacter(character: CharacterState) {
    this.changeCharacter(character, this.getShuffledVariationIndex(character.variationIndex));
  }

  shuffleCharacterByIndex(characterIndex:number) {
    const character = this.getCharacterByIndex(characterIndex);
    if (character) {
      this.shuffleCharacter(character);
    }
  }

  // shuffle all characters
  shuffle() {
    for (let i = 0; i < this.characters.length; i++) {
      this.shuffleCharacter(this.characters[i]);
    }
  }

  // shuffle all characters
  shuffleCharacters() {
    for (let i = 0; i < this.characters.length; i++) {
      const character = this.characters[i];
      character.variationIndex = this.getShuffledVariationIndex(character.variationIndex);
    }
  }

  // shuffle all colors
  shuffleColors() {
    for (let i = 0; i < this.characters.length; i++) {
      this.characters[i].colors = this.getShuffledColors();
    }
  }

  // clone word
  clone(): WordState {
    const wordCopy = new WordState(this.toString(), this.theme, this.poster);
    for (let i = 0; i < wordCopy.characters.length; i++) {
      const character = this.characters[i];
      const characterCopy = wordCopy.characters[i];
      wordCopy.changeCharacter(characterCopy, character.variationIndex, character.glyph, character.colors);
    }
    return wordCopy;
  }

  // return randomized color swatches from theme
  getShuffledColors(): string[] {
    return this.theme.getShuffledColors();
  }

  // return randomized color swatches from theme
  getShuffledVariationIndex(variationIndex = -1): number {
    let randomIndex: number = variationIndex;
    while (randomIndex === variationIndex) {
      randomIndex = Math.round(Math.random() * (this.theme.characterVariationsTotal - 1));
    }
    return randomIndex;
  }

  // get character by index
  getCharacterByIndex(index:number): CharacterState | null {
    return this.characters[index] ?? null;
  }

  // translate characters to a string
  toString(): string {
    let characterString = '';
    for (let i = 0; i < this.characters.length; i++) {
      const character = this.characters[i];
      characterString += character.glyph;
    }

    return characterString;
  }

  // render based on theme
  // NOTE: this is different from rendering based on design
  // REASON: design may have additional rendering requirements, like breaking apart words

  render(): HTMLElement {
    const $word: HTMLElement = document.createElement('figure');

    for (const character of this.characters) {
      const svgCharacter = AssetController.getCharacter(character.glyph, character.variationIndex);
      const [width, height] = svgCharacter.dimension;
      const phraseHeight = 100;
      $word.appendChild(
        <figure data-character data-index={$word.children.length} style={{ width: `${PxToRem.convert(width * (phraseHeight / height))}rem`, height: `${PxToRem.convert(phraseHeight)}rem` }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`}>
            {[...svgCharacter.paths].map((path, index) => {
              const d = path.getAttribute('d');
              return d ? (
                <path key={index} d={d} fill={!character.variationIndex ? this.theme.bright : character.colors[index]}></path>
              ) : null;
            })}
          </svg>
        </figure>
      );
    }

    return $word;
  }

}

export default WordState;