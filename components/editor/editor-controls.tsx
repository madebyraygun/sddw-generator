import EventEmitter from 'events';
import Filter from 'badwords';

import AnimationController from '../../assets/js/controllers/animation';
import AssetsController from '../../assets/js/controllers/assets';
import EditorController, { CharacterCallback } from '../../assets/js/controllers/editor';
import EventController from '../../assets/js/controllers/event';
import ResizeController, { ResizeSubscriber } from '../../assets/js/controllers/resize';
import RoleController from '../../assets/js/controllers/role';
import ThemeController from '../../assets/js/controllers/theme';

import Button from '../buttons/button';
import ButtonClose from '../buttons/close';
import ButtonIcon from '../buttons/icon';
import ButtonToggle from '../buttons/toggle';

import RadioSelector, { RadioSelectorElement } from '../controls/radio-selector';
import RangeSlider, { RangeSliderElement } from '../controls/range-slider';

import InputDate from '../input/date';
import InputField from '../input/field';

import SddwPoster from '../poster/poster';
import WordState from '../poster/word-state';

import BehaviorEditorSectionChange, {
  EditorSectionChangeEventProps,
} from '../behaviors/editor-section-change';

import Editor from '../../assets/js/constants/editor';
import Section from '../../assets/js/constants/section';

import EditorControlView from './controls/editor-control-view';
import EditorOverlay from './overlays/editor-overlay';
import EditorView from './views/editor-view';

import BehaviorEditorControlsChange from '../behaviors/editor-controls-change';

import Role from '../../assets/js/constants/role';
import PxToRem from '../../assets/js/utils/pxToRem';

import styles from './editor-controls.module.scss';

interface Controllers {
  resize?: ResizeSubscriber;
}

interface Listeners {
  editor: EventEmitter;
  controls: EventEmitter;
  processing: EventEmitter;
  section: EventEmitter;
}
interface Reference {
  el?: HTMLElement | null;
  close?: HTMLElement | null;
  generate?: HTMLInputElement | null;
  input?: HTMLInputElement | null;
  inputBackgroundColor?: RadioSelectorElement | null;
  inputBox?: HTMLElement | null;
  inputDate?: HTMLInputElement | null;
  inputHost?: HTMLInputElement | null;
  inputPlaceholder?: HTMLElement | null;
  inputPlaceholderSpan?: HTMLElement | null;
  inputRendered?: HTMLElement | null;
  inputRotation?: RangeSliderElement | null;
  inputScale?: RangeSliderElement | null;
  overlayProcessing?: HTMLElement | null;
  shareDownload?: HTMLInputElement | null;
  shareEmail?: HTMLInputElement | null;
  shareSocialFacebook?: HTMLInputElement | null;
  shareSocialInstagram?: HTMLInputElement | null;
  shareSocialTwitter?: HTMLInputElement | null;
  poster?: HTMLElement | null;
  randomizeColors?: HTMLInputElement | null;
  randomizeEachWord?: HTMLInputElement | null;
  shuffle?: HTMLInputElement | null;
  viewEdit?: HTMLElement | null;
}

export class EditorControlsElement extends HTMLElement {

  static selector = 'editor-controls-element';

  controllers: Controllers = {};

  inputWord: WordState;

  listeners: Listeners = {
    controls: EventController.getEmitterAlways(Editor.CONTROLS_EMITTER),
    editor: EventController.getEmitterAlways(Editor.EDITOR_EMITTER),
    processing: EventController.getEmitterAlways(Editor.PROCESSING_EMITTER),
    section: EventController.getEmitterAlways(Section.SECTION_EMITTER),
  };

  ref: Reference = {};

  sections: HTMLElement[] = [];
  sectionsControls: HTMLElement[] = [];

  filter: any;

  constructor() {
    super();
    this.filter = new Filter({ exclude: ['fart', 'poop'] });
    this.inputWord = new WordState('', ThemeController.theme);
    EditorController.attachWord(this.inputWord);
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
      let $inputWord = EditorController.renderWord(this.inputWord, this.ref.inputRendered);

      // check word size, shrink if necessary
      const placeholderWidth = this.ref.inputPlaceholderSpan?.offsetWidth ?? 0;
      const inputRenderedWidth = this.ref.inputRendered?.offsetWidth ?? 0;

      if (placeholderWidth && inputRenderedWidth) {
        const scaleDifference = Math.round((placeholderWidth / inputRenderedWidth) * 4) / 4;
        if (scaleDifference < 1) {
          // if input is too big, rerender and scale down
          const scaledHeight = this.inputWord.theme.inputRenderedHeight * scaleDifference;
          $inputWord = EditorController.renderWord(this.inputWord, this.ref.inputRendered, scaledHeight);

          this.ref.inputRendered.style.height = `${PxToRem.convert(scaledHeight)}rem`;
        } else {
          this.ref.inputRendered.style.height = '';
        }
      }

      this.addPhraseListeners($inputWord);
      this.resizeInputBox();
    }
  };

  // add / remove listeners ------------------------------------------------ //

  addPhraseListeners = ($phrase: HTMLElement) => {
    const $characters = $phrase.children;
    for (let i = 0; i < $characters.length; i++) {
      const $character = $characters[i] as HTMLElement;
      $character.removeEventListener('click', this.#onCharacterClick);
      $character.addEventListener('click', this.#onCharacterClick);
    }
  };

  // listener methods ------------------------------------------------------ //

  // click character to change design
  #onCharacterClick = (e: MouseEvent) => {
    const $target: HTMLElement = e.currentTarget as HTMLElement;
    if ($target) {
      // EditorController.nextCharacter(this.inputWord, parseInt($target.dataset.index || '0'), this.ref.inputRendered, this.#onCharacterEdit);
      this.inputWord.nextCharacterByIndex(parseInt($target.dataset.index || '0'));
      this.renderInputCharacters();
    }
  };

  #onCharacterEdit = (e: CharacterCallback) => {
    if (e.target) {
      this.addPhraseListeners(e.target);
    }
  };

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

    let filteredValue = !value ? '' : value;
    if (RoleController.role !== Role.SPEAKER) {
      // filter for bad words
      filteredValue = !value ? '' : this.filter.clean(value);
    }

    this.inputWord.feed(filteredValue);
    this.renderInputCharacters();
  };

  // when clicking input, emulate focus state (cursor is fake)
  #onInputClick = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLInputElement;
    const value = this.cleanValue(target.value);
    const { length } = value;
    target.setSelectionRange(length, length);
  };

  #onInputKeydown = (e: KeyboardEvent) => {
    if (e.keyCode === 37 || e.keyCode === 39) e.preventDefault();
  };

  #onOutputClick = () => {
    if (this.ref.input) this.ref.input.focus();
  };

  // generate button: render current design into posters
  #onGenerateClick = () => {
    if (this.ref.poster) {
      EditorController.renderCurrentPosterToElement(this.ref.poster);
      window.scrollTo(0, this.ref.viewEdit?.offsetTop ?? 0);
    }
  };

  // randomize colors
  #onRandomizeColorsClick = (e: MouseEvent) => {
    const $target = e.currentTarget as HTMLElement;
    if ($target) {
      EditorController.randomizeColors($target.dataset.active === 'true');
      if (this.ref.poster) {
        EditorController.renderCurrentPosterToElement(this.ref.poster);
      }
    }
  };

  // randomize each word
  #onRandomizeEachWordClick = (e: MouseEvent) => {
    const $target = e.currentTarget as HTMLElement;
    if ($target) {
      EditorController.randomizeEachWord($target.dataset.active === 'true');
      if (this.ref.poster) {
        EditorController.renderCurrentPosterToElement(this.ref.poster);
      }
    }
  };

  // shuffle button: shuffle phrase design
  #onShuffleClick = () => {
    if (this.ref.generate) {
      EditorController.shuffleWord(this.inputWord, this.ref.inputRendered, (value) => {
        const $phrase: HTMLElement | null = this.ref.inputRendered?.querySelector(
          '[data-phrase]',
        ) as HTMLElement;
        if ($phrase) {
          this.addPhraseListeners($phrase);
        }
      });
      if (this.ref.poster) {
        EditorController.shuffleAndRenderPosterToElement(this.ref.poster);
      }
    }
  };

  #onDownloadClick = () => {
    EditorController.download(this.ref.poster);
  };

  // sharing

  #onShareFacebookClick = () => {
    window.open('https://www.facebook.com/sharer/sharer.php?u=https://sddesignweek.org');
  };

  #onShareInstagramClick = () => {
    window.open('https://www.instagram.com');
  };

  #onShareTwitterClick = () => {
    window.open(
      'https://twitter.com/intent/tweet?url=https://sddesignweek.org&text=SEPTEMBER%208-12,%202021%0APRESENTED%20BY%20MINGEI%20INTERNATIONAL%20MUSEUM',
    );
  };

  // track control modifications

  #onRotationChange = (e) => {
    EditorController.setRotation(e.state.valueLerped);
    if (this.ref.poster) {
      EditorController.renderCurrentPosterToElement(this.ref.poster);
    }
  };

  #onScaleChange = (e) => {
    EditorController.setScale(e.state.valueLerped);
    if (this.ref.poster) {
      EditorController.renderCurrentPosterToElement(this.ref.poster);
    }
  };

  #onCloseClick = (e) => {
    const $section = e.currentTarget.closest('[page-section-view]');
    this.listeners.section.emit(Section.DEACTIVATE, $section);
  };

  #onBackgroundColorChange = (e) => {
    if (e && e.state) {
      if (parseInt(`0x${e.state.value}`, 16) < parseInt('0x888888', 16)) {
        // is dark mode
        document.body.classList.add('is-dark');
        document.body.classList.remove('is-light');
      } else {
        // is light mode
        document.body.classList.add('is-light');
        document.body.classList.remove('is-dark');
      }
    }
  };

  #onInputHostChange = (e: CustomEvent) => {
    if (this.ref.poster) {
      const host = e.currentTarget.value as string;
      EditorController.renderSticker(this.ref.poster, { host });
    }
  };

  #onInputDateChange = (e: CustomEvent) => {
    if (this.ref.poster && e?.detail) {
      const { date } = e.detail;
      EditorController.renderSticker(this.ref.poster, { date });
    }
  };

  // built in callback once JSX rendered
  connectedCallback() {
    this.ref.el = this;

    // html elements
    this.ref.inputBox = this.ref.el.querySelector<HTMLElement>('[data-input-box]');
    this.ref.inputPlaceholder = this.ref.el.querySelector<HTMLElement>('[data-input-placeholder]');
    this.ref.inputPlaceholderSpan = this.ref.inputPlaceholder?.children[0] as HTMLElement;
    this.ref.poster = this.ref.el?.querySelector<HTMLElement>('[data-poster]');
    this.ref.viewEdit = this.ref.el?.querySelector<HTMLElement>('[data-editor-section=edit]');

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
    if (this.ref.inputRendered) this.ref.inputRendered.addEventListener('click', this.#onOutputClick);

    // range selector - rotation
    this.ref.inputRotation = this.ref.el.querySelector<RangeSliderElement>('[data-range-rotation]');
    if (this.ref.inputRotation)
      this.ref.inputRotation.emitter.on(RangeSliderElement.CHANGE, this.#onRotationChange);

    // range selector - input
    this.ref.inputScale = this.ref.el.querySelector<RangeSliderElement>('[data-range-scale]');
    if (this.ref.inputScale) this.ref.inputScale.emitter.on(RangeSliderElement.CHANGE, this.#onScaleChange);

    // background color selector
    this.ref.inputBackgroundColor =
      this.ref.el.querySelector<RadioSelectorElement>('[data-background-color]');
    if (this.ref.inputBackgroundColor)
      this.ref.inputBackgroundColor.emitter.on(RadioSelectorElement.CHANGE, this.#onBackgroundColorChange);

    // host text field (speaker only)
    this.ref.inputHost = this.ref.el.querySelector<HTMLInputElement>('[data-input-host] input');
    if (this.ref.inputHost) {
      this.ref.inputHost.addEventListener('change', this.#onInputHostChange);
      this.ref.inputHost.addEventListener('input', this.#onInputHostChange);
    }

    // event date (speaker only)
    this.ref.inputDate = this.ref.el.querySelector<HTMLInputElement>('[data-input-date]');
    if (this.ref.inputDate) {
      this.ref.inputDate.addEventListener('change', this.#onInputDateChange);
      this.ref.inputDate.dispatchEvent(new Event('dispatch'));
    }

    // generate button
    this.ref.generate = this.ref.el.querySelector<HTMLInputElement>('[data-generate]');
    if (this.ref.generate) this.ref.generate.addEventListener('click', this.#onGenerateClick);

    // sharing options
    this.ref.shareSocialFacebook = this.ref.el.querySelector<HTMLInputElement>('[data-share-facebook]');
    if (this.ref.shareSocialFacebook)
      this.ref.shareSocialFacebook.addEventListener('click', this.#onShareFacebookClick);

    this.ref.shareSocialInstagram = this.ref.el.querySelector<HTMLInputElement>('[data-share-instagram]');
    if (this.ref.shareSocialInstagram)
      this.ref.shareSocialInstagram.addEventListener('click', this.#onShareInstagramClick);

    this.ref.shareSocialTwitter = this.ref.el.querySelector<HTMLInputElement>('[data-share-twitter]');
    if (this.ref.shareSocialTwitter)
      this.ref.shareSocialTwitter.addEventListener('click', this.#onShareTwitterClick);

    // download button
    this.ref.shareDownload = this.ref.el.querySelector<HTMLInputElement>('[data-download]');
    if (this.ref.shareDownload) this.ref.shareDownload.addEventListener('click', this.#onDownloadClick);

    // randomize color toggle
    this.ref.randomizeColors = this.ref.el.querySelector<HTMLInputElement>('[data-randomize-colors]');
    if (this.ref.randomizeColors)
      this.ref.randomizeColors.addEventListener('click', this.#onRandomizeColorsClick);

    // randomize word characters toggle
    this.ref.randomizeEachWord = this.ref.el.querySelector<HTMLInputElement>('[data-randomize-each-word]');
    if (this.ref.randomizeEachWord)
      this.ref.randomizeEachWord.addEventListener('click', this.#onRandomizeEachWordClick);

    // shuffle button
    this.ref.shuffle = this.ref.el.querySelector<HTMLInputElement>('[data-shuffle]');
    if (this.ref.shuffle) this.ref.shuffle.addEventListener('click', this.#onShuffleClick);

    // close button
    this.ref.close = this.ref.el.querySelector<HTMLElement>('[data-close]');
    if (this.ref.close) this.ref.close.addEventListener('click', this.#onCloseClick);

    // overlays
    this.ref.overlayProcessing = this.ref.el.querySelector<HTMLElement>('[data-overlay-processing');
    if (this.ref.overlayProcessing) {
      this.listeners.processing.on(Editor.PROCESSING, this.#onEditorProcessing);
      this.listeners.processing.on(Editor.PROCESSING_COMPLETE, this.#onEditorProcessingComplete);
    }

    const sections = this.ref.el.querySelectorAll<HTMLElement>('[data-editor-section]');
    for (let i = 0; i < sections.length; i++) {
      const $section = sections[i];
      this.sections.push($section);
    }

    const controls = this.ref.el.querySelectorAll<HTMLElement>('[data-editor-control-section]');
    for (let i = 0; i < controls.length; i++) {
      const $section = controls[i];
      this.sectionsControls.push($section);
    }

    // listen for section changes
    this.listeners.section.on(Section.ACTIVATE, this.#onSectionActivate);
    this.listeners.controls.on(Editor.ACTIVATE, this.#onControlsActivate);

    // listen for page resize
    this.controllers.resize = ResizeController.set({
      update: this.#onResizeUpdate,
      render: this.#onResizeRender,
    });
  }

  #onEditorProcessing = () => {
    if (this.ref.overlayProcessing) {
      this.ref.overlayProcessing.setAttribute('data-active', '');
    }
  };

  #onEditorProcessingComplete = () => {
    if (this.ref.overlayProcessing) {
      this.ref.overlayProcessing.removeAttribute('data-active');
    }
  };

  #onSectionActivate = (e: EditorSectionChangeEventProps) => {
    if (e.id) {
      this.switchSection(e.id);
    }
  };

  #onControlsActivate = (e: EditorSectionChangeEventProps) => {
    if (e.id) {
      this.switchControls(e.id);
    }
  };

  switchSection = (id: string) => {
    const $target = this.ref.el?.querySelector<HTMLElement>(`[data-editor-section=${id}]`);

    if ($target && !$target.hasAttribute('data-active')) {
      for (let i = 0; i < this.sections.length; i++) {
        const $section = this.sections[i];
        $section.removeAttribute('data-active');
      }

      if (id === 'intro') {
        this.resetControls();

        // wait one frame (until click is complete) then focus on main input
        AnimationController.one({
          update: () => true,
          render: () => {
            if (this.ref.input) {
              this.ref.input.focus();
            }
          },
        });
      }

      $target.setAttribute('data-active', '');
    }
  };

  switchControls = (id: string) => {
    const $target = this.ref.el?.querySelector<HTMLElement>(`[data-editor-control-section=${id}]`);
    if ($target && !$target.hasAttribute('data-active')) {
      for (let i = 0; i < this.sectionsControls.length; i++) {
        const $section = this.sectionsControls[i];
        $section.removeAttribute('data-active');
      }
      $target.setAttribute('data-active', '');
    }
  };

  resetControls = () => {
    this.switchControls('edit');
  };

  #onResizeUpdate = (): boolean => {
    return true;
  };

  #onResizeRender = () => {
    this.resizeInputBox();
  };

  resizeInputBox = () => {
    if (this.ref.inputBox) {
      const boxWidth = Math.max(
        this.ref.inputPlaceholderSpan?.offsetWidth ?? 0,
        this.ref.inputRendered?.offsetWidth ?? 0,
      );
      const boxPadding = ResizeController.isDesktop ? 60 : 30;
      const boxTotalWidth = boxWidth + boxPadding * 2;
      this.ref.inputBox.style.width = `${boxTotalWidth}px`;
      this.ref.inputBox.style.left = `calc(50% - ${boxTotalWidth / 2}px)`;
    }
  };

}

// connect markup to javascript class -------------------------------------- //

if (!window.customElements.get(EditorControlsElement.selector)) {
  window.customElements.define(EditorControlsElement.selector, EditorControlsElement);
}

// JSX template ------------------------------------------------------------ //

const EditorControls: FC = () => (
  <div element={EditorControlsElement.selector} className={styles['editor-controls']}>
    <EditorView
      className={styles['editor-controls__view-inputs-primary']}
      dataName={{ 'data-editor-section': 'intro', 'data-active': '' }}
    >
      {/* heading information */}
      <input className={styles['editor-controls__input-text']} type="text" maxLength={21} />
      <h2>
        Let&apos;s Create a <strong>Poster!</strong>
      </h2>
      <p>[TYPE YOUR NAME, ROLLOVER THE LETTERS AND PICK A COMBINATION]</p>

      {/* main input field */}
      <div className={styles['editor-controls__input-placeholder']}>
        <div className={styles['editor-controls__input-placeholder-text']} data-input-placeholder>
          <span className="heading-display">Your Name</span>
        </div>
        <figure className={styles['editor-controls__input-placeholder-box']} data-input-box></figure>
        <div className={styles['editor-controls__input-rendered']} data-input-rendered></div>
      </div>

      {/* generate button */}
      <div className={styles['editor-controls__primary-buttons-wrapper']}>
        <BehaviorEditorSectionChange sectionId="edit">
          <Button
            big={true}
            className={styles['editor-controls__generate']}
            dataName={{ 'data-generate': '' }}
          >
            Generate my poster
          </Button>
        </BehaviorEditorSectionChange>
      </div>
    </EditorView>

    <EditorView
      className={styles['editor-controls__view-inputs-poster']}
      dataName={{ 'data-editor-section': 'edit' }}
    >
      {/* poster preview */}
      <div className={styles['editor-controls__poster-column']}>
        <SddwPoster className={styles['editor-controls__poster']} dataName={{ 'data-poster': '' }} />
      </div>

      <div className={styles['editor-controls__controls-column']}>
        {/* editing controls */}
        <EditorControlView
          className={styles['editor-controls__controls-wrapper']}
          dataName={{
            'data-editor-control-section': 'edit',
            'data-active': '',
          }}
        >
          <div className={styles['editor-controls__ranges-wrapper']}>
            <RangeSlider dataName={{ 'data-range-scale': '' }} name="scale" value="50" index="0">
              Size
            </RangeSlider>
            <RangeSlider dataName={{ 'data-range-rotation': '' }} name="rotation" value="50" index="1">
              Rotate
            </RangeSlider>
          </div>

          <div className={styles['editor-controls__radio-background-wrapper']}>
            <RadioSelector
              dataName={{ 'data-background-color': '' }}
              name="background-color"
              values={['F8F9FA', '1B1C1E']}
            >
              Background Color
            </RadioSelector>
          </div>

          <div className={styles['editor-controls__options-wrapper']} data-dev-only>
            <ButtonToggle dataName={{ 'data-randomize-each-word': '' }}>Randomize Each Word</ButtonToggle>
            <ButtonToggle dataName={{ 'data-randomize-colors': '' }}>Randomize Colors</ButtonToggle>
          </div>

          <div className={styles['editor-controls__host-wrapper']} data-speaker-only>
            <InputField id="hosted-by" maxLength={21} dataName={{ 'data-input-host': '' }}>
              Hosted By SDDW
            </InputField>
          </div>

          <div className={styles['editor-controls__date-wrapper']} data-speaker-only>
            <InputDate dataName={{ 'data-input-date': '' }}>Date of Your Talk</InputDate>
          </div>

          <div className={styles['editor-controls__buttons-wrapper']} data-dev-only>
            <Button
              big={true}
              className={styles['editor-controls__shuffle']}
              dataName={{ 'data-shuffle': '' }}
            >
              Shuffle
            </Button>
          </div>

          <div className={styles['editor-controls__buttons-wrapper']}>
            <BehaviorEditorControlsChange sectionId="social">
              <Button
                big={true}
                className={styles['editor-controls__generate']}
                dataName={{ 'data-generate': '' }}
              >
                Finish
              </Button>
            </BehaviorEditorControlsChange>
          </div>
        </EditorControlView>

        {/* sharing */}
        <EditorControlView
          className={styles['editor-controls__social-wrapper']}
          dataName={{ 'data-editor-control-section': 'social' }}
        >
          <ol className={styles['editor-controls__social-instructions']}>
            <li>
              <span>Download your design</span>
              <Button
                big={true}
                className={styles['editor-controls__download']}
                dataName={{ 'data-download': '' }}
              >
                Download
              </Button>
            </li>
            <li>
              <span data-speaker-only>Print your poster and share your design on social media</span>
              <span data-public-only>Share your poster on social media</span>
              <ul className={styles['editor-controls__social-links']}>
                <li>
                  <ButtonIcon dataName={{ 'data-share-instagram': '' }}>instagram</ButtonIcon>
                </li>
                <li>
                  <ButtonIcon dataName={{ 'data-share-facebook': '' }}>facebook</ButtonIcon>
                </li>
                <li>
                  <ButtonIcon dataName={{ 'data-share-twitter': '' }}>twitter</ButtonIcon>
                </li>
              </ul>
            </li>
            <li>Tag us #SDDESIGNWEEK</li>
          </ol>
        </EditorControlView>
      </div>

      {/* close */}
      <BehaviorEditorSectionChange sectionId="intro">
        <ButtonClose
          className={styles['editor-controls__button-close']}
          dataName={{ 'data-close': '' }}
        ></ButtonClose>
      </BehaviorEditorSectionChange>
    </EditorView>

    <EditorOverlay dataName={{ 'data-overlay-processing': '' }}>
      <h2>Processing, Please Wait...</h2>
    </EditorOverlay>
  </div>
);

export default EditorControls;
