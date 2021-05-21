import ThemeController from './theme';

import PosterState from '../../../components/poster/poster-state';
import WordState from '../../../components/poster/word-state';

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

class EditorController {

  posters: Array<PosterState>;
  currentPoster: PosterState;
  currentWord: WordState;

  constructor() {
    try {
      this.currentPoster = new PosterState(ThemeController.theme);
    } catch (e) {
      console.warn(e);
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

}

export default new EditorController();