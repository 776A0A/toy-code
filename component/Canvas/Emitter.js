export default class Emitter {
  constructor() {
    this.listeners = {}
  }
  on(type, cb) {
    const fns = this.listeners[type] || (this.listeners[type] = [])
    fns.push(cb)
    return this
  }
  off(type, cb) {
    const fns = this.listeners[type]
    if (!fns || !fns.length) return this
    this.listeners[type] = fns.filter(fn => fn !== cb)
    return this
  }
  emit(type, ...args) {
    const fns = this.listeners[type]
    if (!fns || !fns.length) return this
    fns.forEach(fn => fn(...args))
    return this
  }
}

let emitter

export function getEmitter() {
  return emitter || (emitter = new Emitter())
}
