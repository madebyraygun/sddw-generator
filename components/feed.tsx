import Button from './buttons/button';

import styles from './feed.module.scss';

const Feed: FC = () => (
  <div className={styles['feed']}>
    <ul>
      <li>
        <div className={styles['feed__poster']} data-poster>
          <svg viewBox="0 0 1440 1800"></svg>
        </div>
        <div className={styles['feed__ctas']}>
          <Button>Download</Button>
        </div>
      </li>
      <li>
        <div className={styles['feed__poster']} data-poster>
          <svg viewBox="0 0 1440 1800"></svg>
        </div>
        <div className={styles['feed__ctas']}>
          <Button>Download</Button>
        </div>
      </li>
      <li data-full>
        <div className={styles['feed__poster']} data-poster>
          <svg viewBox="0 0 1000 1000"></svg>
        </div>
        <div className={styles['feed__ctas']}>
          <Button>Download</Button>
        </div>
      </li>
      <li>
        <div className={styles['feed__poster']} data-poster>
          <svg viewBox="0 0 1440 1800"></svg>
        </div>
        <div className={styles['feed__ctas']}>
          <Button>Download</Button>
        </div>
      </li>
      <li>
        <div className={styles['feed__poster']} data-poster>
          <svg viewBox="0 0 1800 1440"></svg>
        </div>
        <div className={styles['feed__ctas']}>
          <Button>Download</Button>
        </div>
      </li>
    </ul>
  </div>
);

export default Feed;
