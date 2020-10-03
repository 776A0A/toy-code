"use strict";
exports.__esModule = true;
var IMAGE_STATE;
(function (IMAGE_STATE) {
    IMAGE_STATE[IMAGE_STATE["LOADING"] = 0] = "LOADING";
    IMAGE_STATE[IMAGE_STATE["LOADED"] = 1] = "LOADED";
    IMAGE_STATE[IMAGE_STATE["ERROR"] = 2] = "ERROR";
})(IMAGE_STATE = exports.IMAGE_STATE || (exports.IMAGE_STATE = {}));
var TASK_TYPE;
(function (TASK_TYPE) {
    TASK_TYPE[TASK_TYPE["SYNC"] = 0] = "SYNC";
    TASK_TYPE[TASK_TYPE["ASYNC"] = 1] = "ASYNC";
})(TASK_TYPE = exports.TASK_TYPE || (exports.TASK_TYPE = {}));
