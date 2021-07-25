import { CustomProps } from '../types/props';

import styles from './close.module.scss';

interface Reference {
  el?: HTMLElement;
  button?: HTMLButtonElement;
}

export class ButtonCloseElement extends HTMLElement {

  static selector = 'button-close-element';

  ref: Reference = {};

  connectedCallback() {
    this.ref.el = this;
    this.ref.button = this.ref.el?.children[0] as HTMLButtonElement;
  }

}

// connect to functional component -------------------------------------- //

if (!window.customElements.get(ButtonCloseElement.selector)) {
  window.customElements.define(ButtonCloseElement.selector, ButtonCloseElement);
}

// JSX template ------------------------------------------------------------ //

const ButtonClose: FC<CustomProps> = ({ className, dataName, children = 'Click to Close' }) => (
  <div element={ButtonCloseElement.selector} className={`${className ?? ''} ${styles['button-close']}`} {...dataName}>
    <button>
      <figure className={styles['button-close__x']}></figure>
      <figure className={styles['button-close__x']}></figure>
      <label className="a11y">{children}</label>
    </button>
  </div>
);

export default ButtonClose;
