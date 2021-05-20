import { CustomProps } from '../types/props';

import styles from './date.module.scss';

interface Reference {
  el?: HTMLElement
}

export class InputDateElement extends HTMLElement {

  static selector = 'input-date-element';

  ref: Reference = {};

  connectedCallback() {
    this.ref.el = this;
  }

}

// connect to functional component -------------------------------------- //

if (!window.customElements.get(InputDateElement.selector)) {
  window.customElements.define(InputDateElement.selector, InputDateElement);
}

// JSX template ------------------------------------------------------------ //

const InputDate: FC<CustomProps> = ({ className, dataName, children = 'Date of your talk' }) => (
  <div element={InputDateElement.selector} className={`${className ?? ''} ${styles['input-date']}`} {...dataName}>

  </div>
);

export default InputDate;