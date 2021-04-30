class CharacterState {

  glyph: string;
  colors: string[];
  variationIndex: number;
  special: boolean;

  constructor(glyph: string, colors: Array<string>, variationIndex: number, special = false) {
    this.glyph = glyph;
    this.colors = colors;
    this.variationIndex = variationIndex;
    this.special = special;
  }

}

export default CharacterState;