"use strict";
var calendar_value_enum_1 = require("../../types/calendar-value-enum");
var core_1 = require("@angular/core");
var moment = require("moment");
var UtilsService = (function () {
    function UtilsService() {
    }
    UtilsService.debounce = function (func, wait) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            timeout = clearTimeout(timeout);
            setTimeout(function () {
                func.apply(context, args);
            }, wait);
        };
    };
    ;
    UtilsService.prototype.createArray = function (size) {
        return new Array(size).fill(1);
    };
    UtilsService.prototype.convertToMoment = function (date, format) {
        if (!date) {
            return null;
        }
        else if (typeof date === 'string') {
            return moment(date, format);
        }
        else {
            return date.clone();
        }
    };
    UtilsService.prototype.isDateValid = function (date, format) {
        if (date === '') {
            return true;
        }
        return moment(date, format, true).isValid();
    };
    // todo:: add unit test
    UtilsService.prototype.getDefaultDisplayDate = function (current, selected, allowMultiSelect, minDate) {
        if (current) {
            return current.clone();
        }
        else if (minDate && minDate.isAfter(moment())) {
            return minDate.clone();
        }
        else if (allowMultiSelect) {
            if (selected && selected[selected.length]) {
                return selected[selected.length].clone();
            }
        }
        else if (selected && selected[0]) {
            return selected[0].clone();
        }
        return moment();
    };
    // todo:: add unit test
    UtilsService.prototype.getInputType = function (value, allowMultiSelect) {
        if (Array.isArray(value)) {
            if (!value.length) {
                return calendar_value_enum_1.ECalendarValue.MomentArr;
            }
            else if (typeof value[0] === 'string') {
                return calendar_value_enum_1.ECalendarValue.StringArr;
            }
            else if (moment.isMoment(value[0])) {
                return calendar_value_enum_1.ECalendarValue.MomentArr;
            }
        }
        else {
            if (typeof value === 'string') {
                return calendar_value_enum_1.ECalendarValue.String;
            }
            else if (moment.isMoment(value)) {
                return calendar_value_enum_1.ECalendarValue.Moment;
            }
        }
        return allowMultiSelect ? calendar_value_enum_1.ECalendarValue.MomentArr : calendar_value_enum_1.ECalendarValue.Moment;
    };
    // todo:: add unit test
    UtilsService.prototype.convertToMomentArray = function (value, format, allowMultiSelect) {
        switch (this.getInputType(value, allowMultiSelect)) {
            case (calendar_value_enum_1.ECalendarValue.String):
                return value ? [moment(value, format, true)] : [];
            case (calendar_value_enum_1.ECalendarValue.StringArr):
                return value.map(function (v) { return v ? moment(v, format, true) : null; }).filter(Boolean);
            case (calendar_value_enum_1.ECalendarValue.Moment):
                return value ? [value.clone()] : [];
            case (calendar_value_enum_1.ECalendarValue.MomentArr):
                return (value || []).map(function (v) { return v.clone(); });
            default:
                return [];
        }
    };
    // todo:: add unit test
    UtilsService.prototype.convertFromMomentArray = function (format, value, convertTo) {
        switch (convertTo) {
            case (calendar_value_enum_1.ECalendarValue.String):
                return value[0] && value[0].format(format);
            case (calendar_value_enum_1.ECalendarValue.StringArr):
                return value.filter(Boolean).map(function (v) { return v.format(format); });
            case (calendar_value_enum_1.ECalendarValue.Moment):
                return value[0] ? value[0].clone() : value[0];
            case (calendar_value_enum_1.ECalendarValue.MomentArr):
                return value ? value.map(function (v) { return v.clone(); }) : value;
            default:
                return value;
        }
    };
    // todo:: add unit test
    UtilsService.prototype.clearUndefined = function (obj) {
        if (!obj) {
            return obj;
        }
        Object.keys(obj).forEach(function (key) { return (obj[key] === undefined) && delete obj[key]; });
        return obj;
    };
    UtilsService.prototype.updateSelected = function (isMultiple, currentlySelected, date, granularity) {
        if (granularity === void 0) { granularity = 'day'; }
        var isSelected = !date.selected;
        if (isMultiple) {
            return isSelected
                ? currentlySelected.concat([date.date])
                : currentlySelected.filter(function (d) { return !d.isSame(date.date, granularity); });
        }
        else {
            return isSelected ? [date.date] : [];
        }
    };
    UtilsService.prototype.closestParent = function (element, selector) {
        if (!element) {
            return undefined;
        }
        var match = element.querySelector(selector);
        return match || this.closestParent(element.parentElement, selector);
    };
    UtilsService.prototype.onlyTime = function (m) {
        return m && moment.isMoment(m) && moment(m.format('HH:mm:ss'), 'HH:mm:ss');
    };
    UtilsService.prototype.granularityFromType = function (calendarType) {
        switch (calendarType) {
            case 'time':
                return 'second';
            case 'daytime':
                return 'second';
            default:
                return calendarType;
        }
    };
    UtilsService.prototype.createValidator = function (_a, format, calendarType) {
        var _this = this;
        var minDate = _a.minDate, maxDate = _a.maxDate, minTime = _a.minTime, maxTime = _a.maxTime;
        var isValid;
        var value;
        var validators = [];
        var granularity = this.granularityFromType(calendarType);
        if (minDate) {
            var md_1 = this.convertToMoment(minDate, format);
            validators.push({
                key: 'minDate',
                isValid: function () {
                    var _isValid = value.every(function (val) { return val.isSameOrAfter(md_1, granularity); });
                    isValid = isValid ? _isValid : false;
                    return _isValid;
                }
            });
        }
        if (maxDate) {
            var md_2 = this.convertToMoment(maxDate, format);
            validators.push({
                key: 'maxDate',
                isValid: function () {
                    var _isValid = value.every(function (val) { return val.isSameOrBefore(md_2, granularity); });
                    isValid = isValid ? _isValid : false;
                    return _isValid;
                }
            });
        }
        if (minTime) {
            var md_3 = this.onlyTime(this.convertToMoment(minTime, format));
            validators.push({
                key: 'minTime',
                isValid: function () {
                    var _isValid = value.every(function (val) { return _this.onlyTime(val).isSameOrAfter(md_3); });
                    isValid = isValid ? _isValid : false;
                    return _isValid;
                }
            });
        }
        if (maxTime) {
            var md_4 = this.onlyTime(this.convertToMoment(maxTime, format));
            validators.push({
                key: 'maxTime',
                isValid: function () {
                    var _isValid = value.every(function (val) { return _this.onlyTime(val).isSameOrBefore(md_4); });
                    isValid = isValid ? _isValid : false;
                    return _isValid;
                }
            });
        }
        return function (inputVal) {
            isValid = true;
            value = _this.convertToMomentArray(inputVal, format, true).filter(Boolean);
            if (!value.every(function (val) { return val.isValid(); })) {
                return {
                    format: {
                        given: inputVal
                    }
                };
            }
            var errors = validators.reduce(function (map, err) {
                if (!err.isValid()) {
                    map[err.key] = {
                        given: value
                    };
                }
                return map;
            }, {});
            return !isValid ? errors : null;
        };
    };
    UtilsService.prototype.datesStringToStringArray = function (value) {
        return (value || '').split(',').map(function (m) { return m.trim(); });
    };
    UtilsService.prototype.getValidMomentArray = function (value, format) {
        var _this = this;
        return this.datesStringToStringArray(value)
            .filter(function (d) { return _this.isDateValid(d, format); })
            .map(function (d) { return moment(d, format); });
    };
    UtilsService.prototype.shouldShowCurrent = function (showGoToCurrent, mode, min, max) {
        return showGoToCurrent &&
            mode !== 'time' &&
            this.isDateInRange(moment(), min, max);
    };
    UtilsService.prototype.isDateInRange = function (date, from, to) {
        return date.isBetween(from, to, 'day', '[]');
    };
    UtilsService.prototype.convertPropsToMoment = function (obj, format, props) {
        var _this = this;
        props.forEach(function (prop) {
            if (obj.hasOwnProperty(prop)) {
                obj[prop] = _this.convertToMoment(obj[prop], format);
            }
        });
    };
    UtilsService.prototype.shouldResetCurrentView = function (prevConf, currentConf) {
        if (prevConf && currentConf) {
            if (!prevConf.min && currentConf.min) {
                return true;
            }
            else if (prevConf.min && currentConf.min && !prevConf.min.isSame(currentConf.min, 'd')) {
                return true;
            }
            else if (!prevConf.max && currentConf.max) {
                return true;
            }
            else if (prevConf.max && currentConf.max && !prevConf.max.isSame(currentConf.max, 'd')) {
                return true;
            }
            return false;
        }
        return false;
    };
    return UtilsService;
}());
UtilsService.decorators = [
    { type: core_1.Injectable },
];
/** @nocollapse */
UtilsService.ctorParameters = function () { return []; };
exports.UtilsService = UtilsService;
//# sourceMappingURL=utils.service.js.map