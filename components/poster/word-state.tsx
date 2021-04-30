import Theme from '../themes/theme';
import CharacterState from './character-state';
import PosterState from './poster-state';

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

    if (characters instanceof String) {
      this.characters = this.charactersFromString(String(characters));
    } else {
      this.characters = [...characters] as CharacterState[];
    }

    this.poster = poster;
  }

  attachPoster(poster: PosterState) {
    this.poster = poster;
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
  changeCharacter(character: CharacterState, variationIndex: number, glyph?: string) {
    if (character && !character.special) {
      // change glyph variation
      let curVariationIndex = variationIndex;
      if (curVariationIndex >= this.theme.characterVariationsTotal) curVariationIndex = 0;
      if (curVariationIndex < 0) curVariationIndex = this.theme.characterVariationsTotal - 1;
      character.variationIndex = curVariationIndex;

      // use existing color sequence or new random order
      if (this.poster?.isRandomColors || !character?.colors.length) {
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
    for (let i = 0; i < this.characters.length; i++) {
      const character = this.characters[i];
      if (character.variationIndex === index) {
        return character;
      }
    }
    return null;
  }

}

export default WordState;