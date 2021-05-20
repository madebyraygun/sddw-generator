import { CustomProps } from '../types/props';
import { EventEmitter } from 'events';

import EventManager from '../../assets/js/controllers/event';
import Section from '../../assets/js/constants/section';

interface Reference {
  el?: HTMLElement,
  button?: HTMLButtonElement,
}

export interface SectionChangeEventProps {
  id: string
}

export class BehaviorSectionChangeElement extends HTMLElement {

  static selector = 'behavior-section-change';

  emitter: EventEmitter = EventManager.getEmitterAlways(Section.SECTION_EMITTER);
  ref: Reference = {};

  connectedCallback() {
    this.ref.el = this;

    this.ref.button = this.ref.el.querySelector('button') as HTMLButtonElement;
    if (this.ref.button) {
      this.ref.button.addEventListener('click', this.#onButtonClick);
    }
  }

  #onButtonClick = () => {
    if (this.ref.el) {
      const id = this.ref.el.dataset.sectionChangeId as string;
      this.emitter.emit(Section.ACTIVATE, { id });
    }
  }

}

// connect to functional component -------------------------------------- //

if (!window.customElements.get(BehaviorSectionChangeElement.selector)) {
  window.customElements.define(BehaviorSectionChangeElement.selector, BehaviorSectionChangeElement);
}

// JSX template ------------------------------------------------------------ //

interface BehaviorSectionChangeProps extends CustomProps {
  sectionId: string
}

const BehaviorSectionChange: FC<BehaviorSectionChangeProps> = ({
  className, dataName, children, sectionId
}) => (
  <div element={BehaviorSectionChangeElement.selector} className={`${className ?? ''}`} {...dataName} data-section-change-id={sectionId}>
    { children }
  </div>
);

export default BehaviorSectionChange;