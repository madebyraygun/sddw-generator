import AnimationController from '../../assets/js/controllers/animation';
import CursorController from '../../assets/js/controllers/cursor';

import { CustomProps } from '../types/props';
import Number from '../../assets/js/utils/number';
import styles from './range-slider.module.scss';

export interface RangeSliderProps extends CustomProps {
  name: string,
  value?: string
}

export interface RangeSliderState {
  lastValue: number,
  x: number,
  value: number
}

interface Flags {
  isAnimating: boolean
}
interface Reference {
  el?: HTMLElement,
  inputRange?: HTMLInputElement | null,
  track?: HTMLInputElement | null,
  progress?: HTMLInputElement | null,
  knob?: HTMLInputElement | null,
}

class RangeSliderElement extends HTMLElement {

  static selector = 'range-slider';

  ref: Reference = {};

  flags: Flags = {
    isAnimating: false
  }

  state: RangeSliderState= {
    lastValue: -1,
    x: -1,
    value: 0
  }

  connectedCallback() {
    this.ref.el = this;

    const maxColors = 3;
    const index = parseInt(this.ref.el.dataset.index || '0');
    const timerIndex = Math.round(parseInt(String(Date.now()).slice(-4, -3)) / 10 * (maxColors - 1));
    const colorIndex = Number.clamp(timerIndex + index, maxColors, 0, true);
    this.ref.el.setAttribute('data-color-index', String(colorIndex));

    this.ref.inputRange = this.ref.el.querySelector('input[type="range"]') as HTMLInputElement ?? null;
    if (this.ref.inputRange) {
      this.state.value = parseInt(this.ref.inputRange.value ?? '0');
      this.ref.inputRange.addEventListener('change', this.#onChange);
    }

    this.ref.track = this.ref.el.querySelector('[data-range-slider-track]') as HTMLInputElement ?? null;
    this.ref.progress = this.ref.el.querySelector('[data-range-slider-progress]') as HTMLInputElement ?? null;
    this.ref.knob = this.ref.el.querySelector('[data-range-slider-knob]') as HTMLInputElement ?? null;

    AnimationController.set({
      update: this.update,
      render: this.render,
    });

    this.render();
    this.ref.el.setAttribute('data-initialized', '');
  }

  #onChange = () => {
    this.render();
    if (this.ref?.el) {
      this.ref.el.dispatchEvent(new CustomEvent('change', { detail: { state: this.state } }));
    }
  }

  update = () => {
    return CursorController.isMouseDown || this.flags.isAnimating;
  }

  render = () => {
    const trackWidth = this.ref.track?.offsetWidth;
    const knobWidth = this.ref.knob?.offsetWidth;
    const value = parseInt(this.ref.inputRange?.value ?? '0');
    this.state.value = value;

    if ((this.ref.knob || this.ref.progress) && trackWidth && knobWidth) {
      if (this.state.lastValue === -1) this.state.lastValue = value;

      const valueLerped: number = this.state.lastValue + (value - this.state.lastValue) * 0.32;
      const x: number = (trackWidth - knobWidth) * (value / 100);
      const xLerped: number = (trackWidth - knobWidth) * (valueLerped / 100);

      this.state.x = x;
      this.state.lastValue = valueLerped;

      if (this.ref.knob) this.ref.knob.style.transform = `translateX(${xLerped}px)`;
      if (this.ref.progress) this.ref.progress.style.transform = `scaleX(${valueLerped / 100})`;

      this.flags.isAnimating = Math.abs(value - valueLerped) > 0.01;
    }
  }

}

// connect markup to javascript class -------------------------------------- //

if (!window.customElements.get(RangeSliderElement.selector)) {
  window.customElements.define(RangeSliderElement.selector, RangeSliderElement);
}

const RangeSlider: FC<RangeSliderProps> = ({
  className, dataName, index, name, children, value = '50'
}) => (
  <div element='range-slider' className={`${className ?? ''} ${styles['range-slider']}`} data-index={index} {...dataName}>
    <label>{children}</label>
    <div className={styles['range-slider__combo-wrapper']}>
      <input type='range' id={name} name={name} min='0' max='100' value={value} />
      <div className={styles['range-slider__controls-wrapper']}>
        <figure className={styles['range-slider__track']} data-range-slider-track></figure>
        <figure className={styles['range-slider__progress']} data-range-slider-progress></figure>
        <figure className={styles['range-slider__knob']} data-range-slider-knob></figure>
      </div>
    </div>
  </div>
);

export default RangeSlider;