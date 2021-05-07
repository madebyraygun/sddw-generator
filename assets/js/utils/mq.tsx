// media queries (matches @mixin mq from breakpoints.scss)

import Settings from '../configs/settings';

export default class mq {

  static media(size: string, type = 'min', orientation = 'width') {
    const typeValidated = (type === 'min') ? 'min' : 'max';
    const orientationValidated = (orientation === 'width') ? 'width' : 'height';

    let sizePixels: number = Settings.breakpoints[size];
    if (type === 'max') {
      sizePixels++;
    }

    return window.matchMedia(`(${typeValidated}-${orientationValidated}:${sizePixels}px)`).matches;
  }

}
