import SvgAsset from '../media/svg-asset';

import styles from './footer.module.scss';

const Footer: FC = () => (
  <footer className={styles['footer']}>
    <SvgAsset className={styles['footer__design-week']} svgId='design-week' svgType='logo' />
  </footer>
);

export default Footer;