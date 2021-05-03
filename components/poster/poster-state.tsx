import FooterState from './footer-state';
import WordState from './word-state';
import Theme from '../themes/theme';
import Design from '../designs/design';

class PosterState {

  footer: FooterState;
  design: Design;
  theme: Theme;
  word: WordState;

  adjustments: {
    scale: number,
  } = {
    scale: 1,
  };

  coords: {
    width: number,
    height: number,
  } = {
    width: 1350,
    height: 1800,
  };

  flags: {
    isRandomColors: boolean,
    isRandomWords: boolean,
    isLineClamped: boolean,
    isWordWrap: boolean,
  } = {
    isRandomColors: true,
    isRandomWords: true,
    isLineClamped: true,
    isWordWrap: true,
  };

  constructor(theme: Theme, design?: Design, word?: WordState) {
    // theme dictates colors and svgs
    this.theme = theme;

    // design dictates poster layout
    if (design) this.design = design;
    else this.design = new Design(this);

    if (word) this.word = word;
  }

  attachWord(word: WordState) {
    this.word = word;
    this.word.attachPoster(this);
  }

  // fun

  shuffleScale() {
    this.adjustments.scale = 0.4 + Math.round(Math.random() * 10) / 3;
  }

  // return rendered output

  render(): Node {
    return this.design.renderPoster();
  }

  // getters / setters

  get isRandomColors(): boolean {
    return this.flags.isRandomColors;
  }

  set isRandomColors(value: boolean) {
    this.flags.isRandomColors = value;
  }

  get scale(): number {
    return this.adjustments.scale;
  }

  get width(): number {
    return this.coords.width;
  }

  get height(): number {
    return this.coords.height;
  }

}

export default PosterState;