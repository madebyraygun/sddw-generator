import { CustomProps } from '../types/props';

import styles from './toggle.module.scss';

interface Reference {
  button?: HTMLButtonElement | null,
}

export class ButtonCloseElement extends HTMLElement {

  static selector = 'button-close-element';

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
      this.toggleButton(this.state.isToggled);
    }
  }

  toggleButton(isToggled = false) {
    this.state.isToggled = isToggled;
    if (this.state.isToggled) {
      this.ref.button?.setAttribute('data-active', true);
      this.ref.button?.setAttribute('data-color', Math.round(Math.random() * 5 + 1).toString());
    } else {
      this.ref.button?.removeAttribute('data-active');
      this.ref.button?.removeAttribute('data-color');
    }
  }

  #onButtonClick = () => {
    this.toggleButton(!this.state.isToggled);
  }

}

// connect to functional component -------------------------------------- //

if (!window.customElements.get(ButtonCloseElement.selector)) {
  window.customElements.define(ButtonCloseElement.selector, ButtonCloseElement);
}

// JSX template ------------------------------------------------------------ //

const ButtonClose: FC<CustomProps> = ({ className, dataName, children }) => (
  <button element={ButtonCloseElement.selector} className={`${className ?? ''} ${styles['button-toggle']}`} {...dataName}>
    <figure className={styles['button-toggle__knob']}></figure>
    <figure className={styles['button-toggle__knob-bg']}></figure>
    <span>{children}</span>
  </button>
);

export default ButtonClose;