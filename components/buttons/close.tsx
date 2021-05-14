import { CustomProps } from '../types/props';

import styles from './toggle.module.scss';

interface Reference {
  el?: HTMLElement,
  button?: HTMLButtonElement,
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
    this.ref.el = this;

    this.ref.button = this.ref.el?.children[0] as HTMLButtonElement;
    if (this.ref.button) {
      this.ref.button.addEventListener('click', this.#onButtonClick);
    }
  }

  #onButtonClick = () => {
    console.log('close');
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