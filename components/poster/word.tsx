import WordState from './word-state';

import styles from './word.module.scss';

interface Reference {
  button?: HTMLButtonElement | null;
}

export class WordElement extends HTMLElement {

  static selector = 'sddw-word';

  ref: Reference = {};
  state: WordState;

  state: {
    isToggled: boolean;
  } = {
    isToggled: true,
  };

}

// connect markup to javascript class -------------------------------------- //

if (!window.customElements.get(WordElement.selector)) {
  window.customElements.define(WordElement.selector, WordElement);
}

// JSX template ------------------------------------------------------------ //

const Word: FC = ({ children }) => (
  <button element={WordElement.selector} className={styles['word']}>
    <figure className={styles['word__knob']}></figure>
    <figure className={styles['word__knob-bg']}></figure>
    <span>{children}</span>
  </button>
);

export default Word;
