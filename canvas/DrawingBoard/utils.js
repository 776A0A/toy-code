export function calculateCenter(points) {
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
    if (graph.name === 'rect') {
        const { x, y, width, height } = graph
        return [x + width / 2, y + height / 2]
    } else if (graph.name === 'polygon') {
        const center = utils.calculateCenter(
            graph.points.map(({ x, y }) => [x, y])
        )
        return center
    }
}
