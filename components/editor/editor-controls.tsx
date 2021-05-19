import Editor, { CharacterCallback } from '../../assets/js/controllers/editor';
import AssetsController from '../../assets/js/controllers/assets';
import ResizeController, { ResizeSubscriber } from '../../assets/js/controllers/resize';
import ThemeController from '../../assets/js/controllers/theme';

import Button from '../buttons/button';
import ButtonClose from '../buttons/close';
import ButtonToggle from '../buttons/toggle';
import RadioSelector from '../controls/radio-selector';
import RangeSlider, { RangeSliderElement } from '../controls/range-slider';
import SddwPoster from '../poster/poster';

import styles from './editor-controls.module.scss';
import WordState from '../poster/word-state';
import EditorView from './editor-view';
import ButtonIcon from '../buttons/icon';

interface Reference {
  el?: HTMLElement | null,
  inputBackgroundColor?: HTMLElement| null,
  inputBox?: HTMLElement | null,
  inputPlaceholder?: HTMLElement | null,
  inputPlaceholderSpan?: HTMLElement | null,
  inputRendered?: HTMLElement | null,
  inputRotation?: RangeSliderElement| null,
  inputScale?: RangeSliderElement | null,
  poster?: HTMLElement | null,
  viewEdit?: HTMLElement | null,
  shuffle?: HTMLInputElement | null,
  generate?: HTMLInputElement | null,
  input?: HTMLInputElement | null,
  randomizeColors?: HTMLInputElement | null,
  randomizeEachWord?: HTMLInputElement | null,
}

interface Controllers {
  resize?: ResizeSubscriber
}

export class EditorControlsElement extends HTMLElement {

  static selector = 'editor-controls-element';

  controllers:Controllers = {};

  ref: Reference = {};

  inputWord: WordState;

  constructor() {
    super();
    const Filter = require('bad-words');
    this.filter = new Filter({ exclude: ['fart', 'poop'] });
    this.inputWord = new WordState('', ThemeController.theme);
    Editor.attachWord(this.inputWord);
  }

  cleanValue(value: string) {
    let cleanValue = '';
    for (let i = 0; i < value.length; i++) {
      const glyph = value[i].toLowerCase();
      if (AssetsController.allowedCharacters.indexOf(glyph) >= 0) {
        cleanValue += glyph;
      }
    }
    return cleanValue;
  }

  renderInputCharacters = () => {
    if (this.ref.inputRendered) {
      Editor.renderWord(this.inputWord, this.ref.inputRendered, this.addPhraseListeners);
      this.resizeInputBox();
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

    const filteredValue = value ? this.filter.clean(value) : '';

    this.inputWord.feed(filteredValue);
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
    if (this.ref.poster) {
      Editor.renderCurrentPosterToElement(this.ref.poster);
      window.scrollTo(0, this.ref.viewEdit?.offsetTop ?? 0);
    }
  }

  // randomize colors
  #onRandomizeColors = (e: MouseEvent) => {
    const $target = e.currentTarget as HTMLElement;
    if ($target) {
      Editor.randomizeColors($target.dataset.active === 'true');
      if (this.ref.poster) {
        Editor.renderCurrentPosterToElement(this.ref.poster);
      }
    }
  }

  // randomize each word
  #onRandomizeEachWord = (e: MouseEvent) => {
    const $target = e.currentTarget as HTMLElement;
    if ($target) {
      Editor.randomizeEachWord($target.dataset.active === 'true');
      if (this.ref.poster) {
        Editor.renderCurrentPosterToElement(this.ref.poster);
      }
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
      if (this.ref.poster) {
        Editor.shuffleAndRenderPosterToElement(this.ref.poster);
      }
    }
  }

  #onRotationChange = (e) => {
    Editor.setRotation(e.state.valueLerped);
    if (this.ref.poster) {
      Editor.renderCurrentPosterToElement(this.ref.poster);
    }
  }

  #onScaleChange = (e) => {
    Editor.setScale(e.state.valueLerped);
    if (this.ref.poster) {
      Editor.renderCurrentPosterToElement(this.ref.poster);
    }
  }

  // built in callback once JSX rendered
  connectedCallback() {
    this.ref.el = this;

    // html elements
    this.ref.inputBox = this.ref.el.querySelector<HTMLElement>('[data-input-box]');
    this.ref.inputPlaceholder = this.ref.el.querySelector<HTMLElement>('[data-input-placeholder]');
    this.ref.inputPlaceholderSpan = this.ref.inputPlaceholder?.children[0] as HTMLElement;
    this.ref.poster = this.ref.el?.querySelector<HTMLElement>('[data-poster]');
    this.ref.viewEdit = this.ref.el?.querySelector<HTMLElement>('[data-view-edit]');

    // primary input element
    this.ref.input = this.ref.el.querySelector('input');
    if (this.ref.input) {
      this.ref.input.focus();
      this.ref.input.addEventListener('input', this.#onInputInput);
      this.ref.input.addEventListener('keydown', this.#onInputKeydown);
      this.ref.input.addEventListener('click', this.#onInputClick);
    }

    // rendered input text (using special characters)
    this.ref.inputRendered = this.ref.el.querySelector<HTMLInputElement>('[data-input-rendered]');
    if (this.ref.inputRendered) {
      this.ref.inputRendered.addEventListener('click', this.#onOutputClick);
    }

    // range selector - rotation
    this.ref.inputRotation = this.ref.el.querySelector<RangeSliderElement>('[data-range-rotation]');
    if (this.ref.inputRotation) {
      this.ref.inputRotation.emitter.on(RangeSliderElement.CHANGE, this.#onRotationChange);
    }

    // range selector - input
    this.ref.inputScale = this.ref.el.querySelector<RangeSliderElement>('[data-range-scale]');
    if (this.ref.inputScale) {
      this.ref.inputScale.emitter.on(RangeSliderElement.CHANGE, this.#onScaleChange);
    }

    // generate button
    this.ref.generate = this.ref.el.querySelector<HTMLInputElement>('[data-generate]');
    if (this.ref.generate) {
      this.ref.generate.addEventListener('click', this.#onGenerateClick);
    }

    // randomize color toggle
    this.ref.randomizeColors = this.ref.el.querySelector<HTMLInputElement>('[data-randomize-colors]');
    if (this.ref.randomizeColors) {
      this.ref.randomizeColors.addEventListener('click', this.#onRandomizeColors);
    }

    // randomize word characters toggle
    this.ref.randomizeEachWord = this.ref.el.querySelector<HTMLInputElement>('[data-randomize-each-word]');
    if (this.ref.randomizeEachWord) {
      this.ref.randomizeEachWord.addEventListener('click', this.#onRandomizeEachWord);
    }

    // shuffle button
    this.ref.shuffle = this.ref.el.querySelector<HTMLInputElement>('[data-shuffle]');
    if (this.ref.shuffle) {
      this.ref.shuffle.addEventListener('click', this.#onShuffleClick);
    }

    // listen for page resize
    this.controllers.resize = ResizeController.set({
      update: this.#onResizeUpdate,
      render: this.#onResizeRender
    });
  }

  #onResizeUpdate = ():boolean => {
    return true;
  }

  #onResizeRender = () => {
    this.resizeInputBox();
  }

  resizeInputBox = () => {
    if (this.ref.inputBox) {
      const boxWidth = Math.max(this.ref.inputPlaceholderSpan?.offsetWidth ?? 0, this.ref.inputRendered?.offsetWidth ?? 0);
      const boxPadding = ResizeController.isDesktop ? 60 : 30;
      const boxTotalWidth = boxWidth + boxPadding * 2;
      this.ref.inputBox.style.width = `${boxTotalWidth}px`;
      this.ref.inputBox.style.left = `calc(50% - ${boxTotalWidth / 2}px)`;
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
    <EditorView className={styles['editor-controls__view-inputs-primary']} dataName={{ 'data-view-intro': '' }}>
      {/* heading information */}
      <input className={styles['editor-controls__input-text']} type="text" maxLength={16} />
      <h2>Let&apos;s Create a <strong>Poster!</strong></h2>
      <p>[TYPE YOUR NAME, ROLLOVER THE LETTERS AND PICK A COMBINATION]</p>

      {/* main input field */}
      <div className={styles['editor-controls__input-placeholder']}>
        <div className={styles['editor-controls__input-placeholder-text']} data-input-placeholder>
          <span className='heading-display'>Your Name</span>
        </div>
        <figure className={styles['editor-controls__input-placeholder-box']} data-input-box></figure>
        <div className={styles['editor-controls__input-rendered']} data-input-rendered></div>
      </div>

      {/* generate button */}
      <div className={styles['editor-controls__primary-buttons-wrapper']}>
        <Button big={true} className={styles['editor-controls__generate']} dataName={{ 'data-generate': '' }}>Generate my poster</Button>
      </div>
    </EditorView>

    <EditorView className= {styles['editor-controls__view-inputs-poster']} dataName={{ 'data-view-edit': '' }}>
      {/* poster preview */}
      <div className={styles['editor-controls__poster-column']}>
        <SddwPoster className={styles['editor-controls__poster']} dataName={{ 'data-poster': '' }} />
      </div>

      <div className={styles['editor-controls__controls-column']}>
        {/* editing controls */}
        <div className={styles['editor-controls__controls-wrapper']}>
          <div className={styles['editor-controls__ranges-wrapper']}>
            <RangeSlider dataName={{ 'data-range-scale': '' }} name='scale' value='50' index='0'>Size</RangeSlider>
            <RangeSlider dataName={{ 'data-range-rotation': '' }} name='rotation' value="50" index='1'>Rotate</RangeSlider>
          </div>

          <div className={styles['editor-controls__radio-background-wrapper']}>
            <RadioSelector dataName={{ 'data-background-color': '' }} name='background-color' values={['F8F9FA', '1B1C1E']}>Background Color</RadioSelector>
          </div>

          <div className={styles['editor-controls__options-wrapper']}>
            <ButtonToggle dataName={{ 'data-randomize-each-word': '' }}>Randomize Each Word</ButtonToggle>
            <ButtonToggle dataName={{ 'data-randomize-colors': '' }}>Randomize Colors</ButtonToggle>
          </div>

          <div className={styles['editor-controls__buttons-wrapper']}>
            <Button big={true} className={styles['editor-controls__shuffle']} dataName={{ 'data-shuffle': '' }}>Shuffle</Button>
            <Button big={true} className={styles['editor-controls__generate']} dataName={{ 'data-generate': '' }}>Finish</Button>
          </div>
        </div>

        {/* sharing */}
        <div className={styles['editor-controls__social-wrapper']}>
          <ol className={styles['editor-controls__social-instructions']}>
            <li>Download your design</li>
            <li>Print and share your poster on social media</li>
            <li>Tag us #SDDESIGNWEEK</li>
          </ol>
          <div className={styles['editor-controls__social-download-email-wrapper']}>
            <Button big={true} className={styles['editor-controls__download']} dataName={{ 'data-download': '' }}>Download</Button>
            <Button big={true} className={styles['editor-controls__email']} dataName={{ 'data-email': '' }}>Shuffle</Button>
          </div>
          <div className={styles['editor-controls__social-share-icons']}>
            <span className='text-p'>Share:</span>
            <ul>
              <li>
                <ButtonIcon dataName={{ 'data-social-instagram': '' }}>instagram</ButtonIcon>
              </li>
              <li>
                <ButtonIcon dataName={{ 'data-social-facebook': '' }}>facebook</ButtonIcon>
              </li>
              <li>
                <ButtonIcon dataName={{ 'data-social-twitter': '' }}>twitter</ButtonIcon>
              </li>
            </ul>
          </div>
        </div>
      </div>


      {/* close */}
      <ButtonClose className={styles['editor-controls__button-close']} dataName={{ 'data-close': '' }}></ButtonClose>

    </EditorView>
  </div>
);

export default EditorControls;