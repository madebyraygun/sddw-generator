
import styles from './poster.module.scss';

import { CustomProps } from '../types/props';

export interface PosterProps extends CustomProps {
  width?: number,
  height?: number,
}

export class PosterElement extends HTMLElement {

  static selector = 'sddw-poster';

}

// connect markup to javascript class -------------------------------------- //

if (!window.customElements.get(PosterElement.selector)) {
  window.customElements.define(PosterElement.selector, PosterElement);
}

// JSX template ------------------------------------------------------------ //

const Poster: FC<PosterProps> = ({
  className, dataName, children, width = 1350, height = 1800
}) => (
  <div element={PosterElement.selector} className={`${className ?? ''} ${styles['sddw-poster']}`} {...dataName}>
    <svg viewBox={`0 0 ${width} ${height}`}>{children}</svg>
  </div>
);

export default Poster;