class Handler {
    constructor (fn) {
        this.handler = fn
        this.next = null
    }
    setNext (handler) {
        this.next = handler
    }
}

const compose = (middlewares = []) {
    const handlers = []
    middlewares.forEach(fn => {
        const handler = new Handler(fn)
        handlers.push(handler)
    })

    for (let index = 0, handler; handler = handlers[index++];) {
        if (handlers[index]) handler.setNext(handlers[index])
    }

    return run(handlers[0])
    
    function run(handler) {
        if(!handler) return Promise.resolve()
        return Promise.resolve(handler.handler(() => run(handler.next)))
    }
}
