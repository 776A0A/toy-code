import unique from './unique'
import { noop, calculateCenter } from 'utils'

function setDpr(canvas) {
  const dpr = (window.devicePixelRatio, 1)
  canvas.width = canvas.width * dpr
  canvas.height = canvas.height * dpr
  canvas.getContext('2d').scale(dpr, dpr)
  return dpr
}

function drawWithSave(ctx, pathCb = noop, cb) {
  if (!cb) {
    cb = pathCb
    pathCb = noop
  }
  ctx.save()
  ctx.beginPath()
  pathCb(ctx)
  ctx.closePath()
  cb(ctx)
  ctx.restore()
}

const utils = {
  setDpr,
  drawWithSave(...args) {
    drawWithSave(...args)
    return this
  },
  unique,
  calculateCenter
}

export default utils
