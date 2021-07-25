import { CustomProps } from '../../types/props';

import styles from './editor-overlay.module.scss';

const EditorOverlay: FC<CustomProps> = ({ className, dataName, children }) => (
  <div element="editor-overlay" className={`${className ?? ''} ${styles['editor-overlay']}`} {...dataName}>
    {children}
  </div>
);

export default EditorOverlay;
