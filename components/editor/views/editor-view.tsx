import { CustomProps } from '../../types/props';

import styles from './editor-view.module.scss';

const EditorView: FC<CustomProps> = ({ className, dataName, children }) => (
  <div element='editor-view' className={`${className ?? ''} ${styles['editor-view']}`} {...dataName}>
    {children}
  </div>
);

export default EditorView;