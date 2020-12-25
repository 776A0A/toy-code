class Compose {
  constructor() {
    this.middlewares = []
    this.index = 0
  }
  bootstrap(middlewares) {
    this.middlewares = middlewares
  }
  dispatch(index) {
    const fn = this.middlewares[index]
    if (!fn) return Promise.resolve()
    this.index++
    return Promise.resolve(fn(this.dispatch.bind(this, this.index)))
  }
}

export default (middlewares = []) => () => new Compose().bootstrap(middlewares)
