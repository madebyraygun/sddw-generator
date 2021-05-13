
import Editor, { CharacterCallback } from '../../assets/js/controllers/editor';
import ThemeController from '../../assets/js/controllers/theme';

import Button from '../buttons/button';
import ButtonToggle from '../buttons/toggle';
import RangeSlider from '../controls/range-slider';

import styles from './editor-controls.module.scss';
import WordState from '../poster/word-state';
import EditorView from './editor-view';

interface Reference {
  generate?: HTMLInputElement | null,
  input?: HTMLInputElement | null,
  inputPlaceholder?: HTMLElement | null,
  inputRendered?: HTMLElement | null,
  randomizeColors?: HTMLInputElement | null,
  randomizeEachWord?: HTMLInputElement | null,
  shuffle?: HTMLInputElement | null,
}

export class EditorControlsElement extends HTMLElement {

  static selector = 'editor-controls-element';

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
    if (this.ref.inputRendered) {
      Editor.renderWord(this.inputWord, this.ref.inputRendered, this.addPhraseListeners);
    }
  }

  // add / remove listeners ------------------------------------------------ //

  addPhraseListeners = ($phrase: HTMLElement) => {
    const $characters = $phrase.children;
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
      Editor.nextCharacter(this.inputWord, parseInt($target.dataset.index || '0'), this.ref.inputRendered, this.#onCharacterEdit);
    }
  }

  #onCharacterEdit = (e:CharacterCallback) => {
    if (e.target) {
      this.addPhraseListeners(e.target);
    }
  }

  // when typing, re-render new characters
  #onInputInput = (e: MouseEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLInputElement;
    const value = this.cleanValue(target.value);
    target.value = value;

    if (value && this.ref.inputPlaceholder) {
      this.ref.inputPlaceholder.setAttribute('data-hidden', '');
    } else {
      this.ref.inputPlaceholder?.removeAttribute('data-hidden');
    }

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
  #onRandomizeColors = (e: MouseEvent) => {
    const $target = e.currentTarget as HTMLElement;
    if ($target) {
      Editor.randomizeColors($target.dataset.active === 'true');
    }
  }

  // randomize each word
  #onRandomizeEachWord = (e: MouseEvent) => {
    const $target = e.currentTarget as HTMLElement;
    if ($target) {
      Editor.randomizeEachWord($target.dataset.active === 'true');
    }
  }

  // shuffle button: shuffle phrase design
  #onShuffleClick = () => {
    if (this.ref.generate) {
      Editor.shuffleWord(this.inputWord, this.ref.inputRendered, (value) => {
        const $phrase: HTMLElement | null = this.ref.inputRendered?.querySelector('[data-phrase]') as HTMLElement;
        if ($phrase) {
          this.addPhraseListeners($phrase);
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

    this.ref.inputPlaceholder = this.querySelector<HTMLInputElement>('[data-input-placeholder]');

    this.ref.inputRendered = this.querySelector<HTMLInputElement>('[data-input-rendered]');
    if (this.ref.inputRendered) {
      this.ref.inputRendered.addEventListener('click', this.#onOutputClick);
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

if (!window.customElements.get(EditorControlsElement.selector)) {
  window.customElements.define(EditorControlsElement.selector, EditorControlsElement);
}

// JSX template ------------------------------------------------------------ //

const EditorControls: FC = () => (
  <div element={EditorControlsElement.selector} className={styles['editor-controls']}>
    <EditorView className={styles['editor-controls__view-inputs-primary']}>
      <input className={styles['editor-controls__input-text']} type="text" maxLength={16} />
      <h2>Let&apos;s Create a <strong>Poster!</strong></h2>
      <p>[TYPE YOUR NAME, ROLLOVER THE LETTERS AND PICK A COMBINATION]</p>
      <div className={styles['editor-controls__input-placeholder']}>
        <div className={styles['editor-controls__input-placeholder-text']} data-input-placeholder>
          <span className='heading-display'>Your Name</span>
        </div>
        <figure className={styles['editor-controls__input-placeholder-box']}></figure>
        <div className={styles['editor-controls__input-rendered']} data-input-rendered></div>
      </div>
      <div className={styles['editor-controls__buttons-wrapper']}>
        <Button big={true} className={styles['editor-controls__generate']} dataName={{ 'data-generate': '' }}>Generate my poster</Button>
      </div>
    </EditorView>
    <EditorView className= {styles['editor-controls__view-inputs-poster']}>
      <Button className={styles['editor-controls__button-restart']}>Restart</Button>
      <div className={styles['editor-controls__poster-column']}>
        <div className={styles['editor-controls__poster']} data-poster><svg viewBox="0 0 1350 1800"></svg></div>
        <RangeSlider className={styles['editor_controls__slider']} name='poster-scale'>Adjust</RangeSlider>
      </div>
      <Button className={styles['editor-controls__button-finish']}>Finish</Button>

      {/* controls */}
      <div className={styles['editor-controls__buttons-wrapper']}>
        <Button big={true} className={styles['editor-controls__generate']} dataName={{ 'data-generate': '' }}>Generate my poster</Button>
        <Button big={true} className={styles['editor-controls__shuffle']} dataName={{ 'data-shuffle': '' }}>Shuffle</Button>
      </div>
      <div className={styles['editor-controls__options-wrapper']}>
        <ButtonToggle dataName={{ 'data-randomize-each-word': '' }}>Randomize Each Word</ButtonToggle>
        <ButtonToggle dataName={{ 'data-randomize-colors': '' }}>Randomize Colors</ButtonToggle>
      </div>
      <button className={styles['editor-controls__clear']}>Clear</button>

    </EditorView>
  </div>
);

export default EditorControls;