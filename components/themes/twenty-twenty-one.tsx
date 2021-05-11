import Theme from './theme';

class TwentyTwentyOne extends Theme {

  slug = 'default'; // directory for vector assets

  colors: {
    bright: string,
    dark: string,
    swatches: Array<string>,
  } = {
    bright: '#F8F9FA',
    dark: '#1B1C1E',
    swatches: [
      '#E75334',
      '#66DEF4',
      '#4D78F6',
      '#6A2FA1',
      '#76FA95',
      '#E94568',
      '#F9F15A',
    ]
  }

  flags: {
    isLineClamped: boolean,
    isWordWrap: boolean,
  } = {
    isLineClamped: true,
    isWordWrap: true,
  };

  get isLineClamped():boolean {
    return this.flags.isLineClamped;
  }

  get isWordWrap():boolean {
    return this.flags.isWordWrap;
  }

}

export default TwentyTwentyOne;