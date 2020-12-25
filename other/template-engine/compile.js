const compile = template => {
  const reg = /(\{\{\s*(\w+)\s*}\})/g

  let offset = 0
  let res = ''

  template.replace(reg, (_, matched, matched2, index) => {
    const str = template.slice(offset, index)
    offset = index + matched.length
    res += `with(data) {
        str += '${str}' + ${matched2}
    };\n`
  })
  res = `let str = '';\n` + res + `str = str + '${template.slice(offset)}'` + `\nreturn str`
  console.log(res)

  return Function('data', res)
}

console.log(compile(`<div>{{name}}</div><span>{{sex}}</span>`)({ name: 1, sex: 'male' }))
