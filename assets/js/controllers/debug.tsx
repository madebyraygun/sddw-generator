import Controller from './controller';

class DebugController implements Controller {

  isActive = true;

  initialize() {
    console.log(`Debug Mode: ${this.isActive ? 'On' : 'Off'}`);
  }

}

export default new DebugController();