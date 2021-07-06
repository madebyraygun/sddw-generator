// import swearjar from 'swearjar';

class Theme {

  slug = 'default'; // directory for vector assets

  colors: {
    bright: string;
    dark: string;
    swatches: Array<string>;
  } = {
    bright: '#F4EADF',
    dark: '#231F20',
    swatches: ['#FB4C00', '#3483AE', '#514C8F', '#065B2F', '#F8ACA4', '#FEC045'],
  };

  config: {
    characterVariationsTotal: number;
    inputRenderedHeight: number;
    inputRenderedLetterSpacing: number;
  } = {
    characterVariationsTotal: 3,
    inputRenderedHeight: 100,
    inputRenderedLetterSpacing: 10,
  };

  getShuffledColors() {
    return [...this.swatches].sort(() => Math.random() - 0.5);
  }

  // colors
  get bright(): string {
    return this.colors.bright;
  }

  get dark(): string {
    return this.colors.dark;
  }

  get swatches(): Array<string> {
    return this.colors.swatches;
  }

  // configurations
  get characterVariationsTotal(): number {
    return this.config.characterVariationsTotal;
  }

  get inputRenderedHeight(): number {
    return this.config.inputRenderedHeight;
  }

  get inputRenderedLetterSpacing(): number {
    return this.config.inputRenderedLetterSpacing;
  }

}

export default Theme;
