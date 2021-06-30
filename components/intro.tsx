import BehaviorSectionChange from './behaviors/section-change';
import Button from './buttons/button';

import styles from './intro.module.scss';
import SvgAsset from './media/svg-asset';

const Intro: FC = () => (
  <div className={styles['intro']}>
    <div className={styles['intro__logo']}>
      <figure>
        <SvgAsset svgId='dsgn-wknd-big' svgType='logo' svgTheme='2021' />
        <div className={styles['intro__blurb']}>
          <p>Design a poster using your name for the SDDW community!</p>
        </div>
      </figure>
    </div>
    <div className={styles['intro__button']}>
      <BehaviorSectionChange sectionId='editor'>
        <Button big={true}>Get started</Button>
      </BehaviorSectionChange>
    </div>
  </div>
);

export default Intro;