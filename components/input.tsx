import Button from './button';

import Characters from '../assets/js/utils/characters';

import SVGDsgnWknd from '../assets/vectors/dsgn-wknd';

import styles from './input.module.scss';

interface Reference {
  generate?: HTMLInputElement | null,
  input?: HTMLInputElement | null,
  randomize?: HTMLInputElement | null,
  output?: Element | null
}

export class InputElement extends HTMLElement {

  static selector = 'input-element';

  ref: Reference = {};

  cleanValue(value: string) {
    return value.replace(/[^A-Za-z&@#']/g, '').toLowerCase();
  }

  renderCharacters() {
    if (this.ref.output) {
      Characters.renderPhrase(this.ref.output, this.addPhraseListeners);
    }
  }

  // add / remove listeners ------------------------------------------------ //

  addCharacterListeners($character: Element | null) {
    if ($character) {
      $character.removeEventListener('click', this.#onCharacterClick);
      $character.addEventListener('click', this.#onCharacterClick);
    }
  }

  addPhraseListeners($characters) {
    $characters.map(($character: HTMLElement, index: number) => {
      $character.removeEventListener('click', this.#onCharacterClick);
      $character.addEventListener('click', this.#onCharacterClick);
    });
  }

  // listener methods ------------------------------------------------------ //

  // click character to change design
  #onCharacterClick = (e: MouseEvent) => {
    const $target: EventTarget | null = e.currentTarget;
    if ($target) {
      Characters.nextCharacter($target, this.addCharacterListeners);
    }
  }

  // when typing, re-render new characters
  #onInputInput = (e: MouseEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLInputElement;
    const value = this.cleanValue(target.value);
    target.value = value;
    Characters.feed(value);
    this.renderCharacters();
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

  // generate button: render variety of posters
  #onGenerateClick = () => {
    if (this.ref.generate) Characters.renderPosters();
  }

  // randomize button: randomize phrase design
  #onRandomizeClick = () => {
    if (this.ref.generate) {
      Characters.randomizePhrase(this.ref.output, this.addCharacterListeners);
      Characters.renderPosters();
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

    this.ref.output = this.querySelector('[data-output]');
    if (this.ref.output) {
      this.ref.output.addEventListener('click', this.#onOutputClick);
    }

    this.ref.generate = this.querySelector('[data-generate]');
    if (this.ref.generate) {
      this.ref.generate.addEventListener('click', this.#onGenerateClick);
    }

    this.ref.randomize = this.querySelector('[data-randomize]');
    if (this.ref.randomize) {
      this.ref.randomize.addEventListener('click', this.#onRandomizeClick);
    }
  }

}

// enable custom elements -------------------------------------------------- //

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
      <div className={styles['input__randomize']} data-randomize>
        <Button big={true}>Randomize</Button>
      </div>
    </div>
    <button className={styles['input__clear']}>Clear</button>
  </div>
);

export default Input;