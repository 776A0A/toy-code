export default class Animate {
  constructor({ object = Object.create(), duration = 0, action = () => {} }) {
    this.duration = duration
    this.action = action
    this.object = object
  }
  run(progression) {
    this.action(progression)
  }
}
