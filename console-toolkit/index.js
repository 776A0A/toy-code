const tty = require('tty')
const ttys = require('ttys')
const rl = require('readline')

const stdin = ttys.stdin
const stdout = ttys.stdout

stdout.write('Hello World\n')
stdout.write('\033[1A')
stdout.write('xxxx\n') 