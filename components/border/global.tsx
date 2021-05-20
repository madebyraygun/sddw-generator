import styles from './global.module.scss';

import { CustomProps } from '../types/props';

const BorderGlobal: FC<CustomProps> = ({ className, dataName }) => (
  <div element='border-global' className={`${className ?? ''} ${styles['border-global']}`} {...dataName}>
    <figure></figure>
    <figure></figure>
    <figure></figure>
    <figure></figure>
  </div>
);

export default BorderGlobal;