export default class Timeline {
  constructor(startTime) {
    this.startTime = startTime
    this.animates = []
  }
  run() {
    this.animates.forEach(animate => {
      animate.run()
    })
  }
  add(animate) {
    this.animates.push(animate)
  }
}
