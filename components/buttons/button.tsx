import { CustomProps } from '../types/props';

import styles from './button.module.scss';

interface ButtonProps extends CustomProps {
  big?: boolean,
  icon?: string | null
}

const Button: FC<ButtonProps> = ({
  big = false, icon = null, className, dataName, children
}) => {
  if (icon) {
    return (
      <button className={`${className ?? ''} ${styles['button']}`} {...dataName} data-big={big}>
        <span>{children}</span>
        {iconSVG}
      </button>
    );
  }

  return (
    <button className={`${className ?? ''} ${styles['button']}`} {...dataName} data-big={big}>
      <span>{children}</span>
    </button>
  );
};

export default Button;