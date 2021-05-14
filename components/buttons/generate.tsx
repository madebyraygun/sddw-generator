import styles from './generate.module.scss';

interface Reference {
  el?: HTMLElement,
  button?: HTMLButtonElement,
}

export class ButtonGenerateElement extends HTMLElement {

  static selector = 'generate-element';

  ref: Reference = {};

  connectedCallback() {
    this.ref.el = this;
    this.ref.button = this.ref.el.querySelector('button') as HTMLButtonElement;
  }

}

if (!window.customElements.get(ButtonGenerateElement.selector)) {
  window.customElements.define(ButtonGenerateElement.selector, ButtonGenerateElement);
}

const ButtonGenerate: FC = () => (
  <div element={ButtonGenerateElement.selector} className={styles['generate']}>
    <button>Generate my poster</button>
  </div>
);

export default ButtonGenerate;