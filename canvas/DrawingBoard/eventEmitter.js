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
    // TODO 添加对元素dom的事件移除
    remove(type, cb) {
        const listeners = this.listeners[type]
        if (!listeners || listeners.length === 0) return this

        if (cb) listeners.delete(cb)
        else this.listeners[type] = new Set() // 没有传入具体的cb，则直接清除所有该类型的监听器

        return this
    }
}
