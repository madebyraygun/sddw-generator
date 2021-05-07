interface Breakpoints {
  [key: string]: number
}

export default class Settings {

  static breakpoints:Breakpoints = {
    xs: 1,
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1600,
    xxxl: 1920,
    '4xl': 2560
  }

}
