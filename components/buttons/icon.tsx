import { CustomProps } from '../types/props';
import SvgAsset from '../media/svg-asset';

import styles from './icon.module.scss';

interface Reference {
  el?: HTMLElement,
  button?: HTMLButtonElement,
}

export class ButtonIconElement extends HTMLElement {

  static selector = 'button-icon-element';

  ref: Reference = {};

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

if (!window.customElements.get(ButtonIconElement.selector)) {
  window.customElements.define(ButtonIconElement.selector, ButtonIconElement);
}

// JSX template ------------------------------------------------------------ //

const ButtonIcon: FC<CustomProps> = ({ className, dataName, children = 'Click to Share' }) => (
  <div element={ButtonIconElement.selector} className={`${className ?? ''} ${styles['button-icon']}`} {...dataName}>
    <button>
      <figure className={styles['button-icon__icon']}>
        <SvgAsset svgId={children} svgType='icon' />
      </figure>
      <label className='a11y'>Click to share on {children}</label>
    </button>
  </div>
);

export default ButtonIcon;