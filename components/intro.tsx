import Button from './buttons/button';

import styles from './intro.module.scss';
import SvgAsset from './media/svg-asset';

const Intro: FC = () => (
  <div className={styles['intro']}>
    <div className={styles['intro__logo']}>
      <figure>
        <SvgAsset svgId='dsgn-wknd-big' svgType='logo' />
        <p>Design a poster or generate your logo. Let’s be part of the SDDW community.</p>
      </figure>
    </div>
    <div className={styles['intro__button']}>
      <Button big={true}>Get started</Button>
    </div>
  </div>
);

export default Intro;