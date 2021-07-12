interface Breakpoints {
  [key: string]: number;
}

export default class Settings {
  static breakpoints: Breakpoints = {
    mobile: 1,
    'mobile-h': 480,
    tablet: 768,
    desktop: 1024,
    'desktop-lg': 1280,
    'desktop-xl': 1600,
    'desktop-xxl': 1920,
    'desktop-xxxl': 2560,
  };
}
