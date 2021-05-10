// 显示，负责刷新页面
export class Display {
  constructor(canvas) {
    this.canvas = canvas
  }
  draw(graphs) {
    graphs.forEach((graph) => graph.draw())
  }
  clean() {
    this.canvas
      .getContext('2d')
      .clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
  refresh(graphs) {
    this.clean()
    this.draw(graphs)
  }
}
