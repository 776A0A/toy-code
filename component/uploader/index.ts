import createPreview from './src/preview'
import UploadXHR from './src/xhr'

export default class Uploader {
	fileList: any[]
	accept: string
	multiple: boolean
	listType: string
	limit: boolean
	immediately: boolean
	limitSize: number
	name: string
	withCredentials: boolean
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

const action = `http://client2.365hy.com/niumore123456/upload`
const _ = sel => document.querySelector(sel)
const $uploader = {
	trigger: _('#w-uploader-trigger'),
	input: _('#trigger-input'),
	process: _('.uploader-process'),
	processBar: _('.process-bar'),
	fileListWrapper: _('#file-list-wrapper')
}

const imgItem = `
      <div class="img-item" style="width:200px;height:200px;">
        <img src="__preview__" style="width:100%;height:100%;object-fit:contain;" >  
      <div>
    `

const xhr = new UploadXHR({
	onLoad(e) {
		$uploader.processBar.classList.add('p-10')
		setTimeout(() => {
			$uploader.process.style.display = 'none'
		}, 300)
		const res = JSON.parse(e.target.response)
		const img = imgItem.replace('__preview__', preview)
		$uploader.fileListWrapper.innerHTML = img
	},
	onProcess(e) {
		if (e.lengthComputable) {
			const percent = (e.loaded / e.total) * 100
			if (percent >= 20) {
				$uploader.processBar.classList.add('p-2')
			} else if (percent > 20 && percent <= 40) {
				$uploader.processBar.classList.add('p-4')
			} else if (percent > 40 && percent <= 60) {
				$uploader.processBar.classList.add('p-6')
			} else if (percent > 60 && percent <= 80) {
				$uploader.processBar.classList.add('p-8')
			} else if (percent === 100) {
				$uploader.processBar.classList.add('p-10')
			}
		}
	}
})
let preview = null

$uploader.input.addEventListener('change', async e => {
	const file = e.target.files[0]
	preview = await createPreview(file)
	const formData = new FormData()
	formData.append('file', file)
	xhr.send(formData)
})
