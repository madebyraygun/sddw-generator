import Button from './button';

import Characters from '../assets/js/utils/characters';

import SVGDsgnWknd from '../assets/vectors/dsgn-wknd';

import styles from './input.module.scss';

interface Reference {
  input?: HTMLInputElement | null,
  output?: Element | null
}

export class InputElement extends HTMLElement {

  static selector = 'input-element';

  ref: Reference = {};

  cleanValue(value: string) {
    return value.replace(/[^A-Za-z&@#']/g, '').toLowerCase();
  }

  renderCharacters() {
    const characters = Characters.render();
    if (this.ref.output) this.ref.output.innerHTML = '';
    characters.map((character, index) => {
      character.addEventListener('click', () => {
        Characters.change(index);
        this.renderCharacters();
      });
      if (this.ref.output) this.ref.output.append(character);
    });
  }

  #onInputInput = (e: MouseEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLInputElement;
    const value = this.cleanValue(target.value);
    target.value = value;
    Characters.feed(value);
    this.renderCharacters();
  }

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
  }

}

if (!window.customElements.get(InputElement.selector)) {
  window.customElements.define(InputElement.selector, InputElement);
}

const Input: FC = () => (
  <div element="input-element" className={styles['input']}>
    <input type="text" maxLength={16} />
    <div className={styles['input__logo']}>
      <figure>
        <SVGDsgnWknd />
      </figure>
    </div>
    <p>Type your name and click a letter to pick the design you like.</p>
    <div className={styles['input__output']} data-output></div>
    <div className={styles['input__generate']}>
      <Button big={true}>Generate my poster</Button>
    </div>
    <button className={styles['input__clear']}>Clear</button>
  </div>
);

export default Input;