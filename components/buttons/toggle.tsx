import { CustomProps } from '../types/props';

import styles from './toggle.module.scss';

interface Reference {
  el?: HTMLElement,
  button?: HTMLButtonElement | null,
}

export class ButtonToggleElement extends HTMLElement {

  static selector = 'button-toggle-element';

  ref: Reference = {};

  config: {
    colorVariations: number
  } = {
    colorVariations: 4
  };

  state: {
    isToggled: boolean,
    lastColorVariation: number
  } = {
    isToggled: true,
    lastColorVariation: -1
  };

  connectedCallback() {
    this.ref.el = this;

    this.ref.button = this.ref.el.children[0] as HTMLButtonElement;
    if (this.ref.button) {
      this.ref.button.addEventListener('click', this.#onButtonClick);
      this.toggleButton(this.state.isToggled);
    }
  }

  toggleButton(isToggled = false) {
    this.state.isToggled = isToggled;
    if (this.state.isToggled) {
      this.ref.el?.setAttribute('data-active', 'true');
      this.ref.el?.setAttribute('data-color', this.getDifferentIndex().toString());
    } else {
      this.ref.el?.removeAttribute('data-active');
      this.ref.el?.removeAttribute('data-color');
    }
  }

  getDifferentIndex(): number {
    let index = -1;
    do {
      index = Math.round(Math.random() * (this.config.colorVariations - 1) + 1);
    } while (index === this.state.lastColorVariation);
    return index;
  }

  #onButtonClick = (e) => {
    this.toggleButton(!this.state.isToggled);
  }

}

// connect to functional component -------------------------------------- //

if (!window.customElements.get(ButtonToggleElement.selector)) {
  window.customElements.define(ButtonToggleElement.selector, ButtonToggleElement);
}

// JSX template ------------------------------------------------------------ //

const ButtonToggle: FC<CustomProps> = ({ className, dataName, children }) => (
  <div element={ButtonToggleElement.selector} className={`${className ?? ''} ${styles['button-toggle']}`} {...dataName}>
    <button>
      <figure className={styles['button-toggle__knob']}></figure>
      <figure className={styles['button-toggle__knob-bg']}></figure>
      <span>{children}</span>
    </button>
  </div>
);

export default ButtonToggle;