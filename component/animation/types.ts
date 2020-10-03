export interface ImageObject {
	id: string
	img: HTMLImageElement
	state: ImageState
}

export enum ImageState {
	LOADING,
	LOADED,
	ERROR
}
