class Stack {
  constructor() {
    this.count = 0
    this.items = {}
  }
  push(element) {
    this.items[this.count] = element
    this.count++
  }
  get size() {
    return this.count
  }
  get isEmpty() {
    return this.count === 0
  }
  pop() {
    if (this.isEmpty) return
    this.count--
    const result = this.items[this.count]
    delete this.items[this.count]
    return result
  }
  peek() {
    if (this.isEmpty) return
    return this.items[this.count - 1]
  }
  clear() {
    this.count = 0
    this.items = {}
  }
  toString() {
    if (this.isEmpty) return ''
    let string = '',
      i = 0
    for (; i < this.size; i++) string += this.items[i]
    return string
  }
}

function baseConverter(num, base) {
  const stack = new Stack()
  const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
  while (num > 0) {
    const r = digits[Math.floor(num % base)]
    stack.push(r)
    num = Math.floor(num / base)
  }
  let result = ''
  while (!stack.isEmpty) {
    result += stack.pop().toString()
  }
  return result
}

console.log(baseConverter(233, 16)) // 11101001
console.log(baseConverter(10, 16)) // 1010
console.log(baseConverter(1000, 16)) // 1111101000
