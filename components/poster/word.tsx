import styles from './word.module.scss';

interface Reference {
  button?: HTMLButtonElement | null,
}

export class WordElement extends HTMLElement {

  static selector = 'sddw-word';

  ref: Reference = {};

  state: {
    isToggled: boolean,
  } = {
    isToggled: true,
  };

  connectedCallback() {
    this.ref.button = this;
    if (this.ref.button) {
      this.ref.button.addEventListener('click', this.#onButtonClick);
    }
  }

  #onButtonClick = (e: MouseEvent) => {
    this.state.isToggled = !this.state.isToggled;
    if (this.state.isToggled) {
      this.ref.button?.setAttribute('data-active', true);
      this.ref.button?.setAttribute('data-color', Math.round(Math.random() * 5 + 1).toString());
    } else {
      this.ref.button?.removeAttribute('data-active');
      this.ref.button?.removeAttribute('data-color');
    }
  }

}

// connect markup to javascript class -------------------------------------- //

if (!window.customElements.get(WordElement.selector)) {
  window.customElements.define(WordElement.selector, WordElement);
}

// JSX template ------------------------------------------------------------ //

const Word: FC = ({ children }) => (
  <button element={WordElement.selector} className={styles['word']}>
    <figure className={styles['word__knob']}></figure>
    <figure className={styles['word__knob-bg']}></figure>
    <span>{children}</span>
  </button>
);

export default Word;