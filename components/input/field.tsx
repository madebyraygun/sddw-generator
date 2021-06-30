import { CustomProps } from '../types/props';
import styles from './field.module.scss';

interface InputProps extends CustomProps {
  id?: string,
  placeholder?: string,
  maxLength?: number,
}

const InputField: FC<InputProps> = ({
  className, dataName, id, maxLength, placeholder, children
}) => (
  <div element='InputField' className={`${styles['input-field']} ${className ?? ''}`} {...dataName}>
    <input className='text-p' type='text' id={id} name={id} placeholder={placeholder} maxLength={maxLength ?? 99} value={children ?? placeholder}></input>
    <figure></figure>
  </div>
);

export default InputField;