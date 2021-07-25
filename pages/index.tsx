import Intro from '../components/intro';
import EditorControls from '../components/editor/editor-controls';
import PageSectionView from '../components/page/section-view';

import EventController from '../assets/js/controllers/event';
import EventEmitter from 'node:events';

import Section from '../assets/js/constants/section';
import { SectionChangeEventProps } from '../components/behaviors/section-change';
import DisclaimerOverlay from '../components/footnote/disclaimer';

interface Reference {
  el?: HTMLElement | null;
  intro?: HTMLElement | null;
  editor?: HTMLElement | null;
}

interface Listeners {
  section: EventEmitter;
}

class PageIndexElement extends HTMLElement {

  static selector = 'page-index';

  listeners: Listeners = {
    section: EventController.getEmitterAlways(Section.SECTION_EMITTER),
  };

  ref: Reference = {};

  sections: HTMLElement[] = [];

  constructor() {
    super();
  }

  connectedCallback() {
    this.ref.el = this;

    this.ref.intro = this.ref.el.querySelector<HTMLElement>('[data-section=intro]');
    this.ref.editor = this.ref.el.querySelector<HTMLElement>('[data-section=editor]');

    const sections = this.ref.el.querySelectorAll<HTMLElement>('[data-section]');
    for (let i = 0; i < sections.length; i++) {
      const $section = sections[i];
      this.sections.push($section);
    }

    this.listeners.section.on(Section.ACTIVATE, this.#onSectionActivate);
  }

  #onSectionActivate = (e: SectionChangeEventProps) => {
    const $section = this.ref.el?.querySelector<HTMLElement>(`[data-section=${e.id}]`);
    if ($section) {
      this.switchSection($section);
    }
  };

  switchSection = ($target: HTMLElement) => {
    if (!$target.hasAttribute('data-active')) {
      for (let i = 0; i < this.sections.length; i++) {
        const $section = this.sections[i];
        $section.removeAttribute('data-active');
      }
      $target.setAttribute('data-active', '');
    }
  };

}

// connect markup to javascript class -------------------------------------- //

if (!window.customElements.get(PageIndexElement.selector)) {
  window.customElements.define(PageIndexElement.selector, PageIndexElement);
}

// JSX template ------------------------------------------------------------ //

const PageIndex: FC = () => (
  <div element={PageIndexElement.selector} data-slug="index">
    <PageSectionView dataName={{ 'data-section': 'intro', 'data-active': '' }}>
      <Intro />
    </PageSectionView>
    <PageSectionView dataName={{ 'data-section': 'editor' }}>
      <EditorControls />
    </PageSectionView>
    <DisclaimerOverlay />
  </div>
);

export default PageIndex;
