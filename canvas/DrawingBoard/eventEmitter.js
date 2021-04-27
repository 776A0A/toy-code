export class EventEmitter {
    constructor() {
        this._handlers = {}
    }
    on(elem, type, handler) {
        if (elem instanceof Element) {
            elem.addEventListener(type, handler)
        } else {
            handler = type
            type = elem

            const handlers =
                this._handlers[type] ?? (this._handlers[type] = new Set())

            handlers.add(handler)
        }

        return this
    }
    off(elem, type, handler) {
        if (elem instanceof Element) {
            elem.removeEventListener(type, handler)
        } else {
            handler = type
            type = elem

            const handlers = this._handlers[type]

            if (!handlers || handlers.size === 0) return this

            if (handler) handlers.delete(handler)
            else this._handlers[type] = new Set() // 没有传入具体的cb，则直接清除所有该类型的监听器
        }

        return this
    }
    emit(type, ...args) {
        const handlers = this._handlers[type]

        if (handlers && handlers.size) {
            ;[...handlers].forEach((handler) => handler(...args))
        }

        return this
    }
}
