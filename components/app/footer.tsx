import SVGDesignWeekLogo from '../../assets/vectors/logos/design-week';
import SVGBasicLogo from '../../assets/vectors/logos/basic';

import styles from './footer.module.scss';

const Footer: FC = () => (
  <footer className={styles['footer']}>
    <figure className={styles['footer__design-week']}>
      <SVGDesignWeekLogo />
    </figure>
    <figure className={styles['footer__basic']}>
      <SVGBasicLogo />
    </figure>
  </footer>
);

export default Footer;