import JsPDF from 'jspdf';
import JsZip from 'jszip';
import { saveAs } from 'file-saver';

import RoleController from './role';
import ThemeController from './theme';

import PosterState from '../../../components/poster/poster-state';
import WordState from '../../../components/poster/word-state';
import Controller from './controller';
import EventController from './event';
import { EventEmitter } from 'events';
import Editor from '../constants/editor';
import Role from '../constants/role';

export interface CharacterCallback {
  word: WordState;
  characterIndex: number;
  target?: HTMLElement | null;
  container?: HTMLElement | null;
}
export interface WordCallback {
  word: WordState;
  target?: HTMLElement | null;
  container?: HTMLElement | null;
}

class EditorController implements Controller {

  posters: Array<PosterState>;
  currentPoster: PosterState;
  currentWord: WordState;
  sectionEmitter: EventEmitter;

  flags: {
    isInitialized: boolean;
  } = {
    isInitialized: false,
  };

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

  nextCharacter(
    word: WordState,
    characterIndex: number,
    $container?: HTMLElement | null,
    callback?: (value: CharacterCallback) => void,
  ) {
    word.nextCharacterByIndex(characterIndex);

    let $word: HTMLElement | null = null;
    if ($container) {
      $word = this.renderWord(word, $container);
    }

    if (callback) {
      callback({
        word,
        characterIndex,
        target: $word,
        container: $container,
      });
    }
  }

  prevCharacter(
    word: WordState,
    characterIndex: number,
    $container?: HTMLElement | null,
    callback?: (value: CharacterCallback) => void,
  ) {
    word.prevCharacterByIndex(characterIndex);

    let $word: HTMLElement | null = null;
    if ($container) {
      $word = this.renderWord(word, $container);
    }

    if (callback) {
      callback({
        word,
        characterIndex,
        target: $word,
        container: $container,
      });
    }
  }

  shuffleCharacter(
    word: WordState,
    characterIndex: number,
    $container?: HTMLElement | null,
    callback?: (value: CharacterCallback) => void,
  ) {
    word.shuffleCharacterByIndex(characterIndex);

    let $word: HTMLElement | null = null;
    if ($container) {
      $word = this.renderWord(word, $container);
    }

    if (callback) {
      callback({
        word,
        characterIndex,
        target: $word,
        container: $container,
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
    this.currentPoster.rotation = design.rotationMin + (value / 100) * design.rotationMax * 2;
  }

  setScale(value: number) {
    const { design } = this.currentPoster;
    this.currentPoster.scale = design.scaleMin + (value / 100) * design.scaleMax;
  }

  // connect primary input (or database stored) word object

  attachWord(word: WordState) {
    this.currentWord = word;
    this.currentPoster.attachWord(this.currentWord);
  }

  // render word to container

  renderWord(
    word: WordState,
    $container?: HTMLElement | null,
    renderedHeight = this.currentWord.theme.inputRenderedHeight,
  ) {
    const $word: HTMLElement = word.renderInput(renderedHeight);

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

  renderSticker(
    $target: HTMLElement,
    props: { host?: string; date?: Date; backgroundColor?: string },
    poster?: PosterState,
  ) {
    const posterState = poster ?? this.currentPoster;
    if (props.host || props.host === '') posterState.sticker.host = props.host;
    if (props.date) posterState.sticker.date = props.date;
    if (props.backgroundColor) posterState.sticker.backgroundColor = props.backgroundColor;
    if ($target) {
      this.renderCurrentPosterToElement($target, posterState);
    }
  }

  // download poster

  download($target: HTMLElement, isPrint = false) {
    const $svgElement: SVGElement | null = $target.querySelector<SVGElement>('svg');
    if ($svgElement) {
      // show processing
      EventController.getEmitter(Editor.PROCESSING_EMITTER)?.emit(Editor.PROCESSING);

      // clone svg element to make changes
      const $clonedSvgElement = $svgElement.cloneNode(true) as SVGElement;

      // make any tweaks to colors (such as replacing css variables with calculated values)
      const $background = $svgElement.querySelector('[data-background]') as SVGGraphicsElement;
      const $clonedBackground = $clonedSvgElement.querySelector('[data-background]') as SVGGraphicsElement;
      $clonedBackground.setAttribute('fill', getComputedStyle($background).fill);

      const $currentColorCharacters = $svgElement.querySelectorAll('[data-character="currentColor"]');
      const $clonedCurrentColorCharacters = $clonedSvgElement.querySelectorAll(
        '[data-character="currentColor"]',
      );
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
          'letter-spacing': computedStyles.letterSpacing,
        };
        for (const key in attributes) {
          const value = key ? attributes[key] : '';
          if (value) {
            $clonedTextElement.setAttribute(key, value);
          }
        }
      }

      // color footer based on css variables
      const $pathElements = $svgElement.querySelectorAll('path, rect, circle');
      const $clonedPathElements = $clonedSvgElement.querySelectorAll('path, rect, circle');
      for (let i = 0; i < $clonedPathElements.length; i++) {
        const $pathElement = $pathElements[i];
        const $clonedPathElement = $clonedPathElements[i];
        const computedStyles = getComputedStyle($pathElement);
        const attributes = {
          fill: computedStyles.fill,
        };
        for (const key in attributes) {
          const value = key ? attributes[key] : '';
          if (value) {
            $clonedPathElement.setAttribute(key, value);
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
      const widthForPrint = 11 * 300; // (18 inches at 300 dpi)
      const heightForPrint = widthForPrint * (this.currentPoster.height / this.currentPoster.width);

      const widthForWeb = 1080; // (instgram max)
      const heightForWeb = widthForWeb * (this.currentPoster.height / this.currentPoster.width);

      // declare zip to start storing files

      const zip: JsZip = new JsZip();
      const filePromises = [];

      // png for everyone
      if (!isPrint) {
        filePromises.push(
          this.generateImage(blobURL, widthForWeb, heightForWeb, 'png').then(({ imageData, fileType }) => {
            zip.file(`SDDW ${new Date().getFullYear()} - Web & Social Poster.${fileType}`, imageData, {
              base64: true,
            });
          }),
        );
      }

      // public does not get to download pdf
      if (isPrint) {
        filePromises.push(
          this.generateImage(blobURL, widthForPrint, heightForPrint, 'pdf').then(
            ({ imageData, fileType }) => {
              zip.file(`SDDW ${new Date().getFullYear()} - Print Poster.${fileType}`, imageData);
            },
          ),
        );
      }

      Promise.all(filePromises).then(() => {
        zip.generateAsync({ type: 'blob' }).then((content) => {
          saveAs(content, 'poster.zip');
          // hide processing
          EventController.getEmitter(Editor.PROCESSING_EMITTER)?.emit(Editor.PROCESSING_COMPLETE);
        });
      });
    }
  }

  generateImage(dataUrl: string, width: number, height: number, fileType = 'png') {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');

      // wait for image to load
      image.onload = () => {
        if (context) {
          context.drawImage(image, 0, 0, width, height);

          // generate png
          const png = canvas.toDataURL('image/png');

          if (fileType === 'pdf') {
            const pdf = new JsPDF({
              unit: 'px',
              format: [width, height],
            });

            pdf.addImage(png, 'png', 0, 0, width, height);
            resolve({ imageData: pdf.output('blob'), fileType: 'pdf' });
          } else {
            const pngBase64 = png.replace(/^data:image\/(png|jpg);base64,/, '');
            resolve({ imageData: pngBase64, fileType: 'png' });
          }
        } else {
          reject(null);
        }
      };
      image.src = dataUrl;
    });
  }

}

export default new EditorController();
