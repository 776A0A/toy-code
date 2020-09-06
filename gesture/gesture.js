function enableGesture(elem) {
	const contexts = Object.create(null)
	const MOUSE_SYMBOL = Symbol('mouse')

	const dispatchEvent = (event, config) =>
		elem.dispatchEvent(
			new CustomEvent(event, { bubbles: true, detail: config })
		)

	const start = (point, ctx) => {
		ctx.startX = point.clientX
		ctx.startY = point.clientY
		ctx.isTap = true
    ctx.isPan = ctx.isPress = false
		dispatchEvent('start', {
			startX: ctx.startX,
			startY: ctx.startY,
			clientX: point.clientX,
			clientY: point.clientY
		})
		ctx.timer = setTimeout(() => {
			if (ctx.isPan) return
			ctx.isPress = true
			ctx.isTap = false
			dispatchEvent('pressstart', {
				startX: ctx.startX,
				startY: ctx.startY,
				clientX: point.clientX,
				clientY: point.clientY
			})
		}, 500)
	}
	const move = (point, ctx) => {
		const diffX = Math.abs(point.clientX - ctx.startX),
			diffY = Math.abs(point.clientY - ctx.startY)
		// 大于 10px 则进入pan阶段
		if (!ctx.isPan && diffX ** 2 + diffY ** 2 > 100) {
			ctx.isPan = true
      ctx.isTap = ctx.isPress = false
			dispatchEvent('panstart', {
				startX: ctx.startX,
				startY: ctx.startY,
				clientX: point.clientX,
				clientY: point.clientY
			})
		}
		dispatchEvent('pan', {
			startX: ctx.startX,
			startY: ctx.startY,
			clientX: point.clientX,
			clientY: point.clientY
		})
	}
	const end = (point, ctx) => {
		if (ctx.isPan) {
			dispatchEvent('panend', {
				startX: ctx.startX,
				startY: ctx.startY,
				clientX: point.clientX,
				clientY: point.clientY
			})
		} else if (ctx.isTap) {
			dispatchEvent('tap', {
				startX: ctx.startX,
				startY: ctx.startY,
				clientX: point.clientX,
				clientY: point.clientY
			})
		} else if (ctx.isPress) {
			dispatchEvent('pressend', {
				startX: ctx.startX,
				startY: ctx.startY,
				clientX: point.clientX,
				clientY: point.clientY
			})
		}
		ctx.isPan = ctx.isTap = ctx.isPress = false
		clearTimeout(ctx.timer)
	}
	const cancel = (point, ctx) => {
		dispatchEvent('cancel', {
			startX: ctx.startX,
			startY: ctx.startY,
			clientX: point.clientX,
			clientY: point.clientY
		})
		ctx.isTap = ctx.isPan = ctx.isPress = false
		clearTimeout(ctx.timer)
	}

	// 为null的时候是触摸设备，为undefined是电脑
	if (document.ontouchstart !== null)
		elem.addEventListener('mousedown', e => {
			start(e, (contexts[MOUSE_SYMBOL] = Object.create(null)))
			const mousemove = e => {
				move(e, contexts[MOUSE_SYMBOL])
			}
			const mouseup = e => {
				end(e, contexts[MOUSE_SYMBOL])
				document.removeEventListener('mousemove', mousemove)
				document.removeEventListener('mouseup', mouseup)
			}
			document.addEventListener('mousemove', mousemove)
			document.addEventListener('mouseup', mouseup)
		})

	elem.addEventListener('touchstart', e => {
		for (const touch of e.changedTouches) {
			start(touch, (contexts[touch.identifier] = Object.create(null)))
		}
	})
	elem.addEventListener('touchmove', e => {
		for (const touch of e.changedTouches) {
			move(touch, contexts[touch.identifier])
		}
	})
	elem.addEventListener('touchend', e => {
		for (const touch of e.changedTouches) {
			end(touch, contexts[touch.identifier])
			delete contexts[touch.identifier]
		}
	})
	elem.addEventListener('touchcancel', e => {
		for (const touch of e.changedTouches) {
			cancel(touch, contexts[touch.identifier])
			delete contexts[touch.identifier]
		}
	})
}
