const canvas = document.getElementById('c1')
const ctx = canvas.getContext('2d')

const dots = []

function init(n) {
  for (let i = 0; i < n; i++) {
    const item = new RoundItem(i, Math.random() * 400, Math.random() * 400)
    dots.push(item)
    item.draw(ctx)
  }
  animate()
}

class RoundItem {
  constructor(idx, x, y) {
    this.idx = idx
    this.x = x
    this.y = y
    this.r = Math.random() * 2 + 1
    const alpha = Math.random().toFixed(2)
    this.bgc = `rgba(255, 255, 255, ${alpha})`
  }
  draw() {
    ctx.fillStyle = this.bgc
    ctx.shadowBlur = this.r * 2
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()
  }
  move() {
    if (this.y < -10) return (this.y = 400)
    this.y -= 0.5
    this.draw()
  }
}

function animate() {
  ctx.clearRect(0, 0, 400, 400)
  dots.forEach(dot => dot.move())
  requestAnimationFrame(animate)
}

init.bind(null, Math.floor(Math.random() * 100) + 50)()

export default () =>{}
