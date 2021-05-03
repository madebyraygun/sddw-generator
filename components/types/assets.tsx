export interface Character {
  svg: SVGElement | null,
  paths: SVGPathElement[],
  dimension: number[]
}

export interface Characters {
  [character: string]: Array<Character>
}

export interface Footer {
  svg: SVGElement | null,
  paths: SVGPathElement[],
  dimension: number[]
}

export interface Footers {
  [footer: string]: Footer
}
