import Controller from './controller';
import Role from '../constants/role';

class RoleController implements Controller {

  state: {
    role: Role;
  } = {
    role: Role.PUBLIC,
  };

  initialize() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('speaker-no-sticker') !== null) {
      this.state.role = Role.SPEAKER_NO_STICKER;
      document.body.classList.add('is-speaker', 'is-speaker-no-sticker');
    } else if (urlParams.get('speaker') !== null) {
      this.state.role = Role.SPEAKER;
      document.body.classList.add('is-speaker', 'is-speaker-sticker');
    } else if (urlParams.get('developer') !== null) {
      this.state.role = Role.DEVELOPER;
      document.body.classList.add('is-developer', 'is-speaker', 'is-speaker-no-sticker');
    }
  }

  get role(): Role {
    return this.state.role;
  }

}

export default new RoleController();
