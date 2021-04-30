// import swearjar from 'swearjar';

class Theme {

  slug:string = 'default';

  colors: {
    bright: string,
    dark: string,
    swatches: Array<string>
  } = {
    bright: '#F4EADF',
    dark: '#231F20',
    swatches: [
      '#FB4C00',
      '#3483AE',
      '#514C8F',
      '#065B2F',
      '#F8ACA4',
      '#FEC045'
    ]
  }

  config: {
    characterVariationsTotal: number,
  } = {
    characterVariationsTotal: 3;
  }

  getShuffledColors() {
    return [...this.swatches].sort(() => Math.random() - 0.5);
  }

  // colors
  get bright():string { return this.colors.bright; }
  get dark():string { return this.colors.dark; }
  get swatches():Array<string> { return this.colors.swatches; }

  // configurations
  get characterVariationsTotal():number { return this.config.characterVariationsTotal; }

}

export default Theme;