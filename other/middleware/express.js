const compose = (middlewares = []) => {
  return async () => {
    let idx = 0
    const next = () => {
      if (idx === middlewares.length) return Promise.resolve()
      if (idx < middlewares.length) {
        return Promise.resolve(middlewares[i++](next)) // 也是一种将控制权交出去的方法
      }
    }

    return await next()
  }
}

export default compose
