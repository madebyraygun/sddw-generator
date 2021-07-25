class Number {

  // limit a number to a range
  clamp(num: number, max: number, min = 0, wrap = false): number {
    if (num < min) {
      if (wrap) {
        return Math.round(max - (num / max - Math.floor(num / max)) * max);
      }
      return min;
    }

    if (num >= max) {
      if (wrap) {
        return Math.round(min + (num / max - Math.floor(num / max)) * max);
      }
      return max;
    }

    return num;
  }

}

export default new Number();
