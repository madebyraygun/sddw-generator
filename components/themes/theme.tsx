// import swearjar from 'swearjar';

class Theme {

  slug = 'default'; // directory for vector assets

  colors: {
    bright: string,
    dark: string,
    swatches: Array<string>,
  } = {
    bright: '#F4EADF',
    dark: '#231F20',
    swatches: [
      '#FB4C00',
      '#3483AE',
      '#514C8F',
      '#065B2F',
      '#F8ACA4',
      '#FEC045',
    ]
  }

  config: {
    characterVariationsTotal: number,
  } = {
    characterVariationsTotal: 3,
  }

  required : {
    characters: __WebpackModuleApi.RequireContext,
    footers: __WebpackModuleApi.RequireContext,
  } = {
    characters: require.context('../../assets/vectors/characters/default/', true, /\.tsx$/),
    footers: require.context('../../assets/vectors/footers/default/', true, /\.tsx$/),
  }

  getShuffledColors() {
    return [...this.swatches].sort(() => Math.random() - 0.5);
  }

  // colors
  get bright():string {
    return this.colors.bright;
  }

  get dark():string {
    return this.colors.dark;
  }

  get swatches():Array<string> {
    return this.colors.swatches;
  }

  // configurations
  get characterVariationsTotal():number {
    return this.config.characterVariationsTotal;
  }

  // build-time loaded vector assets
  get requiredCharacters():__WebpackModuleApi.RequireContext {
    return this.required.characters;
  }

  get requiredFooters():__WebpackModuleApi.RequireContext {
    return this.required.footers;
  }

}

export default Theme;