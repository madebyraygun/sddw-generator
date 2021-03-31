import Button from './button';

import styles from './feed.module.scss';

const Feed: FC = () => (
  <div className={styles['feed']}>
    <ul>
      <li>
        <div className={styles['feed__poster']}><svg viewBox="0 0 1350 1800"></svg></div>
        <div className={styles['feed__ctas']}>
          <Button>Download</Button>
        </div>
      </li>
      <li>
        <div className={styles['feed__poster']}><svg viewBox="0 0 1350 1800"></svg></div>
        <div className={styles['feed__ctas']}>
          <Button>Download</Button>
        </div>
      </li>
      <li data-full>
        <div className={styles['feed__poster']}><svg viewBox="0 0 1000 1000"></svg></div>
        <div className={styles['feed__ctas']}>
          <Button>Download</Button>
        </div>
      </li>
      <li>
        <div className={styles['feed__poster']}><svg viewBox="0 0 1350 1800"></svg></div>
        <div className={styles['feed__ctas']}>
          <Button>Download</Button>
        </div>
      </li>
      <li>
        <div className={styles['feed__poster']}><svg viewBox="0 0 1800 1350"></svg></div>
        <div className={styles['feed__ctas']}>
          <Button>Download</Button>
        </div>
      </li>
    </ul>
  </div>
);

export default Feed;
