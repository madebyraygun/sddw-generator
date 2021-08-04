import { setUncaughtExceptionCaptureCallback } from 'node:process';
import SvgAsset from '../media/svg-asset';
import { CustomProps } from '../types/props';

import styles from './date.module.scss';

interface Reference {
  el?: HTMLElement;
  inputMonth?: HTMLSelectElement;
  inputDay?: HTMLSelectElement;
  inputHour?: HTMLSelectElement;
  inputMinute?: HTMLSelectElement;
  inputAmPm?: HTMLSelectElement;
  renderMonth?: HTMLElement;
  renderDay?: HTMLElement;
  renderHour?: HTMLElement;
  renderMinute?: HTMLElement;
  renderAmPm?: HTMLElement;
}

interface InputDateState {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  amPm: string;
}

export class InputDateElement extends HTMLElement {

  static selector = 'input-date-element';

  ref: Reference = {};

  state: InputDateState;

  constructor() {
    super();

    const now = new Date();
    this.state = {
      year: `${now.getFullYear()}`,
      month: '01',
      day: '01',
      hour: '00',
      minute: '00',
      amPm: 'AM',
    };
  }

  connectedCallback() {
    this.ref.el = this;

    this.ref.inputMonth = this.ref.el.querySelector('#date-month') as HTMLSelectElement;
    this.ref.inputDay = this.ref.el.querySelector('#date-day') as HTMLSelectElement;
    this.ref.inputHour = this.ref.el.querySelector('#date-hour') as HTMLSelectElement;
    this.ref.inputMinute = this.ref.el.querySelector('#date-minute') as HTMLSelectElement;
    this.ref.inputAmPm = this.ref.el.querySelector('#date-am-pm') as HTMLSelectElement;

    const dropdowns = this.ref.el.querySelectorAll('select');
    for (let i = 0; i < dropdowns.length; i++) {
      const $dropdown = dropdowns[i];
      $dropdown.addEventListener('change', this.#onSelectChange);
    }

    this.ref.el.addEventListener('dispatch', this.#onSelectChange);

    this.ref.renderMonth = this.ref.el.querySelector('[data-month-rendered]') as HTMLElement;
    this.ref.renderDay = this.ref.el.querySelector('[data-day-rendered]') as HTMLElement;
    this.ref.renderHour = this.ref.el.querySelector('[data-hour-rendered]') as HTMLElement;
    this.ref.renderMinute = this.ref.el.querySelector('[data-minute-rendered]') as HTMLElement;
    this.ref.renderAmPm = this.ref.el.querySelector('[data-am-pm-rendered]') as HTMLElement;

    this.updateState();
    this.renderState();
  }

  #onSelectChange = () => {
    this.updateState();
    this.renderState();
    this.dispatchState();
  };

  resetState = () => {
    if (this.ref.inputMonth) {
      this.ref.inputMonth.getElementsByTagName('option')[0].selected = true;
    }
    if (this.ref.inputDay) {
      this.ref.inputDay.getElementsByTagName('option')[0].selected = true;
    }
    if (this.ref.inputHour) {
      this.ref.inputHour.getElementsByTagName('option')[0].selected = true;
    }
    if (this.ref.inputMinute) {
      this.ref.inputMinute.getElementsByTagName('option')[0].selected = true;
    }
    if (this.ref.inputAmPm) {
      this.ref.inputAmPm.getElementsByTagName('option')[0].selected = true;
    }

    this.updateState();
  };

  updateState = () => {
    if (this.ref.inputMonth) {
      this.state.month = this.ref.inputMonth.options[this.ref.inputMonth.selectedIndex].text;
    }
    if (this.ref.inputDay) {
      this.state.day = this.ref.inputDay.options[this.ref.inputDay.selectedIndex].text;
    }
    if (this.ref.inputHour) {
      this.state.hour = this.ref.inputHour.options[this.ref.inputHour.selectedIndex].text;
    }
    if (this.ref.inputMinute) {
      this.state.minute = this.ref.inputMinute.options[this.ref.inputMinute.selectedIndex].text;
    }
    if (this.ref.inputAmPm) {
      this.state.amPm = this.ref.inputAmPm.options[this.ref.inputAmPm.selectedIndex].text;
    }
  };

  renderState = () => {
    if (this.ref.renderMonth) this.ref.renderMonth.innerHTML = this.state.month;
    if (this.ref.renderDay) this.ref.renderDay.innerHTML = this.state.day;
    if (this.ref.renderHour) this.ref.renderHour.innerHTML = this.state.hour;
    if (this.ref.renderMinute) this.ref.renderMinute.innerHTML = this.state.minute;
    if (this.ref.renderAmPm) this.ref.renderAmPm.innerHTML = this.state.amPm;
  };

  dispatchState = () => {
    const month = this.ref.inputMonth?.value ?? '01';
    const day = this.ref.inputDay?.value ?? '01';
    const amPm = this.ref.inputAmPm?.value ?? 'AM';
    const hour = this.ref.inputHour?.value ?? '00';
    const hour24 = parseInt(hour) + (amPm === 'PM' ? 12 : 0);
    const minute = this.ref.inputMinute?.value ?? '00';

    this.ref.el?.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          month,
          day,
          hour,
          minute,
          amPm,
          date: new Date(`${day} ${month} ${new Date().getFullYear()}, ${hour24}:${minute}:00`),
        },
      }),
    );
  };

}

// connect to functional component -------------------------------------- //

if (!window.customElements.get(InputDateElement.selector)) {
  window.customElements.define(InputDateElement.selector, InputDateElement);
}

// JSX template ------------------------------------------------------------ //

const InputDate: FC<CustomProps> = ({ className, dataName, children = 'Date of your talk' }) => {
  const days: Node[] = [];
  for (let i = 7; i < 11; i++) {
    const day = i < 10 ? `0${i + 1}` : String(i + 1);
    const dayParams = {};
    if (i === 7) {
      dayParams['selected'] = true;
    }
    days.push(
      <option value={`${day}`} {...dayParams}>
        {day}
      </option>,
    );
  }

  return (
    <div
      element={InputDateElement.selector}
      className={`${className ?? ''} ${styles['input-date']}`}
      {...dataName}
    >
      <div className={styles['input-date__controls-wrapper']}>
        <SvgAsset svgId="calendar" svgType="icon" alt={children} />

        <div className={styles['input-date__control']}>
          <label className="a11y" htmlFor="date-month">
            Select Month
          </label>
          <select name="date-month" id="date-month">
            <option value="Sep" selected>
              Sep
            </option>
          </select>
          <span className="text-p" data-month-rendered></span>
        </div>

        <div className={styles['input-date__control']}>
          <label className="a11y" htmlFor="date-day">
            Select Day
          </label>
          <select name="date-day" id="date-day" date-input-day>
            {days}
          </select>
          <span className="text-p" data-day-rendered></span>
        </div>

        <SvgAsset svgId="time" svgType="icon" alt={children} />

        <div className={styles['input-date__control']}>
          <label className="a11y" htmlFor="date-hour">
            Select Hour
          </label>
          <select name="date-hour" id="date-hour">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6" selected>
              6
            </option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
          </select>
          <span className="text-p" data-hour-rendered></span>
        </div>
        <figure className={styles['input-date__colon']}>
          <span className="text-p">:</span>
        </figure>
        <div className={styles['input-date__control']}>
          <label className="a11y" htmlFor="date-minute">
            Select Minute
          </label>
          <select name="date-minute" id="date-minute">
            <option value="00">00</option>
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="45">45</option>
          </select>
          <span className="text-p" data-minute-rendered></span>
        </div>

        <div className={`${styles['input-date__control']} ${styles['input-date__control-am-pm']}`}>
          <label className="a11y" htmlFor="date-am-pm">
            Select AM or PM
          </label>
          <select name="date-am-pm" id="date-am-pm" value="pm">
            <option value="AM">AM</option>
            <option value="PM" selected>
              PM
            </option>
          </select>
          <span className="text-p" data-am-pm-rendered></span>
        </div>
      </div>
      <figure></figure>
    </div>
  );
};

export default InputDate;
