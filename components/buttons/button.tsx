import { CustomProps } from '../types/props';
import SvgAsset from '../media/svg-asset';

import styles from './button.module.scss';

interface ButtonProps extends CustomProps {
  big?: boolean;
  compact?: boolean;
  iconSvgId?: string;
}

const Button: FC<ButtonProps> = ({
  big = false,
  compact = false,
  iconSvgId = '',
  className,
  dataName,
  children,
}) => {
  if (iconSvgId) {
    return (
      <button
        className={`${className ?? ''} ${styles['button']}`}
        {...dataName}
        data-big={big}
        data-compact={compact}
      >
        <span>{children}</span>
        <SvgAsset svgId={iconSvgId} svgType="icon" />
      </button>
    );
  }

  return (
    <button
      className={`${className ?? ''} ${styles['button']}`}
      {...dataName}
      data-big={big}
      data-compact={compact}
    >
      <span>{children}</span>
    </button>
  );
};

export default Button;
