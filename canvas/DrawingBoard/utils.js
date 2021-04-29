function calculateCenter(points) {
    let sum_x = 0
    let sum_y = 0
    let sum_area = 0
    let point = points[1]
    for (let i = 2; i < points.length; i++) {
        const _point = points[i]
        const area = calcArea(points[0], point, _point)
        sum_area += area
        sum_x += (points[0][0] + point[0] + _point[0]) * area
        sum_y += (points[0][1] + point[1] + _point[1]) * area
        point = _point
    }
    return [sum_x / sum_area / 3, sum_y / sum_area / 3]
}

function calcArea(p0, p1, p2) {
    return (
        (p0[0] * p1[1] +
            p1[0] * p2[1] +
            p2[0] * p0[1] -
            p1[0] * p0[1] -
            p2[0] * p1[1] -
            p0[0] * p2[1]) /
        2
    )
}

export const getGraphCenter = (graph) => {
    const name = graph.name

    if (name === 'rect' || name === 'picture') {
        const { x, y, width, height } = graph.attrs
        return [x + width / 2, y + height / 2]
    } else if (name === 'polygon') {
        const center = calculateCenter(graph.attrs.points.map(({ attrs: { x, y } }) => [x, y]))
        return center
    }
}

export const merge = (o1, o2) => {
    const obj = { ...o1 }
    for (const key in o2) {
        if (Object.hasOwnProperty.call(o2, key)) {
            const value = o2[key]
            if (value != null) obj[key] = value
        }
    }
    return obj
}

export function getDistance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}
