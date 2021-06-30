import ThemeController from './theme';

import PosterState from '../../../components/poster/poster-state';
import WordState from '../../../components/poster/word-state';
import Controller from './controller';
import EventController from './event';
import { EventEmitter } from 'events';
import Editor from '../constants/editor';

export interface CharacterCallback {
  word: WordState,
  characterIndex: number,
  target?: HTMLElement | null,
  container?: HTMLElement | null,
}
export interface WordCallback {
  word: WordState,
  target?: HTMLElement | null,
  container?: HTMLElement | null,
}

class EditorController implements Controller {

  posters: Array<PosterState>;
  currentPoster: PosterState;
  currentWord: WordState;
  sectionEmitter: EventEmitter;

  flags: {
    isInitialized: boolean
  } = {
    isInitialized: false
  }

  constructor() {
    this.initialize();
  }

  initialize() {
    if (!this.flags.isInitialized) {
      this.flags.isInitialized = true;
      this.currentPoster = new PosterState(ThemeController.theme);
      this.sectionEmitter = EventController.getEmitterAlways(Editor.SECTION_EMITTER);
    }
  }

  // render phrases and characters

  nextCharacter(word: WordState, characterIndex: number, $container?: HTMLElement | null, callback?: (value: CharacterCallback) => void) {
    word.nextCharacterByIndex(characterIndex);

    let $word: HTMLElement | null = null;
    if ($container) {
      $word = this.renderWord(word, $container);
    }

    if (callback) {
      callback({
        word, characterIndex, target: $word, container: $container
      });
    }
  }

  prevCharacter(word: WordState, characterIndex: number, $container?: HTMLElement | null, callback?: (value: CharacterCallback) => void) {
    word.prevCharacterByIndex(characterIndex);

    let $word: HTMLElement | null = null;
    if ($container) {
      $word = this.renderWord(word, $container);
    }

    if (callback) {
      callback({
        word, characterIndex, target: $word, container: $container
      });
    }
  }

  shuffleCharacter(word: WordState, characterIndex: number, $container?: HTMLElement | null, callback?: (value: CharacterCallback) => void) {
    word.shuffleCharacterByIndex(characterIndex);

    let $word: HTMLElement | null = null;
    if ($container) {
      $word = this.renderWord(word, $container);
    }

    if (callback) {
      callback({
        word, characterIndex, target: $word, container: $container
      });
    }
  }

  // magic button fun modifications

  shuffleWord(word: WordState, $container?: HTMLElement | null, callback?: (value: WordCallback) => void) {
    word.shuffle();

    let $word: HTMLElement | null = null;
    if ($container) {
      $word = this.renderWord(word, $container);
    }

    if (callback) {
      callback({ word, target: $word, container: $container });
    }
  }

  randomizeColors(isActive = false) {
    this.currentPoster.isRandomColors = isActive;
  }

  randomizeEachWord(isActive = false) {
    this.currentPoster.isRandomWords = isActive;
  }

  // set scale

  setRotation(value: number) {
    const { design } = this.currentPoster;
    this.currentPoster.rotation = design.rotationMin + value / 100 * design.rotationMax * 2;
  }

  setScale(value: number) {
    const { design } = this.currentPoster;
    this.currentPoster.scale = design.scaleMin + value / 100 * design.scaleMax;
  }

  // connect primary input (or database stored) word object

  attachWord(word: WordState) {
    this.currentWord = word;
    this.currentPoster.attachWord(this.currentWord);
  }

  // render word to container

  renderWord(word: WordState, $container?: HTMLElement | null, renderedHeight = this.currentWord.theme.inputRenderedHeight) {
    const $word:HTMLElement = word.renderInput(renderedHeight);

    if ($container) {
      $word.setAttribute('data-phrase', '');
      $container.innerHTML = '';
      $container.appendChild($word);
    }

    return $word;
  }

  // render poster to container

  renderPoster(poster: PosterState, target?: HTMLElement | null) {
    const $output: HTMLElement = poster.render() as HTMLElement;

    if (target) {
      target.innerHTML = $output.outerHTML;
    }

    return $output;
  }

  renderCurrentPosterToContainer($container: HTMLElement = document.body) {
    if ($container) {
      const $posterWrappers: NodeList = $container.querySelectorAll('[data-poster]');
      for (const $posterWrapper of $posterWrappers) {
        this.renderPoster(this.currentPoster, $posterWrapper as HTMLElement);
      }
    }
  }

  renderCurrentPosterToElement($target: HTMLElement, poster?: PosterState, rebuild = false) {
    const posterState = poster ?? this.currentPoster;
    if ($target) {
      if (rebuild) posterState.rebuild();
      this.renderPoster(posterState, $target);
    }
  }

  shuffleAndRenderPosterToElement($target: HTMLElement, poster?: PosterState) {
    const posterState = poster ?? this.currentPoster;
    if ($target) {
      posterState.shuffle();
      this.renderCurrentPosterToElement($target, posterState);
    }
  }

  // download poster

  download($target: HTMLElement, scale = 1) {
    const $svgElement:SVGElement | null = $target.querySelector<SVGElement>('svg');
    if ($svgElement) {
      const $clonedSvgElement = $svgElement.cloneNode(true) as SVGElement;

      // make any tweaks to colors (such as replacing css variables with calculated values)
      const $background = $svgElement.querySelector('[data-background]') as SVGGraphicsElement;
      const $clonedBackground = $clonedSvgElement.querySelector('[data-background]') as SVGGraphicsElement;
      $clonedBackground.setAttribute('fill', getComputedStyle($background).fill);

      const $currentColorCharacters = $svgElement.querySelectorAll('[data-character="currentColor"]');
      const $clonedCurrentColorCharacters = $clonedSvgElement.querySelectorAll('[data-character="currentColor"]');
      for (let i = 0; i < $clonedCurrentColorCharacters.length; i++) {
        const $character = $currentColorCharacters[i];
        const $clonedCharacter = $clonedCurrentColorCharacters[i];
        $clonedCharacter.setAttribute('fill', getComputedStyle($character).fill);
      }

      const $textElements = $svgElement.querySelectorAll('text');
      const $clonedTextElements = $clonedSvgElement.querySelectorAll('text');
      for (let i = 0; i < $clonedTextElements.length; i++) {
        const $textElement = $textElements[i];
        const $clonedTextElement = $clonedTextElements[i];
        const computedStyles = getComputedStyle($textElement);
        const attributes = {
          color: computedStyles.color,
          fill: computedStyles.color,
          'font-family': 'SharpSansNo2',
          'font-size': computedStyles.fontSize,
          'font-weight': computedStyles.fontWeight,
          'letter-spacing': computedStyles.letterSpacing
        };
        for (const key in attributes) {
          const value = key ? attributes[key] : '';
          if (value) {
            $clonedTextElement.setAttribute(key, value);
          }
        }
      }

      // export current state to HTML
      const data = new XMLSerializer().serializeToString($clonedSvgElement);

      // generate blob with base64 data of image
      const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(blob);

      // generate image with canvas data (to convert to PNG and other formats)
      const image = new Image();
      document.body.appendChild(image);
      const canvas = document.createElement('canvas');
      canvas.width = this.currentPoster.width * scale;
      canvas.height = this.currentPoster.height * scale;
      const context = canvas.getContext('2d');
      let png: string;

      // wait for image to load
      image.onload = () => {
        if (context) {
          context.drawImage(image, 0, 0, this.currentPoster.width * scale, this.currentPoster.height * scale);
          png = canvas.toDataURL();

          // trigger download
          const download = function (href, name) {
            const link = document.createElement('a');
            link.download = name;
            link.style.opacity = '0';
            document.body.append(link);
            link.href = href;
            link.click();
            link.remove();
          };
          download(png, 'sddw-poster.png');
        }
      };
      image.src = blobURL;
    }
  }

}

export default new EditorController();