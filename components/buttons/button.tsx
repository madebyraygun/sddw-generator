import styles from './button.module.scss';

const Button: FC<{
  big?: boolean;
}> = ({ big = false, children }) => (
  <button className={styles['button']} data-big={big}>{children}</button>
);

export default Button;