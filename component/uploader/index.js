class Uploader {
	constructor(config) {
		const { action } = config
		if (!action) throw Error('action 是必须的')
		this.initProps()
		Object.assign(this, config)
	}
	initProps() {
		this.fileList = []
		this.accept = 'image/*'
		this.multiple = false
		this.listType = 'card'
		this.limit = false
		this.immediately = true
		this.limitSize = 10 * 1024
		this.name = 'file'
		this.withCredentials = false
	}
}
