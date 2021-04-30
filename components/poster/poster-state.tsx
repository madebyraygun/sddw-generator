import FooterState from './footer-state';
import WordState from './word-state';
import Theme from '../themes/theme';

class PosterState {

  footer: FooterState;
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

  constructor(theme: Theme) {
    this.theme = theme;
  }

  // fun

  shuffleScale() {
    this.adjustments.scale = 0.4 + Math.round(Math.random() * 10) / 3;
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