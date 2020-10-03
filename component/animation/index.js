"use strict";
exports.__esModule = true;
var preloadImage_1 = require("./preloadImage");
var enums_1 = require("./enums");
var Timeline_1 = require("./Timeline");
var ANIMATION_STATE;
(function (ANIMATION_STATE) {
    ANIMATION_STATE[ANIMATION_STATE["INITIAL"] = 0] = "INITIAL";
    ANIMATION_STATE[ANIMATION_STATE["START"] = 1] = "START";
    ANIMATION_STATE[ANIMATION_STATE["STOP"] = 2] = "STOP";
})(ANIMATION_STATE || (ANIMATION_STATE = {}));
var _Animation = /** @class */ (function () {
    function _Animation() {
        this.taskQueue = [];
        this.index = 0; // 当前正在执行的task的索引
        this.state = ANIMATION_STATE.INITIAL;
        this.timeline = new Timeline_1["default"]();
    }
    _Animation.prototype.loadImage = function (imgList) {
        var taskFn = function (next) {
            preloadImage_1["default"](imgList.slice(), next);
        };
        var type = enums_1.TASK_TYPE.SYNC;
        return this._add(taskFn, type);
    };
    _Animation.prototype.start = function (interval) {
        if (this.state === ANIMATION_STATE.START || !this.taskQueue.length)
            return this;
        this.state = ANIMATION_STATE.START;
        this.interval = interval;
        this._runTask();
        return this;
    };
    _Animation.prototype.changePosition = function (ele, positions, imageURL) {
        var _this = this;
        function next(callback) {
            callback && callback();
        }
        var length = positions.length;
        var taskFn, type;
        if (length) {
            taskFn = function (next, time) {
                if (imageURL)
                    ele.style.backgroundImage = "url(" + imageURL + ")";
                var index = Math.min((time / _this.interval) | 0, length - 1);
                var _a = positions[index].split(' '), x = _a[0], y = _a[1];
                ele.style.backgroundPosition = x + "px " + y + "px";
                if (index === length - 1)
                    next();
            };
            type = enums_1.TASK_TYPE.ASYNC;
        }
        else {
            taskFn = next;
            type = enums_1.TASK_TYPE.SYNC;
        }
        return this._add(taskFn, type);
    };
    _Animation.prototype.changeSrc = function (ele, imgList) {
        var _this = this;
        function next(callback) {
            callback && callback();
        }
        var length = imgList.length;
        var taskFn, type;
        if (length) {
            taskFn = function (next, time) {
                var index = Math.min((time / _this.interval) | 0, length - 1);
                ele.src = imgList[index];
                if (index === length - 1)
                    next();
            };
            type = enums_1.TASK_TYPE.ASYNC;
        }
        else {
            taskFn = next;
            type = enums_1.TASK_TYPE.SYNC;
        }
        return this._add(taskFn, type);
    };
    _Animation.prototype.enterFrame = function (taskFn) {
        return this._add(taskFn, enums_1.TASK_TYPE.ASYNC);
    };
    _Animation.prototype.then = function (callback) {
        var taskFn = function (next) {
            callback();
            next();
        };
        var type = enums_1.TASK_TYPE.SYNC;
        return this._add(taskFn, type);
    };
    _Animation.prototype.repeat = function (times) {
        var _this = this;
        var taskFn = function () {
            // 无限循环
            if (!times) {
                _this.index--;
                _this._runTask();
                return;
            }
            if (times) {
                times--;
                _this.index--;
                _this._runTask();
            }
            else {
                _this._next(_this.taskQueue[_this.index]);
            }
        };
        var type = enums_1.TASK_TYPE.SYNC;
        return this._add(taskFn, type);
    };
    _Animation.prototype.repeatInfinity = function () {
        return this.repeat();
    };
    _Animation.prototype.wait = function (time) {
        if (this.taskQueue.length > 0) {
            this.taskQueue[this.taskQueue.length - 1].wait = time;
        }
        return this;
    };
    _Animation.prototype.pause = function () {
        if (this.state === ANIMATION_STATE.START) {
            this.state = ANIMATION_STATE.STOP;
            this.timeline.stop();
        }
        return this;
    };
    _Animation.prototype.restart = function () {
        if (this.state === ANIMATION_STATE.STOP) {
            this.state = ANIMATION_STATE.START;
            this.timeline.restart();
        }
        return this;
    };
    _Animation.prototype.dispose = function () {
        if (this.state !== ANIMATION_STATE.INITIAL) {
            this.state = ANIMATION_STATE.INITIAL;
            this.taskQueue = [];
            this.timeline.stop();
            this.timeline = null;
        }
        return this;
    };
    _Animation.prototype._add = function (taskFn, type) {
        this.taskQueue.push({ taskFn: taskFn, type: type });
        return this;
    };
    _Animation.prototype._runTask = function () {
        if (this.state !== ANIMATION_STATE.START || !this.taskQueue.length)
            return this;
        if (this.index === this.taskQueue.length) {
            this.dispose();
            return this;
        }
        var task = this.taskQueue[this.index];
        if (task.type === enums_1.TASK_TYPE.SYNC) {
            this._syncTask(task);
        }
        else {
            this._asyncTask(task);
        }
    };
    _Animation.prototype._syncTask = function (task) {
        var _this = this;
        var next = function () { return _this._next(task); };
        task.taskFn(next);
    };
    _Animation.prototype._asyncTask = function (task) {
        var _this = this;
        // 定义每一帧执行的回调函数
        var enterFrame = function (time) {
            var next = function () {
                _this.timeline.stop();
                _this._next(task);
            };
            task.taskFn(next, time);
        };
        this.timeline.onenterframe = enterFrame;
        this.timeline.start(this.interval);
    };
    _Animation.prototype._next = function (task) {
        var _this = this;
        this.index++;
        if (task && task.wait) {
            setTimeout(function () {
                _this._runTask();
            }, task.wait);
        }
        else
            this._runTask();
    };
    return _Animation;
}());
