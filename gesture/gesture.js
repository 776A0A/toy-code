const body = document.body
const contexts = Object.create(null)
const MOUSE_SYMBOL = Symbol('mouse')

const start = (point, ctx) => {
	ctx.startX = point.clientX
	ctx.startY = point.clientY
	ctx.isPan = true
	ctx.isTap = ctx.isPress = false
	ctx.timer = setTimeout(() => {
		if (ctx.isPan || ctx.isTap) return
		ctx.isPress = true
	}, 500)
}
const move = (point, ctx) => {
	const diffX = point.clientX - ctx.startX,
		diffY = point.clientY - ctx.startY
	// 大于 10px 则进入pan阶段
	if (diffX ** 2 + diffY ** 2 > 100) {
		ctx.isPan = true
		ctx.isTap = ctx.isPress = false
	}
	console.log(point)
}
const end = (point, ctx) => {
	ctx.isPan = ctx.isTap = ctx.isPress = false
	clearTimeout(ctx.timer)
	console.log(point)
}
const cancel = (point, ctx) => {
	ctx.isTap = ctx.isPan = ctx.isPress = false
	clearTimeout(ctx.timer)
	console.log(point)
}

body.addEventListener('mousedown', e => {
	start(e, (contexts[MOUSE_SYMBOL] = Object.create(null)))
	const mousemove = e => {
		move(e, contexts[MOUSE_SYMBOL])
	}
	const up = e => {
		end(e, contexts[MOUSE_SYMBOL])
		document.removeEventListener('mousemove', mousemove)
		document.removeEventListener('mouseup', up)
	}
	document.addEventListener('mousemove', mousemove)
	document.addEventListener('mouseup', up)
})

body.addEventListener('touchstart', e => {
	for (const touch of e.changedTouches) {
		start(touch, (contexts[touch.identifier] = Object.create(null)))
	}
})
body.addEventListener('touchmove', e => {
	for (const touch of e.changedTouches) {
		move(touch, contexts[touch.identifier])
	}
})
body.addEventListener('touchend', e => {
	for (const touch of e.changedTouches) {
		end(touch, contexts[touch.identifier])
		delete contexts[touch.identifier]
	}
})
body.addEventListener('touchcancel', e => {
	for (const touch of e.changedTouches) {
		cancel(touch, contexts[touch.identifier])
		delete contexts[touch.identifier]
	}
})
