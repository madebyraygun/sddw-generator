import Controller from './controller';
import Role from '../constants/role';

class RoleController implements Controller {

  state: {
    role: Role,
  } = {
    role: Role.PUBLIC
  };

  initialize() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('speaker') !== null) {
      this.state.role = Role.SPEAKER;
      document.body.classList.add('is-speaker');
    } else if (urlParams.get('developer') !== null) {
      this.state.role = Role.DEVELOPER;
      document.body.classList.add('is-developer');
    }
  }

  get role():Role {
    return this.state.role;
  }

}

export default new RoleController();