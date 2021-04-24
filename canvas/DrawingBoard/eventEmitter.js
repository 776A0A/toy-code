export class EventEmitter {
    constructor() {
        this.listeners = {}
    }
    listen(elem, type, cb) {
        if (elem instanceof Element) {
            elem.addEventListener(type, cb)
        } else {
            cb = type
            type = elem
            const listeners =
                this.listeners[type] ?? (this.listeners[type] = new Set())
            listeners.add(cb)
        }
        return this
    }
    emit(type, ...args) {
        const listeners = this.listeners[type]
        if (listeners) {
            ;[...listeners].forEach((cb) => cb(...args))
        }
        return this
    }
}
