import { CustomProps } from '../../types/props';

import styles from './editor-control-view.module.scss';

const EditorControlView: FC<CustomProps> = ({ className, dataName, children }) => (
  <div element='editor-control-view' className={`${className ?? ''} ${styles['editor-control-view']}`} {...dataName}>
    {children}
  </div>
);

export default EditorControlView;