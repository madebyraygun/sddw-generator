import { CustomProps } from '../types/props';
import { EventEmitter } from 'events';

import EventManager from '../../assets/js/controllers/event';
import Editor from '../../assets/js/constants/editor';

interface Reference {
  el?: HTMLElement;
  button?: HTMLButtonElement;
}

export interface EditorSectionChangeEventProps {
  id: string;
}

export class BehaviorEditorSectionChangeElement extends HTMLElement {

  static selector = 'behavior-editor-section-change';

  emitter: EventEmitter = EventManager.getEmitterAlways(Editor.SECTION_EMITTER);
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
      const id = this.ref.el.dataset.editorSectionChangeId as string;
      this.emitter.emit(Editor.ACTIVATE, { id });
    }
  };

}

// connect to functional component -------------------------------------- //

if (!window.customElements.get(BehaviorEditorSectionChangeElement.selector)) {
  window.customElements.define(BehaviorEditorSectionChangeElement.selector, BehaviorEditorSectionChangeElement);
}

// JSX template ------------------------------------------------------------ //

interface BehaviorEditorSectionChangeProps extends CustomProps {
  sectionId: string;
}

const BehaviorEditorSectionChange: FC<BehaviorEditorSectionChangeProps> = ({
  className,
  dataName,
  children,
  sectionId,
}) => (
  <div
    element={BehaviorEditorSectionChangeElement.selector}
    className={`${className ?? ''}`}
    {...dataName}
    data-editor-section-change-id={sectionId}
  >
    {children}
  </div>
);

export default BehaviorEditorSectionChange;
