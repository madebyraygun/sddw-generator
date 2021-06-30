
import styles from './disclaimer.module.scss';

import { CustomProps } from '../types/props';

export class DisclaimerOverlayElement extends HTMLElement {

  static selector = 'disclaimer-overlay';

}

// connect markup to javascript class -------------------------------------- //

if (!window.customElements.get(DisclaimerOverlayElement.selector)) {
  window.customElements.define(DisclaimerOverlayElement.selector, DisclaimerOverlayElement);
}

// JSX template ------------------------------------------------------------ //

const DisclaimerOverlay: FC<CustomProps> = ({ className, dataName }) => (
  <div element={DisclaimerOverlayElement.selector} className={`${styles['disclaimer-overlay']} ${className}`} { ...dataName }>
    <span className='text-p-sm'>Please be respectful. <a href='https://sddesignweek.org/code-of-conduct' target='_blank' rel="noreferrer">SDDW Code of Conduct</a> community guidelines apply.</span>
  </div>
);

export default DisclaimerOverlay;