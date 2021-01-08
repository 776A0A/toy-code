let ids = {}

function createId() {
  let id = getUniqueId()
  while (ids[id]) id = getUniqueId()
  ids[id] = true
  return id
}

function getUniqueId() {
  return Array(3)
    .fill(0)
    .map(() => Math.ceil(Math.random() * 255))
    .concat(255)
    .join('-')
}

function idToRgba(id) {
  return id.split('-')
}

function rgbaToId(rgba) {
  return rgba.join('-')
}

function clearIds() {
  ids = {}
}

export default { createId, idToRgba, rgbaToId, clearIds }
