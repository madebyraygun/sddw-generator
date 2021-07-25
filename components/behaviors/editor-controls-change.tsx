import { CustomProps } from '../types/props';
import { EventEmitter } from 'events';

import EventManager from '../../assets/js/controllers/event';
import Editor from '../../assets/js/constants/editor';

interface Reference {
  el?: HTMLElement;
  button?: HTMLButtonElement;
}

export interface EditorControlsChangeEventProps {
  id: string;
}

export class BehaviorEditorControlsChangeElement extends HTMLElement {

  static selector = 'behavior-editor-controls-change';

  emitter: EventEmitter = EventManager.getEmitterAlways(Editor.CONTROLS_EMITTER);
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
      const id = this.ref.el.dataset.editorControlsChangeId as string;
      console.log(id);
      this.emitter.emit(Editor.ACTIVATE, { id });
    }
  };

}

// connect to functional component -------------------------------------- //

if (!window.customElements.get(BehaviorEditorControlsChangeElement.selector)) {
  window.customElements.define(BehaviorEditorControlsChangeElement.selector, BehaviorEditorControlsChangeElement);
}

// JSX template ------------------------------------------------------------ //

interface BehaviorEditorControlsChangeProps extends CustomProps {
  sectionId: string;
}

const BehaviorEditorControlsChange: FC<BehaviorEditorControlsChangeProps> = ({
  className,
  dataName,
  children,
  sectionId,
}) => (
  <div
    element={BehaviorEditorControlsChangeElement.selector}
    className={`${className ?? ''}`}
    {...dataName}
    data-editor-controls-change-id={sectionId}
  >
    {children}
  </div>
);

export default BehaviorEditorControlsChange;
