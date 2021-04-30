
import Editor from '../assets/js/controllers/editor';
import ThemeController from '../assets/js/controllers/theme';

import Button from './buttons/button';
import ButtonToggle from './buttons/toggle';

import SVGDsgnWknd from '../assets/vectors/dsgn-wknd';

import styles from './input.module.scss';
import WordState from './poster/word-state';

interface Reference {
  generate?: HTMLInputElement | null,
  input?: HTMLInputElement | null,
  output?: HTMLElement | null,
  randomizeColors?: HTMLInputElement | null,
  randomizeEachWord?: HTMLInputElement | null,
  shuffle?: HTMLInputElement | null,
}

export class InputElement extends HTMLElement {

  static selector = 'input-element';

  ref: Reference = {};

  inputWord: WordState;

  constructor() {
    super();
    this.inputWord = new WordState('', ThemeController.theme);
    Editor.attachWord(this.inputWord);
  }

  cleanValue(value: string) {
    return value.replace(/[^A-Za-z&@#']/g, '').toLowerCase();
  }

  renderInputCharacters = () => {
    if (this.ref.output) {
      Editor.renderWord(this.inputWord, this.ref.output, this.addPhraseListeners);
    }
  }

  // add / remove listeners ------------------------------------------------ //

  addPhraseListeners = ($characters: NodeList) => {
    for (let i = 0; i < $characters.length; i++) {
      const $character = $characters[i] as HTMLElement;
      $character.removeEventListener('click', this.#onCharacterClick);
      $character.addEventListener('click', this.#onCharacterClick);
    }
  }

  // listener methods ------------------------------------------------------ //

  // click character to change design
  #onCharacterClick = (e: MouseEvent) => {
    const $target: HTMLElement = e.currentTarget as HTMLElement;
    if ($target) {
      Editor.nextCharacter(this.inputWord, parseInt($target.dataset.index ?? '0'), $target);
    }
  }

  // when typing, re-render new characters
  #onInputInput = (e: MouseEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLInputElement;
    const value = this.cleanValue(target.value);
    target.value = value;

    this.inputWord.feed(value);
    this.renderInputCharacters();
  }

  // when clicking input, emulate focus state (cursor is fake)
  #onInputClick = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLInputElement;
    const value = this.cleanValue(target.value);
    const { length } = value;
    target.setSelectionRange(length, length);
  }

  #onInputKeydown = (e: KeyboardEvent) => {
    if (e.keyCode === 37 || e.keyCode === 39) e.preventDefault();
  }

  #onOutputClick = () => {
    if (this.ref.input) this.ref.input.focus();
  }

  // generate button: render current design into posters
  #onGenerateClick = () => {
    Editor.renderPosters();
  }

  // randomize colors
  #onRandomizeColors = () => {
    // Characters.updateConfig({ randomizeColors: this.ref.randomizeColors?.children[0].hasAttribute('data-randomize-each-word') });
    Editor.renderPosters();
  }

  // randomize each word
  #onRandomizeEachWord = () => {
    // Characters.updateConfig({ randomizeEachWord: this.ref.randomizeEachWord?.children[0].hasAttribute('data-randomize-each-word') });
    Editor.renderPosters();
  }

  // shuffle button: shuffle phrase design
  #onShuffleClick = () => {
    if (this.ref.generate) {
      Editor.shuffleWord(this.inputWord, this.ref.output, (value) => {
        const $characters: NodeList | undefined = this.ref.output?.querySelectorAll('[data-character]');
        if ($characters) {
          this.addPhraseListeners($characters);
        }
      });
      Editor.renderPosters();
    }
  }

  // built in callback once JSX rendered
  connectedCallback() {
    this.ref.input = this.querySelector('input');
    if (this.ref.input) {
      this.ref.input.focus();
      this.ref.input.addEventListener('input', this.#onInputInput);
      this.ref.input.addEventListener('keydown', this.#onInputKeydown);
      this.ref.input.addEventListener('click', this.#onInputClick);
    }

    this.ref.output = this.querySelector<HTMLInputElement>('[data-output]');
    if (this.ref.output) {
      this.ref.output.addEventListener('click', this.#onOutputClick);
    }

    this.ref.generate = this.querySelector<HTMLInputElement>('[data-generate]');
    if (this.ref.generate) {
      this.ref.generate.addEventListener('click', this.#onGenerateClick);
    }

    this.ref.randomizeColors = this.querySelector<HTMLInputElement>('[data-randomize-colors]');
    if (this.ref.randomizeColors) {
      this.ref.randomizeColors.addEventListener('click', this.#onRandomizeColors);
    }

    this.ref.randomizeEachWord = this.querySelector<HTMLInputElement>('[data-randomize-each-word]');
    if (this.ref.randomizeEachWord) {
      this.ref.randomizeEachWord.addEventListener('click', this.#onRandomizeEachWord);
    }

    this.ref.shuffle = this.querySelector<HTMLInputElement>('[data-shuffle]');
    if (this.ref.shuffle) {
      this.ref.shuffle.addEventListener('click', this.#onShuffleClick);
    }
  }

}

// connect markup to javascript class -------------------------------------- //

if (!window.customElements.get(InputElement.selector)) {
  window.customElements.define(InputElement.selector, InputElement);
}

// JSX template ------------------------------------------------------------ //

const Input: FC = () => (
  <div element={InputElement.selector} className={styles['input']}>
    <input type="text" maxLength={16} />
    <div className={styles['input__logo']}>
      <figure>
        <SVGDsgnWknd />
      </figure>
    </div>
    <p>Type your name and click a letter to pick the design you like.</p>
    <div className={styles['input__output']} data-output></div>
    <div className={styles['input__buttons-wrapper']}>
      <div className={styles['input__generate']} data-generate>
        <Button big={true}>Generate my poster</Button>
      </div>
      <div className={styles['input__shuffle']} data-shuffle>
        <Button big={true}>Shuffle</Button>
      </div>
    </div>
    <div className={styles['input__options-wrapper']}>
      <div data-randomize-each-word>
        <ButtonToggle>Randomize Each Word</ButtonToggle>
      </div>
      <div data-randomize-colors>
        <ButtonToggle>Randomize Colors</ButtonToggle>
      </div>
    </div>
    <button className={styles['input__clear']}>Clear</button>
  </div>
);

export default Input;