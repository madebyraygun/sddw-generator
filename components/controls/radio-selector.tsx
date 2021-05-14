import AnimationController from '../../assets/js/controllers/animation';
import CursorController from '../../assets/js/controllers/cursor';

import { CustomProps } from '../types/props';
import styles from './range-slider.module.scss';

export interface RangeSliderProps extends CustomProps {
  name: string,
  value?: number
}

export interface RangeSliderState {
  lastX: number,
  x: number,
  value: number
}

interface Flags {
  isMouseDown: boolean
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
    isMouseDown: false
  }

  state: RangeSliderState= {
    lastX: -1,
    x: -1,
    value: 0
  }

  connectedCallback() {
    this.ref.el = this;
    this.ref.el.addEventListener('mousedown', this.#onMouseDown);
    document.addEventListener('mouseup', this.#onMouseUp);

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
  }

  #onChange = () => {
    this.render();
    if (this.ref?.el) {
      this.ref.el.dispatchEvent(new CustomEvent('change', { detail: { state: this.state } }));
    }
  }

  #onMouseDown = () => {
    this.flags.isMouseDown = true;
  }

  #onMouseUp = () => {
    this.flags.isMouseDown = false;
  }

  update = () => {
    return CursorController.isMouseDown;
  }

  render = () => {
    const trackWidth = this.ref.track?.offsetWidth;
    const knobWidth = this.ref.knob?.offsetWidth;
    const value = parseInt(this.ref.inputRange?.value ?? '0');
    this.state.value = value;
    if (this.ref.knob && trackWidth && knobWidth) {
      const x: number = (trackWidth - knobWidth) * (value / 100);
      const xLerped: number = this.state.lastX + (x - this.state.lastX) * 0.32;
      this.state.x = x;
      this.state.lastX = xLerped;
      this.ref.knob.style.transform = `translateX(${xLerped}px)`;
    }
  }

}

// connect markup to javascript class -------------------------------------- //

if (!window.customElements.get(RangeSliderElement.selector)) {
  window.customElements.define(RangeSliderElement.selector, RangeSliderElement);
}

const RangeSlider: FC<RangeSliderProps> = ({
  className, dataName, name, children, value = 50
}) => (
  <div element='range-slider' className={`${className ?? ''} ${styles['range-slider']}`} {...dataName}>
    <label>{children}</label>
    <div className={styles['range-slider__combo-wrapper']}>
      <input type="range" id={name} name={name} min="0" max="100" value={value} />
      <div className={styles['range-slider__controls-wrapper']}>
        <figure className={styles['range-slider__track']} data-range-slider-track></figure>
        <figure className={styles['range-slider__progress']} data-range-slider-progress></figure>
        <figure className={styles['range-slider__knob']} data-range-slider-knob></figure>
      </div>
    </div>
  </div>
);

export default RangeSlider;