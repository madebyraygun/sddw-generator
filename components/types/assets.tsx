export interface Character {
  svg: SVGElement | null;
  children: SVGPathElement[];
  dimension: number[];
}

export interface Characters {
  [character: string]: Array<Character>;
}

export interface InlineSVG {
  svg: SVGElement | null;
  children: SVGElement[];
  dimension: number[];
}

export interface Icon {
  svg: SVGElement | null;
  paths: SVGPathElement[];
  dimension: number[];
}

export interface InlineSVGs {
  [name: string]: InlineSVG;
}
