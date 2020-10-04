import { ImageObject } from './types'
import { IMAGE_STATE } from './enums'

export default function preloadImage(
	images: Array<string | object>,
	callback: (success: boolean) => void,
	timeout?: number
) {
	let count: number = 0
	let success: boolean = true
	let timeoutId: any
	let isTimeout: boolean = false

	Object.keys(images).forEach(key => {
		let item = images[key]
		if (typeof item === 'string') {
			item = images[key] = { src: item }
		}
		if (!item || !item.src) return

		count++
		item.id = `__img__${key}__${getId()}`
		item.img = new Image()

		doLoad(item)
	})

	if (!count) {
		callback(success)
	} else if (timeout) {
		timeoutId = setTimeout(onTimeout, timeout)
	}

	function doLoad(item: ImageObject): void {
		const img = item.img
		item.state = IMAGE_STATE.LOADING

		img.onload = () => {
			success = success ? true : false
			item.state = IMAGE_STATE.LOADED
			done()
		}

		img.onerror = err => {
			success = false
			item.state = IMAGE_STATE.ERROR
			done()
		}

		img.src = item.src

		function done(): void {
			img.onload = img.onerror = null

			if (!--count && !isTimeout) {
				clearTimeout(timeoutId)
				callback(success)
			}
		}
	}

	function onTimeout() {
		isTimeout = true
		callback(false)
	}
}

let __id: number = 0
function getId(): number {
	return __id++
}
