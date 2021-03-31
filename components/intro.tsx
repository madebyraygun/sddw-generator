import Button from './button';

import SVGDsgnWkndBig from '../assets/vectors/dsgn-wknd-big';

import styles from './intro.module.scss';

const Intro: FC = () => (
  <div element="intro-element" className={styles['intro']}>
    <div className={styles['intro__logo']}>
      <figure>
        <SVGDsgnWkndBig/>
        <p>Design a poster or generate your logo. Let’s be part of the SDDW community.</p>
      </figure>
    </div>
    <div className={styles['intro__button']}>
      <Button big={true}>Get started</Button>
    </div>
  </div>
);

export default Intro;