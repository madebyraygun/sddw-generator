import { CustomProps } from '../types/props';
import { EventEmitter } from 'events';

import EventController from '../../assets/js/controllers/event';

import styles from './radio-selector.module.scss';

export interface RadioSelectorProps extends CustomProps {
  name: string,
  values: string[]
}

export interface RadioSelectorState {
  target?: HTMLElement | null,
  value: string
}

interface Flags {
  isMouseDown: boolean
}
interface Reference {
  el?: HTMLElement,
  radios?: NodeListOf<Element>,
}

export class RadioSelectorElement extends HTMLElement {

  static selector = 'radio-selector';
  static CHANGE = 'range-slider-change';

  ref: Reference = {};
  emitter: EventEmitter = EventController.set({ key: this }).emitter;

  flags: Flags = {
    isMouseDown: false
  }

  state: RadioSelectorState = {
    target: null,
    value: ''
  }

  connectedCallback() {
    this.ref.el = this;
    this.ref.radios = this.ref.el.querySelectorAll('input[type=radio]');

    for (let i = 0; i < this.ref.radios.length; i++) {
      const $radio = this.ref.radios[i] as HTMLInputElement;
      $radio.addEventListener('change', this.#onChange);
      if (!this.state.target) {
        if ($radio.hasAttribute('checked') || $radio.checked) {
          this.state.target = $radio;
        }
      } else {
        $radio.removeAttribute('checked');
      }
    }
  }

  #onChange = (e) => {
    const $target = e.currentTarget as HTMLInputElement;
    if ($target.checked) {
      this.state.target = $target;
      this.state.value = $target.value;
    }
    this.emitter.emit(RadioSelectorElement.CHANGE, { state: this.state });
  }

}

// connect markup to javascript class -------------------------------------- //

if (!window.customElements.get(RadioSelectorElement.selector)) {
  window.customElements.define(RadioSelectorElement.selector, RadioSelectorElement);
}

const RadioSelector: FC<RadioSelectorProps> = ({
  className, dataName, name, children, values
}) => {
  const radios:Node[] = [];
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const props: {
      checked?: boolean
    } = {};
    if (i === 0) props.checked = true;

    radios.push((
      <li className={styles['radio-selector__control-item']}>
        <input type="radio" id={value} name={name} value={value} {...props}></input>
        <label htmlFor={value} style={`background: #${value}`}>{value}</label>
      </li>
    ));
  }

  return (
    <div element='radio-selector' className={`${className ?? ''} ${styles['radio-selector']}`} {...dataName}>
      <span className="text-label">{children}</span>
      <div className={styles['radio-selector__controls-wrapper']}>
        <ul>
          {radios}
        </ul>
      </div>
    </div>
  );
};

export default RadioSelector;