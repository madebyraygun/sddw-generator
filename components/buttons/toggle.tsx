import styles from './toggle.module.scss';

interface Reference {
  button?: HTMLButtonElement | null,
}

export class ButtonToggleElement extends HTMLElement {

  static selector = 'button-toggle-element';

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

if (!window.customElements.get(ButtonToggleElement.selector)) {
  window.customElements.define(ButtonToggleElement.selector, ButtonToggleElement);
}

// JSX template ------------------------------------------------------------ //

const ButtonToggle: FC = ({ children }) => (
  <button element={ButtonToggleElement.selector} className={styles['button-toggle']}>
    <figure className={styles['button-toggle__knob']}></figure>
    <figure className={styles['button-toggle__knob-bg']}></figure>
    <span>{children}</span>
  </button>
);

export default ButtonToggle;