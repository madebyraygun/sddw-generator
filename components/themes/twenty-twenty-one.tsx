import Theme from './theme';

class TwentyTwentyOne extends Theme {

  slug = 'default'; // directory for vector assets

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