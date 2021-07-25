import styles from './section-view.module.scss';

import { CustomProps } from '../types/props';

const PageSectionView: FC<CustomProps> = ({ children, className, dataName }) => (
  <div element="page-section-view" className={`${className ?? ''} ${styles['page-section-view']}`} {...dataName}>
    {children}
  </div>
);

export default PageSectionView;
