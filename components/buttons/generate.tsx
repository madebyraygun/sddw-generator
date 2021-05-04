import Editor from '../../assets/js/controllers/editor';

import styles from './generate.module.scss';

interface Reference {
  button?: HTMLButtonElement | null
}

export class InputElement extends HTMLElement {

  static selector = 'generate-element';

  ref: Reference = {};

  #onButtonClick = (e: MouseEvent) => {
    e.preventDefault();
    Editor.renderPosters();
  }

  connectedCallback() {
    this.ref.button = this.querySelector('button');
    if (this.ref.button) {
      this.ref.button.addEventListener('click', this.#onButtonClick);
    }
  }

}

if (!window.customElements.get(InputElement.selector)) {
  window.customElements.define(InputElement.selector, InputElement);
}

const Generate: FC = () => (
  <div element={InputElement.selector} className={styles['generate']}>
    <button>Generate my poster</button>
  </div>
);

export default Generate;