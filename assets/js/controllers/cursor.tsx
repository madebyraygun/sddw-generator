import AnimationController, { AnimationSubscriber } from './animation';
import Controller from './controller';

/*
    CursorController:
    1) Provides unified cursor coordinates
*/

interface Controllers {
  animation?: AnimationSubscriber;
}

interface Config {
  lerp: {
    ratio: number;
    roundOff: number;
  };
}

interface Coords {
  cursor: {
    x: number;
    y: number;
    last: {
      x: number | null;
      y: number | null;
    };
  };
  lerped: {
    x: number;
    y: number;
    last: {
      x: number | null;
      y: number | null;
    };
  };
}

interface Flags {
  isMouseDown: boolean;
}

interface State {
  velocity: {
    v: number;
    vx: number;
    vy: number;
    last: {
      v: number | null;
      vx: number | null;
      vy: number | null;
    };
    lerped: {
      v: number | null;
      vx: number | null;
      vy: number | null;
    };
  };
}

class CursorController implements Controller {

  controllers: Controllers = {};

  config: Config = {
    lerp: {
      ratio: 0.15,
      roundOff: 0.05,
    },
  };

  coords: Coords = {
    cursor: {
      x: 0,
      y: 0,
      last: {
        x: null,
        y: null,
      },
    },
    lerped: {
      x: 0,
      y: 0,
      last: {
        x: null,
        y: null,
      },
    },
  };

  flags: Flags = {
    isMouseDown: false,
  };

  state: State = {
    velocity: {
      v: 0,
      vx: 0,
      vy: 0,
      last: {
        v: null,
        vx: null,
        vy: null,
      },
      lerped: {
        v: null,
        vx: null,
        vy: null,
      },
    },
  };

  initialize() {
    this.addEventListeners();
  }

  // listeners

  addEventListeners() {
    document.body.addEventListener('mousedown', this.#onMouseDown);
    document.body.addEventListener('mousemove', this.#onMouseMove);
    document.body.addEventListener('touchmove', this.#onTouchMove);
    window.addEventListener('blur', this.#onBlur);
    window.addEventListener('mouseup', this.#onMouseUp);

    this.controllers.animation = AnimationController.set({
      update: this.#onAnimationUpdate,
    });
  }

  removeEventListeners() {
    document.body.removeEventListener('mousedown', this.#onMouseDown);
    document.body.removeEventListener('mousemove', this.#onMouseMove);
    document.body.removeEventListener('touchmove', this.#onTouchMove);
    window.removeEventListener('blur', this.#onBlur);
    window.removeEventListener('mouseup', this.#onMouseUp);
  }

  // listener methods

  #onMouseDown = (e) => {
    if (e.which === 1) {
      this.flags.isMouseDown = true;
    }
  };

  #onMouseUp = () => {
    this.flags.isMouseDown = false;
  };

  #onMouseMove = (e) => {
    this.measureCursor(e.pageX, e.pageY);
  };

  #onTouchMove = (e) => {
    this.measureCursor(e.touches[0].pageX, e.touches[0].pageY);
  };

  #onBlur = () => {
    this.flags.isMouseDown = false;
  };

  //

  measureCursor(x: number, y: number) {
    // store cursor position this frame and last

    if (this.coords.cursor.last.x === null || this.coords.cursor.last.y === null) {
      this.coords.cursor.last.x = x;
      this.coords.cursor.last.y = y;
    } else {
      this.coords.cursor.last.x = this.coords.cursor.x;
      this.coords.cursor.last.y = this.coords.cursor.y;
    }

    this.coords.cursor.x = x;
    this.coords.cursor.y = y;

    // calculate velocity

    const vx = this.coords.cursor.last.x === null ? 0 : this.coords.cursor.x - this.coords.cursor.last.x;
    const vy = this.coords.cursor.last.y === null ? 0 : this.coords.cursor.y - this.coords.cursor.last.y;
    const v = Math.sqrt(vx ** 2 + vy ** 2);

    if (this.state.velocity.last.v === null) {
      this.state.velocity.last.v = v;
      this.state.velocity.last.vx = vx;
      this.state.velocity.last.vy = vy;
    } else {
      this.state.velocity.last.v = this.state.velocity.v;
      this.state.velocity.last.vx = this.state.velocity.vx;
      this.state.velocity.last.vy = this.state.velocity.vy;
    }

    this.state.velocity.v = v;
    this.state.velocity.vx = vx;
    this.state.velocity.vy = vy;
  }

  // controller methods

  checkRounding(coordinate) {
    let roundedCoordinate = coordinate;
    if (Math.abs(roundedCoordinate) < this.config.lerp.roundOff) {
      roundedCoordinate = 0;
    }
    return roundedCoordinate;
  }

  #onAnimationUpdate = () => {
    // calculate cursor lerping

    if (this.coords.lerped.last.x === null || this.coords.lerped.last.y === null) {
      this.coords.lerped.last.x = this.coords.cursor.x;
      this.coords.lerped.last.y = this.coords.cursor.y;
    } else {
      this.coords.lerped.last.x = this.coords.lerped.x;
      this.coords.lerped.last.y = this.coords.lerped.y;
    }

    const lerpedLastX = this.coords.lerped.last.x;
    const lerpedLastY = this.coords.lerped.last.y;

    this.coords.lerped.x = this.checkRounding(
      lerpedLastX + (this.coords.cursor.x - lerpedLastX) * this.config.lerp.ratio,
    );
    this.coords.lerped.y = this.checkRounding(
      lerpedLastY + (this.coords.cursor.y - lerpedLastY) * this.config.lerp.ratio,
    );

    // calculate velocity lerping

    const vx = this.coords.lerped.x - this.coords.lerped.last.x;
    const vy = this.coords.lerped.y - this.coords.lerped.last.y;
    const v = Math.sqrt(vx ** 2 + vy ** 2);

    this.state.velocity.lerped.v = v;
    this.state.velocity.lerped.vx = vx;
    this.state.velocity.lerped.vy = vy;

    return false;
  };

  // show / hide cursor

  showCursor() {
    document.body.style.cursor = 'default';
  }

  hideCursor() {
    document.body.style.cursor = 'none';
  }

  //

  scrollChunk(chunk) {
    if (chunk) {
      this.coords.cursor.y += chunk;
      this.coords.lerped.y = this.coords.cursor.y;
    }
  }

  // getters
  // mouse up or down

  get isMouseDown() {
    return this.flags.isMouseDown;
  }

  // cursor position

  get lerpX() {
    return this.coords.lerped.x;
  }

  get lerpY() {
    return this.coords.lerped.y;
  }

  get x() {
    return this.coords.cursor.x;
  }

  get y() {
    return this.coords.cursor.y;
  }

  // velocity

  get v() {
    return this.state.velocity.v;
  }

  get vx() {
    return this.state.velocity.vx;
  }

  get vy() {
    return this.state.velocity.vy;
  }

  // lerped velocity

  get lerpV() {
    return this.state.velocity.lerped.v;
  }

  get lerpVX() {
    return this.state.velocity.lerped.vx;
  }

  get lerpVY() {
    return this.state.velocity.lerped.vy;
  }

  // destroy

  destroy() {
    this.removeEventListeners();
  }

}

export default new CursorController();
