import { CustomProps } from '../types/props';
import styles from './range-slider.module.scss';

interface SliderProps extends CustomProps {
  name: string,
  value?: number
}

interface Reference {
  el: HTMLElement,
  inputRange?: HTMLInputElement | null
}

class RangeSliderElement extends HTMLElement {

  static selector = 'range-slider';

  ref: Reference = {};

  constructor() {
    super();
  }

  connectedCallback() {
    this.ref.el = this;
    this.ref.inputRange = this.ref.el.querySelector('input[type="range"]') as HTMLInputElement ?? null;
    if (this.ref.inputRange) {
      this.ref.inputRange.addEventListener('change', (e) => {
        console.log('change', this.ref.inputRange.value);
      });
    }
  }

}

// connect markup to javascript class -------------------------------------- //

if (!window.customElements.get(RangeSliderElement.selector)) {
  window.customElements.define(RangeSliderElement.selector, RangeSliderElement);
}

const RangeSlider: FC<SliderProps> = ({
  className, dataName, name, children, value = 50
}) => (
  <div element='range-slider' className={`${className ?? ''} ${styles['range-slider']}`} {...dataName}>
    <label>{children}</label>
    <input type="range" id={name} name={name} min="0" max="100" value={value} />
    <div className={styles['range-slider__controls-wrapper']}>
      <figure className={styles['range-slider__track']}></figure>
      <figure className={styles['range-slider__progress']}></figure>
      <figure className={styles['range-slider__knob']}></figure>
    </div>
  </div>
);

export default RangeSlider;