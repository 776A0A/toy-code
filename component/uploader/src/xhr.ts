import { noop } from './utils'

export default class UploadXHR {
	constructor(config) {
		this.init(config)
		this.create()
		this.listen()
	}
	init(config) {
		const defaultConfig = {
			xhr: null,
			onLoad: noop,
			onError: noop,
			onProcess: noop,
			method: 'POST',
			action: ''
		}

		Object.assign(this, defaultConfig)
		Object.assign(this, config)
	}
	create() {
		return (this.xhr = new XMLHttpRequest())
	}
	listen() {
		this.on('load', this.onLoad).on('error', this.onError)
		this.xhr.upload.addEventListener('progress', this.onProcess)
	}
	on(type, callback) {
		this.xhr?.addEventListener(type, callback.bind(this))
		return this
	}
	send(method, action?: string) {
		this.method = method ?? this.method
		this.action = action ?? this.action
		if (!this.action) throw Error('action 是必须的')
		this.xhr.send(this.method, this.action)
	}
}
