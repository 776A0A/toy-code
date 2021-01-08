import unique from './unique'

const noop = () => {}

function setDpr(canvas) {
  const dpr = window.devicePixelRatio
  canvas.width = canvas.width * dpr
  canvas.height = canvas.height * dpr
  canvas.getContext('2d').scale(dpr, dpr)
  return dpr
}

function drawWithSave(ctx, pathCb = noop, cb = noop) {
  ctx.save()
  ctx.beginPath()
  pathCb()
  ctx.closePath()
  cb(ctx)
  ctx.restore()
}

function calculateCenter(points) {
  let _x = 0,
    _y = 0,
    sum = 0,
    p1 = points[1],
    p2,
    area = 0

  for (let i = 2; i < points.length; i++) {
    p2 = points[i]
    area = getArea(points[0], p1, p2)
    sum += area
    _x += (points[0][0] + p1[0] + p2[0]) * area
    _y += (points[0][1] + p1[1] + p2[1]) * area
    p1 = p2
  }

  let x = _x / sum / 3
  let y = _y / sum / 3
  return [x, y]
}

function getArea(p0, p1, p2) {
  let area = 0.0

  area =
    p0[0] * p1[1] + p1[0] * p2[1] + p2[0] * p0[1] - p1[0] * p0[1] - p2[0] * p1[1] - p0[0] * p2[1]

  return area / 2
}

export default { setDpr, drawWithSave, unique, calculateCenter }
