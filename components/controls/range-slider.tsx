import { CustomProps } from '../types/props';
import styles from './range-slider.module.scss';

interface SliderProps extends CustomProps {
  name: string,
  value?: number
}

const RangeSlider: FC<SliderProps> = ({
  className, dataName, name, children, value = 50
}) => (
  <div element='range-slider' className={`${className ?? ''} ${styles['range-slider']}`} {...dataName}>
    <label>{children}</label>
    <input type="range" id={name} name={name} min="0" max="100" value={value} />
    <div className={styles['range-slider__controls-wrapper']}>
      <figure className={styles['range-slider__track']}></figure>
      <figure className={styles['range-slider__progress']}></figure>
      <figure className={styles['range-slider__knob']}></figure>
    </div>
  </div>
);

export default RangeSlider;