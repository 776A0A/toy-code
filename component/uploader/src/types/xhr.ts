export type Method = 'get' | 'GET'

export interface XHRConfig {
	onLoad?: (e: object) => void
	onError?: (e: object) => void
	onProcess?: (e: object) => void
  method?: Method
  action: string
}

export interface XHR {
  xhr: XMLHttpRequest

}