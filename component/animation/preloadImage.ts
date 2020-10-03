import { ImageObject, ImageState } from './types'

export default function preloadImage(
	images: Array<string | object>,
	callback: (success: boolean) => void,
	timeout?: number
) {
	let count: number = 0
	let success: boolean = true
	let timeoutId: number | string = 0
	let isTimeout: boolean = false

	Object.keys(images).forEach(key => {
		let item = images[key]
		if (typeof item === 'string') {
			item = images[key] = { src: item }
		}
		if (!item || !item.src) return

		count++
		item.id = `__img__${key}${getId()}`
		item.img = globalThis[item.id] = new Image()

		doLoad(item)
	})

	function doLoad(item: ImageObject): void {
		const img = item.img
		item.state = ImageState.LOADING

		img.onload = () => {
			success = success ? true : false
			item.state = ImageState.LOADED
			done()
		}

		img.onerror = () => {
			success = false
			item.state = ImageState.ERROR
			done()
		}

		function done(): void {
			img.onload = img.onerror = null
			try {
				delete globalThis[item.id]
			} catch (error) {}

			if (!--count) {
				callback(success)
			}
		}
	}
}

let __id: number = 0
function getId(): number {
	return __id++
}
