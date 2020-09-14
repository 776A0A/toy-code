const hash = Math.random().toString(36).slice(2)

const plusIcon = `
  <i aria-label="图标: plus" class="anticon anticon-plus">
    <svg viewBox="64 64 896 896" data-icon="plus" width="1em" height="1em" fill="currentColor" aria-hidden="true"
      focusable="false" class="">
      <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path>
      <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path>
    </svg>
  </i>
`

const itemTemplate = `

`
const triggerTemplate = `
  <label id="trigger-${hash}">
    <div class="plus-icon-${hash}">${plusIcon}</div>
    <div class="process-${hash}">
      <div class="process-text=${hash}">上传中...</div>
      <div class="process-bar=${hash}"></div>
    </div>
    <input type="file" accept="image/*" id="trigger-input-${hash}">
  </label>
`

export default class Uploader {
	constructor() {
		this.init()
	}
	init() {}
}
