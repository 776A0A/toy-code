import { events } from '../shared.js'

export class Menu {
  constructor(position, handleDelete) {
    this.position = position
    this.handleDelete = handleDelete
    this.menu = document.createElement('div')
    this.menu.id = 'canvas-editor-menu'

    this.handleClick = this.handleClick.bind(this)

    this.setStyle()
    this.setContent()
    this.addListener()
  }
  setStyle() {
    Object.assign(this.menu.style, {
      position: 'fixed',
      left: this.position.x + 'px',
      top: this.position.y + 'px',
      userSelect: 'none',
    })
  }
  setContent() {
    this.menu.innerHTML = `
        <ul style="padding: 0; list-style: none;">
            <li id="deleteGraphButton" role="button"
            style="
            border: 1px solid #aaa;
            padding: 0px 12px;
            cursor: pointer;
            background: #fff;
            ">
            删除
            </li>
        </ul>
        `
  }
  addListener() {
    this.menu.addEventListener('click', this.handleClick)
  }
  handleClick(evt) {
    if (evt.target.id === 'deleteGraphButton') {
      this.handleDelete()
      this.remove()
    }
  }
  append() {
    document.body.appendChild(this.menu)
  }
  remove() {
    this.menu?.removeEventListener('click', this.handleClick)
    this.menu?.remove()
    this.menu = null
  }
}
