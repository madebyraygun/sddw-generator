import Page from '../components/app/page';
import Intro from '../components/intro';
import InputWord from '../components/forms/editor-controls';
import Feed from '../components/feed';

const Index: FC = () => (
  <Page slug="index">
    <Intro />
    <InputWord />
    <Feed />
  </Page>
);

export default Index;