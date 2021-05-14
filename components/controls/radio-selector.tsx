import { CustomProps } from '../types/props';
import styles from './radio-selector.module.scss';

export interface RadioSelectorProps extends CustomProps {
  name: string,
  values?: string[]
}

export interface RadioSelectorState {
  lastX: number,
  x: number,
  values: string[]
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

class RadioSelectorElement extends HTMLElement {

  static selector = 'radio-selector';

  ref: Reference = {};

  flags: Flags = {
    isMouseDown: false
  }

  state: RadioSelectorState= {
    lastX: -1,
    x: -1,
    value: 0
  }

  connectedCallback() {
    this.ref.el = this;
  }

  #onChange = () => {
    this.render();
    if (this.ref?.el) {
      this.ref.el.dispatchEvent(new CustomEvent('change', { detail: { state: this.state } }));
    }
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

    const styleProps = `background: #${value}`;

    radios.push((
      <li className={styles['radio-selector__control-item']}>
        <input type="radio" id={value} name={name} value={value} {...props}></input>
        <label htmlFor={value} style={styleProps}>{value}</label>
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