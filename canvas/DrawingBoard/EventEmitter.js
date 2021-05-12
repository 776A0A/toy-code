export class EventEmitter {
  constructor() {
    this._handlers = {}
    this.beHandlers = new Set()
  }
  on({ elem, type, handler, capture = false } = {}) {
    if (elem instanceof Node) {
      elem.addEventListener(type, handler, capture)
    } else {
      const handlers =
        this._handlers[type] ?? (this._handlers[type] = new Set())

      handlers.add(handler)
    }

    return this
  }
  off({ elem, type, handler, capture = false } = {}) {
    if (elem instanceof Node) {
      elem.removeEventListener(type, handler, capture)
    } else {
      const handlers = this._handlers[type]

      if (!handlers || handlers.size === 0) return this

      if (handler) handlers.delete(handler)
      else this._handlers[type] = new Set() // 没有传入具体的cb，则直接清除所有该类型的监听器
    }

    return this
  }
  emit(type, ...args) {
    let canRun = true

    if (this.beHandlers.size) {
      canRun = validateCanRun([...this.beHandlers])
      const handlers = [...this.beHandlers]
    }

    if (!canRun) return this

    const handlers = this._handlers[type]

    if (handlers && handlers.size) {
      ;[...handlers].forEach((handler) => handler(...args))
    }

    return this
  }

  beforeEach(cb) {
    this.beHandlers.add(cb)
    return this
  }
}

function validateCanRun(fns) {
  let canRun = true

  for (let idx = 0; idx < fns.length; idx++) {
    const fn = fns[idx]
    const res = fn()
    if (res === false) {
      canRun = false
      break
    }
  }

  return canRun
}
