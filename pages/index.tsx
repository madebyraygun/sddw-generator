import Page from '../components/app/page';
import Intro from '../components/intro';
import Input from '../components/input';
import Feed from '../components/feed';

const Index: FC = () => (
  <Page key="index">
    <Intro />
    <Input />
    <Feed />
  </Page>
);

export default Index;