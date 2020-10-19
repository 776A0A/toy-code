/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 * 在调用这个函数前加上上面的注释，能在必要的时候避免rollup打包
 */
// GOOD 通过创建一个map，并返回一个函数来确定一个key是否存在于map中
export function makeMap(
  str: string,
  expectsLowerCase?: boolean
): (key: string) => boolean {
  const map: Record<string, boolean> = Object.create(null)
  const list: Array<string> = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  // 导出一个函数，用闭包保存map
  return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val]
}
