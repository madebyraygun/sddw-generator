import Page from '../components/app/page';
import Intro from '../components/intro';
import EditorControls from '../components/editor/editor-controls';
// import Feed from '../components/feed';

const Index: FC = () => (
  <Page slug="index">
    <Intro />
    <EditorControls />
  </Page>
);

export default Index;