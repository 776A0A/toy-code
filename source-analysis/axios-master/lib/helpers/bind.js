'use strict';

module.exports = function bind(fn, thisArg) {
  // 运用闭包保存fn和this
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};
