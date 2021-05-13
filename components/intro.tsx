import Button from './buttons/button';

import styles from './intro.module.scss';
import SvgAsset from './media/svg-asset';

const Intro: FC = () => (
  <div className={styles['intro']}>
    <div className={styles['intro__logo']}>
      <figure>
        <SvgAsset svgId='dsgn-wknd-big' svgType='logo' svgTheme='2021' />
        <div className={styles['intro__blurb']}>
          <p>Design a poster or generate your logo. Let’s be part of the SDDW community.</p>
        </div>
      </figure>
    </div>
    <div className={styles['intro__button']}>
      <Button big={true}>Get started</Button>
    </div>
    <div className={styles['intro__footnote']}>
      <span className='text-p-sm'>Please be respectful. <a href="#">SDDW Code of Conduct</a> community guidelines apply.</span>
    </div>
  </div>
);

export default Intro;