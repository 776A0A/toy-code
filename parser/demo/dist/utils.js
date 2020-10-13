"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isAlpha(s) {
    return typeof s === 'string';
}
exports.isAlpha = isAlpha;
function isDigit(s) {
    return !!Number(s) && typeof Number(s) === 'number';
}
exports.isDigit = isDigit;
function isSpace(s) {
    return /\s+/.test(s);
}
exports.isSpace = isSpace;
//# sourceMappingURL=utils.js.map