import Theme from './theme';

class TwentyTwentyOne extends Theme {

  slug = 'twenty-twenty-one';

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