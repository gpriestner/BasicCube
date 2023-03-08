class KeyState {
  isPressed = false;
  isReleased = false;
  constructor(isPressed, isReleased) {
    this.isPressed = isPressed;
    this.isReleased = isReleased;
  }
}
export class Keyboard {
  static Keyboard = (() => {
    addEventListener("keydown", Keyboard.keyDown);
    addEventListener("keyup", Keyboard.keyUp);
  })();
  static state = {};
  static keyDown(event) {
    event.preventDefault();
    const state = Keyboard.state[event.code];
    if (state === undefined)
      Keyboard.state[event.code] = new KeyState(true, true);
    else state.isPressed = true;
  }
  static keyUp(event) {
    event.preventDefault();
    const state = Keyboard.state[event.code];
    state.isPressed = false;
    state.isReleased = true;
  }
  static isDown(key) {
    // returns true while the key is in the down position
    const state = Keyboard.state[key];
    if (state === undefined) return false;
    else return state.isPressed;
  }
  static isPressed(key) {
    // returns true only once when first de-pressed
    // must be released and re-pressed before returning true again
    const state = Keyboard.state[key];
    if (state === undefined) return false;
    if (state.isPressed && state.isReleased) {
      state.isReleased = false;
      return true;
    } else return false;
  }
}
