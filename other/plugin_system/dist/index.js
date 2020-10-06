/**
 * 参考自
 * https://css-tricks.com/designing-a-javascript-plugin-system/
 */
var betaCalc = {
    currentValue: 0,
    setValue: function (value) {
        this.currentValue = value;
        console.log(this.currentValue);
    },
    core: {
        plus: function (currentValue, newVal) { return currentValue + newVal; },
        minus: function (currentValue, newVal) { return currentValue - newVal; }
    },
    plugins: {},
    press: function (buttonName, newVal) {
        var exec = this.core[buttonName] || this.plugins[buttonName];
        var _a = this.lifecycle, beforeChange = _a.beforeChange, afterChange = _a.afterChange;
        this.setValue(exec(this.currentValue, newVal));
    },
    register: function (plugin) {
        var name = plugin.name, exec = plugin.exec;
        this.plugins[name] = exec;
    },
    lifecycle: {
        beforeChange: [],
        afterChange: []
    }
};
var squaredPlugin = {
    name: 'squared',
    exec: function (currentValue) { return Math.pow(currentValue, 2); }
};
betaCalc.register(squaredPlugin);
betaCalc.setValue(3);
betaCalc.press('plus', 2);
betaCalc.press('squared');
//# sourceMappingURL=index.js.map