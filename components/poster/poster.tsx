import styles from './poster.module.scss';

export class PosterElement extends HTMLElement {

  static selector = 'sddw-poster';

}

// connect markup to javascript class -------------------------------------- //

if (!window.customElements.get(PosterElement.selector)) {
  window.customElements.define(PosterElement.selector, PosterElement);
}

// JSX template ------------------------------------------------------------ //

const Poster: FC = ({ children }) => (
  <div element={PosterElement.selector} className={styles['poster']}></div>
);

export default Poster;