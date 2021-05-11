import SvgAsset from '../media/svg-asset';

import styles from './footer.module.scss';

const Footer: FC = () => (
  <footer className={styles['footer']}>
    <SvgAsset className={styles['footer__design-week']} svgId='design-week' svgType='logo' />
    <SvgAsset className={styles['footer__basic']} svgId='basic' svgType='logo' />
  </footer>
);

export default Footer;