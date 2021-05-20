import Intro from '../components/intro';
import EditorControls from '../components/editor/editor-controls';
import PageSectionView from '../components/page/section-view';
// import Feed from '../components/feed';


interface Reference {
  el?: HTMLElement,
  intro?: HTMLElement,
  editor?: HTMLElement,
}
class PageIndexElement extends HTMLElement {

  static selector = 'page-index';

  ref: Reference = {};

  constructor() {
    super();
  }

  connectedCallback() {
    this.ref.el = this;
    console.log(this.ref.el.querySelector('[data-section-intro]'));
  }

}

// connect markup to javascript class -------------------------------------- //

if (!window.customElements.get(PageIndexElement.selector)) {
  window.customElements.define(PageIndexElement.selector, PageIndexElement);
}

// JSX template ------------------------------------------------------------ //

const PageIndex: FC = () => (
  <div element={ PageIndexElement.selector } slug="index">
    <PageSectionView dataName={{ 'data-section-intro': '', 'data-active': '' }}>
      <Intro />
    </PageSectionView>
    <PageSectionView dataName={{ 'data-section-editor': '' }}>
      <EditorControls />
    </PageSectionView>
  </div>
);

export default PageIndex;