class RoundItem {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.r = 1
    this.id = null
  }
  draw() {
    ctx.fillStyle = `rgba(${this.random()}, ${this.random()}, ${this.random()}, ${Math.random().toFixed(
      2
    )})`
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()

    this.amplify()
  }
  amplify() {
    if (this.r >= 10) {
      circles = circles.filter(item => item !== this)
      return
    }
    this.r += 1
  }
  random() {
    return Math.floor(Math.random() * 255) + 1
  }
}

const canvas = document.getElementById('c2')
const ctx = canvas.getContext('2d')
let circles = []

let moving = false,
  x = 0,
  y = 0

canvas.onmouseenter = e => {
  moving = true
  x = e.pageX
  y = e.pageY
}

canvas.onmouseleave = e => {
  moving = false
  x = y = 0
}

canvas.onmousemove = e => {
  if (!moving) return
  x = e.pageX
  y = e.pageY
  const item = new RoundItem(x, y)
  circles.push(item)
  item.draw()
}

function animate() {
  ctx.clearRect(0, 0, 400, 400)
  circles.forEach(circle => circle.draw())
  requestAnimationFrame(animate)
}

animate()

export default () => {}
