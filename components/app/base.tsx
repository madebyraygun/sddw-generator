import Footer from './footer';

import styles from './base.module.scss';
import BorderGlobal from '../border/global';

const Base: FC = ({ children }) => (
  <div className={styles['base']}>
    <BorderGlobal />
    <main>{children}</main>
    <Footer />
  </div>
);

export default Base;
