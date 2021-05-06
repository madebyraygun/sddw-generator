import { CustomProps } from '../types/props';

import styles from './button.module.scss';

interface ButtonProps extends CustomProps {
  big?: boolean
}

const Button: FC<ButtonProps> = ({
  big = false, className, dataName, children
}) => (
  <button className={`${className ?? ''} ${styles['button']}`} {...dataName} data-big={big}>{children}</button>
);

export default Button;