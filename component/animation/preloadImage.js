"use strict";
exports.__esModule = true;
var enums_1 = require("./enums");
function preloadImage(images, callback, timeout) {
    var count = 0;
    var success = true;
    var timeoutId;
    var isTimeout = false;
    Object.keys(images).forEach(function (key) {
        var item = images[key];
        if (typeof item === 'string') {
            item = images[key] = { src: item };
        }
        if (!item || !item.src)
            return;
        count++;
        item.id = "__img__" + key + getId();
        item.img = globalThis[item.id] = new Image();
        doLoad(item);
    });
    if (!count) {
        callback(success);
    }
    else if (timeout) {
        timeoutId = setTimeout(onTimeout, timeout);
    }
    function doLoad(item) {
        var img = item.img;
        item.state = enums_1.IMAGE_STATE.LOADING;
        img.onload = function () {
            success = success ? true : false;
            item.state = enums_1.IMAGE_STATE.LOADED;
            done();
        };
        img.onerror = function () {
            success = false;
            item.state = enums_1.IMAGE_STATE.ERROR;
            done();
        };
        img.src = item.src;
        function done() {
            img.onload = img.onerror = null;
            try {
                delete globalThis[item.id];
            }
            catch (error) { }
            if (!--count && !isTimeout) {
                clearTimeout(timeoutId);
                callback(success);
            }
        }
    }
    function onTimeout() {
        isTimeout = true;
        callback(false);
    }
}
exports["default"] = preloadImage;
var __id = 0;
function getId() {
    return __id++;
}
