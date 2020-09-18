import './styles/index.css'
import { _, __ } from './utils'
import { fileItem } from './template'

const triggerDom = _('#trigger')
const processBarDom = _('.process-bar')
const processBarAnimationDom = _('.process-bar-animation')
const plusIconDom = _('.plus-icon')
const fileListDom = _('#file-list')

triggerDom.addEventListener(
	'change',
	e => {
		e.stopPropagation()
    const file = e.target.files[0]
    const item = getDom()
		switchHide(plusIconDom)
		switchHide(processBarDom, false)
		setTimeout(() => {
			processBarAnimationDom.classList.add('p-10')
			getPreview(file).then(previewURL => {
				// console.log(previewURL)
			})
		}, 500)
	},
	true
)

function getPreview(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = e => resolve(e.target.result)
		reader.onabort = reader.onerror = reject
	})
}

function switchHide(el, hide = true) {
	if (hide) el.classList.add('hide')
	else el.classList.remove('hide')
}

function getDom(str) {
	const div = document.createElement('div')
	div.innerHTML = str
	return div.children[0]
}
