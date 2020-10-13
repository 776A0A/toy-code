"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var enums_1 = require("./enums");
var nextState = 0 /* Initial */;
var token = {};
var tokenText = [];
var stack = [];
function parse(str) {
    var state = initial;
    for (var _i = 0, str_1 = str; _i < str_1.length; _i++) {
        var s = str_1[_i];
        state = state(s);
    }
    initToken();
    return stack;
}
function initToken() {
    stack.push(__assign(__assign({}, token), { text: tokenText.join('') }));
    tokenText = [];
}
var initial = function (s) {
    if (s === '>') {
        nextState = 3 /* GT */;
        token.type = enums_1.TokenType.RelOp;
        tokenText.push(s);
        return gt;
    }
    else if (utils_1.isAlpha(s) && !utils_1.isDigit(s)) {
        nextState = 1 /* Id */;
        token.type = enums_1.TokenType.Identifier;
        tokenText.push(s);
        return id;
    }
    else if (utils_1.isDigit(s)) {
        nextState = 2 /* IntConstant */;
        token.type = enums_1.TokenType.IntConstant;
        tokenText.push(s);
        return id;
    }
    else {
        nextState = 0 /* Initial */;
        return initial;
    }
};
var id = function (s) {
    if (utils_1.isSpace(s)) {
        initToken();
        return initial;
    }
    else if (utils_1.isAlpha(s) || !utils_1.isDigit(s)) {
        tokenText.push(s);
        return id;
    }
    else {
        initToken();
        return initial;
    }
};
var gt = function (s) {
    if (s === '=') {
        token.type = enums_1.TokenType.RelOp;
        tokenText.push(s);
        return ge;
    }
    else {
        initToken();
        return initial;
    }
};
var ge = function (s) {
    if (utils_1.isSpace(s)) {
        initToken();
        return initial;
    }
    else {
        throw TypeError('Unexpected token: ' + s);
    }
};
var intConstant = function (s) {
    if (utils_1.isDigit(s)) {
        tokenText.push(s);
        return intConstant;
    }
    else {
        initToken();
        return initial;
    }
};
var s1 = "age >= 45";
console.log(parse(s1));
//# sourceMappingURL=index.js.map