"use strict";
exports.__esModule = true;
var TIMELINE_STATE;
(function (TIMELINE_STATE) {
    TIMELINE_STATE[TIMELINE_STATE["INITIAL"] = 0] = "INITIAL";
    TIMELINE_STATE[TIMELINE_STATE["START"] = 1] = "START";
    TIMELINE_STATE[TIMELINE_STATE["STOP"] = 2] = "STOP";
})(TIMELINE_STATE || (TIMELINE_STATE = {}));
var Timeline = /** @class */ (function () {
    function Timeline() {
        this.interval = 1000 / 16;
        this.state = TIMELINE_STATE.INITIAL;
        this.animationHandlerId = 0;
    }
    Timeline.prototype.onenterframe = function (time) { };
    Timeline.prototype.start = function (interval) {
        if (this.state === TIMELINE_STATE.START)
            return;
        this.state = TIMELINE_STATE.START;
        if (interval)
            this.interval = interval;
        startTimeline(this, Date.now());
    };
    Timeline.prototype.stop = function () {
        if (this.state !== TIMELINE_STATE.START)
            return;
        this.state = TIMELINE_STATE.STOP;
        if (this.startTime) {
            this.duration = Date.now() - this.startTime;
        }
        cancelAnimationFrame(this.animationHandlerId);
    };
    Timeline.prototype.restart = function () {
        if (this.state === TIMELINE_STATE.START ||
            !this.duration ||
            !this.interval) {
            return;
        }
        this.state = TIMELINE_STATE.START;
        startTimeline(this, Date.now() - this.duration);
    };
    return Timeline;
}());
exports["default"] = Timeline;
function startTimeline(timeline, startTime) {
    var lastTick = Date.now(); // 上一次回调的时间戳
    var nextTick = function () {
        var now = Date.now();
        timeline.animationHandlerId = requestAnimationFrame(nextTick);
        // 如果当前时间与上一次的间隔大于指定的interval，表示可以执行回调函数
        if (now - lastTick >= timeline.interval) {
            timeline.onenterframe(now - startTime);
            lastTick = now;
        }
    };
    timeline.startTime = startTime;
    nextTick.interval = timeline.interval;
    nextTick();
}
