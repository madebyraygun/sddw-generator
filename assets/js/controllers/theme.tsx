import Theme from '../../../components/themes/theme';
import TwentyTwentyOne from '../../../components/themes/twenty-twenty-one';

class ThemeController {

  theme: Theme;

  constructor() {
    this.theme = new TwentyTwentyOne();
  }

}

export default new ThemeController();
