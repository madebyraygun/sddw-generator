/*  *** POSTER ***
    Differentiating Poster vs Design:
    Poster contains the user's configuration - their word, tweaks, etc.
    Design is a template to translate Poster data into a specific look.
*/

import FooterState from './footer-state';
import WordState from './word-state';
import Theme from '../themes/theme';
import Design from '../designs/design';
import StickerState from './sticker-state';

class PosterState {

  footer: FooterState;
  design: Design;
  theme: Theme;
  word: WordState;
  sticker: StickerState;

  adjustments: {
    rotation: number;
    scale: number;
  } = {
    rotation: 0,
    scale: 1,
  };

  coords: {
    width: number;
    height: number;
  } = {
    width: 1440,
    height: 1800,
  };

  flags: {
    isRandomColors: boolean;
    isRandomWords: boolean;
    isLineClamped: boolean;
    isWordWrap: boolean;
  } = {
    isRandomColors: false,
    isRandomWords: false,
    isLineClamped: true,
    isWordWrap: true,
  };

  constructor(theme: Theme, design?: Design, word?: WordState, sticker?:StickerState) {
    // theme dictates colors and svgs
    this.theme = theme;

    // design dictates poster layout
    if (design) this.design = design;
    else this.design = new Design(this);

    // sticker dictates sticker
    if (sticker) this.sticker = sticker;
    else this.sticker = new StickerState();

    if (word) this.word = word;
  }

  attachWord(word: WordState) {
    this.word = word;
    this.word.attachPoster(this);
  }

  // rebuild entire poster of words

  rebuild() {
    this.design.rebuild();
  }

  // fun

  shuffle() {
    this.adjustments.scale = this.design.scaleMin + Math.round(Math.random() * this.design.scaleMax);
    this.adjustments.rotation = this.design.rotationMin + Math.round(Math.random() * this.design.rotationMax * 2);
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

  get isRandomWords(): boolean {
    return this.flags.isRandomWords;
  }

  set isRandomWords(value: boolean) {
    this.flags.isRandomWords = value;
  }

  set rotation(value: number) {
    this.adjustments.rotation = value;
  }

  get rotation(): number {
    return this.adjustments.rotation;
  }

  set scale(value: number) {
    this.adjustments.scale = value;
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
