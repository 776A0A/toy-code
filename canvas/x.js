const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
let timer

const rect = {
    x: Math.floor(Math.random() * canvas.width),
    y: Math.floor(Math.random() * canvas.height),
    width: 5,
    height: 5,
    vx: 1,
    vy: 5,
    color: 'blue',
    draw() {
        ctx.save()
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
        ctx.restore()
    },
}

const board = {
    x: 50,
    y: 400,
    width: 200,
    height: 5,
    vx: 10,
    vy: 0,
    color: 'red',
    draw() {
        ctx.save()
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
        ctx.restore()
    },
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    rect.x += rect.vx
    rect.y += rect.vy

    if (rect.x + rect.vx + rect.width > canvas.width || rect.x + rect.vx < 0) {
        rect.vx = -rect.vx
    }
    if (
        rect.y + rect.vy + rect.height > canvas.height ||
        rect.y + rect.vy < 0
    ) {
        rect.vy = -rect.vy
    }

    if (isIntersected()) {
        rect.vy = -rect.vy
    }

    rect.draw()
    board.draw()

    timer = requestAnimationFrame(draw)
}

timer = requestAnimationFrame(draw)

window.onkeydown = (evt) => {
    evt.preventDefault()

    cancelAnimationFrame(timer)

    if (evt.code === 'ArrowLeft') {
        if (board.x <= 0) board.x = 0
        else board.x -= board.vx
    } else if (evt.code === 'ArrowRight') {
        if (board.x + board.width >= canvas.width)
            board.x = canvas.width - board.width
        else board.x += board.vx
    }
    timer = requestAnimationFrame(draw)
}

function isIntersected() {
    return (
        rect.vy > 0 &&
        rect.y + rect.height >= board.y - rect.height &&
        rect.y + rect.height <= board.y + board.height &&
        rect.x > board.x &&
        rect.x + rect.width < board.x + board.width
    )
}
