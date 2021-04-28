import styles from './poster.module.scss';

interface Reference {
  button?: HTMLButtonElement | null,
}

export class PosterElement extends HTMLElement {

  static selector = 'sddw-poster';

  ref: Reference = {};

}

// connect markup to javascript class -------------------------------------- //

if (!window.customElements.get(PosterElement.selector)) {
  window.customElements.define(PosterElement.selector, PosterElement);
}

// JSX template ------------------------------------------------------------ //

const Poster: FC = ({ children }) => (
  <button element={PosterElement.selector} className={styles['poster']}>
    <figure className={styles['poster__knob']}></figure>
    <figure className={styles['poster__knob-bg']}></figure>
    <span>{children}</span>
  </button>
);

export default Poster;