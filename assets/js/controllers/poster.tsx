// TODO: may replace editor controller for access to poster -
// currently editor-controls is doing too much and getting things done feels roundabout
// need to separate functionality into something that is easier to follow

import Controller from './controller';

import PosterState from '../../../components/poster/poster-state';

import ThemeController from './theme';

class PosterController implements Controller {

  state: {
    currentPoster: PosterState;
  }

  initialize() {
    this.state.currentPoster = new PosterState(ThemeController.theme);
  }

  get currentPoster():PosterState {
    return this.state.currentPoster;
  }

}

export default new PosterController();