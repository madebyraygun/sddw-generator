/*  *** DESIGN ***
    Differentiating Poster vs Design:
    Poster contains the user's configuration - their word, tweaks, etc.
    Design is a template to translate Poster data into a specific look.
*/

import { format } from 'date-fns';

import Role from '../../assets/js/constants/role';
import AssetsController from '../../assets/js/controllers/assets';
import RoleController from '../../assets/js/controllers/role';
import PosterState from '../poster/poster-state';
import WordState from '../poster/word-state';
import Theme from '../themes/theme';

import { SharpSansDisplayNo2 } from '../../assets/fonts/SharpSansDisplayNo2-Black-Base64';

import styles from './design.module.scss';

interface WordGenerated {
  characterElements: Node[];
  dimensions: {
    width: number;
    height: number;
    spacing: number;
  };
  el: HTMLElement;
  fontSize: number;
  state: WordState;
}

interface LineGenerated {
  fontSize: number;
  dimensions: {
    width: number;
    height: number;
  };
  el: HTMLElement;
  wordsGenerated: WordGenerated[];
}

interface CircleGenerated {
  el: HTMLElement;
}

class Design {

  config: {
    rotationMin: number;
    rotationMax: number;
    scaleMin: number;
    scaleMax: number;
  } = {
    rotationMin: -90,
    rotationMax: 90,
    scaleMin: 0.6,
    scaleMax: 3,
  };

  state: {
    lines: LineGenerated[];
  };

  poster: PosterState;
  theme: Theme;

  constructor(poster: PosterState) {
    this.poster = poster;
    this.theme = poster.theme;
  }

  rebuild() {
    // build lines filled with maximum number of words
    // display number of words that will appear on screen with render function
    // will need separate checks from render to decide what shows up
    // word wrap will be its own problem later
  }

  generateWord(word: WordState, fontSize = 100): WordGenerated {
    let wordWidth = 0;

    const characterElements: Node[] = [];
    const wordHeight = fontSize * this.poster.scale;
    const charSpacer = 0.12 * wordHeight * this.poster.scale;
    let charOffset = 0;

    for (let i = 0; i < word.characters.length; i++) {
      const character = word.characters[i];
      const svgCharacter = AssetsController.getCharacter(character.glyph, character.variationIndex);
      const [width, height] = svgCharacter?.dimension ?? [0, 0];
      const factor = wordHeight / height;
      const newWidth = width * factor;
      wordWidth += newWidth + (i > 0 ? charSpacer / factor : 0);
      charOffset = wordWidth - newWidth;
      characterElements.push(
        <g
          key={`char${character.variationIndex}`}
          transform={`translate(${charOffset} 0) scale(${factor})`}
          data-character={character.variationIndex ? '' : 'currentColor'}
        >
          {[...(svgCharacter.children ?? [])].map((path, index) => {
            const d = path.getAttribute('d');
            if (character.variationIndex) {
              return d ? <path key={index} d={d} fill={character.colors[index]}></path> : null;
            }
            return d ? <path key={index} d={d}></path> : null;
          })}
        </g>,
      );
    }

    const wordElement = (
      <g key={`word${Date.now()}`} data-word>
        {characterElements}
      </g>
    ) as HTMLElement;

    return {
      characterElements,
      dimensions: {
        width: wordWidth,
        height: wordHeight,
        spacing: charSpacer,
      },
      el: wordElement,
      fontSize,
      state: word,
    };
  }

  generateLine(showUserDesign = true, render = true, bleed = 0): LineGenerated {
    const wordsGenerated: WordGenerated[] = [];
    const wordsElements: HTMLElement[] = [];
    let k = 0;
    let wordOffset = 0;
    let fontSize = 0;
    let lineHeight = 0;
    let spacing = 0;
    let bleedLeftOffset = 0;

    do {
      const curWordState = this.poster.word.clone();

      if (!showUserDesign || k) {
        if (this.poster.isRandomColors) curWordState.shuffleColors();
        if (this.poster.isRandomWords) curWordState.shuffleCharacters(true);
      }

      const wordGenerated: WordGenerated = this.generateWord(curWordState);
      lineHeight = Math.max(lineHeight, wordGenerated.dimensions.height);
      fontSize = Math.max(fontSize, wordGenerated.fontSize);
      ({ spacing } = wordGenerated.dimensions);

      if (bleedLeftOffset > 0 - bleed / 2) {
        bleedLeftOffset -= wordGenerated.dimensions.width + wordGenerated.dimensions.spacing;
        wordOffset = bleedLeftOffset;
      } else {
        wordOffset = Math.max(0, wordOffset);
      }

      if (render) {
        wordGenerated.el.style.transform = `translate(${wordOffset}px, 0)`;
      }

      wordsGenerated.push(wordGenerated);
      wordsElements.push(wordGenerated.el);

      // offset has done enough
      if (bleedLeftOffset <= 0 - bleed / 2) {
        wordOffset += wordGenerated.dimensions.width + wordGenerated.dimensions.spacing;
      }
      k++;
    } while (wordOffset < this.poster.width + bleed / 2);

    const lineWidth = wordOffset - spacing;
    const lineElement = (
      <g key={`line${Date.now()}`} data-line>
        {wordsElements}
      </g>
    ) as HTMLElement;

    return {
      fontSize,
      dimensions: {
        width: lineWidth,
        height: lineHeight,
      },
      el: lineElement,
      wordsGenerated,
    };
  }

  generateCircle(scale = 1.5): CircleGenerated {
    const colorBg = this.poster.sticker.backgroundColor;
    const r = 191.5;
    const textVertCenterY = r / 2 + 15;
    const edgeGutter = 231.451 - r;
    const edgeXY = r * scale + edgeGutter;

    const date = new Date(this.poster.sticker.date);
    const dateMonth = format(date, 'MMM. dd');
    const dateTime = `${format(date, 'h:mm aaa')} PT`;
    const hostedLines = [];
    const maxCharsPerLine = 13;
    const hostedWords = this.poster.sticker.host.split(' ');

    const charCount = 0;
    for (const word of hostedWords) {
      if (
        !hostedLines.length ||
        word === '\n' ||
        hostedLines[hostedLines.length - 1].length + word.length >= maxCharsPerLine
      ) {
        hostedLines.push('');
      }

      if (word !== '\n') {
        hostedLines[hostedLines.length - 1] += ` ${word}`;
      }
    }

    const el = (
      <g
        id="circle-sticker"
        className={styles['design__circle']}
        {...{ transform: `translate(${edgeXY} ${edgeXY}) scale(${scale})` }}
      >
        <circle cx="0" cy="0" r={r} fill={colorBg} />
        <g transform="rotate(-15)">
          <text transform={`translate(0 ${0 - textVertCenterY})`} {...{ 'text-anchor': 'middle' }}>
            <tspan x="0" y="38.669">
              {hostedLines[0].toUpperCase().trim()}
            </tspan>
            <tspan x="0" y="83.669">
              {hostedLines.length > 1 && hostedLines[1].toUpperCase().trim()}
            </tspan>
          </text>
          <text transform={`translate(0 ${100 - textVertCenterY})`} {...{ 'text-anchor': 'middle' }}>
            <tspan x="0" y="71.6895">
              {dateMonth.toUpperCase()}
            </tspan>
          </text>
          <text transform={`translate(0 ${184 - textVertCenterY})`} {...{ 'text-anchor': 'middle' }}>
            <tspan x="0" y="38.669">
              {dateTime.toUpperCase()}
            </tspan>
          </text>
        </g>
      </g>
    ) as HTMLElement;

    return {
      el,
    };
  }

  renderPoster(rebuild = false): Node {
    if (rebuild) this.rebuild();

    // put lines together to fill poster

    const lines: HTMLElement[] = [];
    const lineSpacer = 10 * this.poster.scale;
    let j = 0;
    let wordCount = 0;
    let lineOffsetYNoRotation = 0;

    // create bleed area for worst possible rotation
    const worstRotationRadians = (45 * Math.PI) / 180;
    const worstBoundingWidth =
      this.poster.height * Math.abs(Math.sin(worstRotationRadians)) +
      this.poster.width * Math.abs(Math.cos(worstRotationRadians));
    const worstBoundingHeight =
      this.poster.width * Math.abs(Math.sin(worstRotationRadians)) +
      this.poster.height * Math.abs(Math.cos(worstRotationRadians));
    const worstBleedHoriz = Math.abs(worstBoundingWidth - this.poster.width);
    const worstBleedVert = Math.abs(worstBoundingHeight - this.poster.height);

    // create bleed lines outside normal viewport
    const lineFirstGenerated = this.generateLine(!wordCount, true, worstBleedHoriz);
    const lineHeight = lineFirstGenerated.dimensions.height;

    const bleedLineCountH = Math.ceil(worstBleedVert / lineHeight / 2);
    const bleedLineHeight = bleedLineCountH * lineHeight * 2;
    const bleedLinesUp = bleedLineCountH;

    do {
      const lineGenerated = !j ? lineFirstGenerated : this.generateLine(!wordCount, true, worstBleedHoriz);
      const { wordsGenerated } = lineGenerated;

      // calculate words offscreen for each line
      // this will be different for each line if the words leading in are different from each other

      const bleedWidth = 0;

      // position line

      lineOffsetYNoRotation = (lineHeight + lineSpacer) * (j - bleedLinesUp);

      const lineOffsetX = 0 - bleedWidth;
      const lineOffsetY = lineOffsetYNoRotation;
      const lineElement: HTMLElement = lineGenerated.el;

      lineElement.style.transform = `translate(${lineOffsetX}px, ${lineOffsetY}px)`;
      lines.push(lineElement);
      j++;
      wordCount += wordsGenerated.length;
    } while (lineOffsetYNoRotation < this.poster.height + bleedLineHeight / 2);

    const $linesWrapper = (<g>{lines}</g>) as SVGElement;

    $linesWrapper.style.transformOrigin = `${this.poster.width / 2}px ${this.poster.height / 2}px`;
    $linesWrapper.style.transform = `rotate(${this.poster.rotation}deg)`;

    // if speaker, generate circle

    let $circle = <g id="circle-sticker"></g>;

    if (RoleController.role !== Role.PUBLIC && RoleController.role !== Role.SPEAKER_NO_STICKER) {
      $circle = this.generateCircle().el;
    }

    // generate footer

    const data = AssetsController.getFooter('light', '2021');
    const [width, height] = data.dimension;
    const footerWidth = this.poster.width;
    const factor = footerWidth / width;
    const footerHeight = factor * height;

    const $footer = (
      <g transform={`translate(0 ${this.poster.height - footerHeight}) scale(${factor})`} data-footer>
        {[...data.children].map((path, index) => {
          const pathD = path.getAttribute('d');
          const pathFill = path.getAttribute('fill');
          const pathWidth = path.getAttribute('width');
          const pathHeight = path.getAttribute('height');

          if (path.nodeName === 'path') {
            return <path key={index} d={pathD} fill={pathFill}></path>;
          } else if (path.nodeName === 'circle') {
            return <circle key={index} width={pathWidth} height={pathHeight} fill={pathFill}></circle>;
          } else if (path.nodeName === 'rect') {
            return <rect key={index} width={pathWidth} height={pathHeight} fill={pathFill}></rect>;
          }

          return null;
        })}
      </g>
    );

    // generate poster

    return (
      <figure
        style={{
          position: 'relative',
          width: '100%',
          height: 'auto',
          paddingTop: `${(this.poster.height / this.poster.width) * 100}%`,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${this.poster.width} ${this.poster.height}`}
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
          }}
        >
          <defs>
            <style type="text/css">
              {`@font-face {
                  font-family: SharpSansNo2;
                  font-weight: 900;
                  font-style: normal;
                  src: url(data:application/font-woff;charset=utf-8;base64,${SharpSansDisplayNo2});
              }`}
            </style>
          </defs>

          <rect data-background width={this.poster.width} height={this.poster.height} />
          <g data-inner-wrapper>
            {$linesWrapper}
            {$circle}
            {$footer}
          </g>
        </svg>
      </figure>
    );
  }

  // getters

  get rotationMin(): number {
    return this.config.rotationMin;
  }

  get rotationMax(): number {
    return this.config.rotationMax;
  }

  get scaleMin(): number {
    return this.config.scaleMin;
  }

  get scaleMax(): number {
    return this.config.scaleMax;
  }

}

export default Design;
