import Footer from './footer';

import styles from './base.module.scss';

const Base: FC = ({
  children
}) => (
  <div className={styles['base']}>
    <main>{children}</main>
    <Footer />
  </div>
);

export default Base;