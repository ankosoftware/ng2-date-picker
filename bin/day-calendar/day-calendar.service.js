"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var core_1 = require("@angular/core");
var moment = require("moment");
var utils_service_1 = require("../common/services/utils/utils.service");
var DayCalendarService = (function () {
    function DayCalendarService(utilsService) {
        this.utilsService = utilsService;
        this.DAYS = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
        this.DEFAULT_CONFIG = {
            showNearMonthDays: true,
            showWeekNumbers: false,
            firstDayOfWeek: 'su',
            weekDayFormat: 'ddd',
            format: 'DD-MM-YYYY',
            allowMultiSelect: false,
            monthFormat: 'MMM, YYYY',
            enableMonthSelector: true,
            locale: moment.locale(),
            dayBtnFormat: 'DD'
        };
    }
    DayCalendarService.prototype.removeNearMonthWeeks = function (currentMonth, monthArray) {
        if (monthArray[monthArray.length - 1].find(function (day) { return day.date.isSame(currentMonth, 'month'); })) {
            return monthArray;
        }
        else {
            return monthArray.slice(0, -1);
        }
    };
    DayCalendarService.prototype.getConfig = function (config) {
        var _config = __assign({}, this.DEFAULT_CONFIG, this.utilsService.clearUndefined(config));
        this.utilsService.convertPropsToMoment(_config, _config.format, ['min', 'max']);
        moment.locale(_config.locale);
        return _config;
    };
    DayCalendarService.prototype.generateDaysMap = function (firstDayOfWeek) {
        var firstDayIndex = this.DAYS.indexOf(firstDayOfWeek);
        var daysArr = this.DAYS.slice(firstDayIndex, 7).concat(this.DAYS.slice(0, firstDayIndex));
        return daysArr.reduce(function (map, day, index) {
            map[day] = index;
            return map;
        }, {});
    };
    DayCalendarService.prototype.generateMonthArray = function (config, month, selected) {
        var _this = this;
        var monthArray = [];
        var firstDayOfWeekIndex = this.DAYS.indexOf(config.firstDayOfWeek);
        var firstDayOfBoard = month.clone().startOf('month');
        while (firstDayOfBoard.day() !== firstDayOfWeekIndex) {
            firstDayOfBoard.subtract(1, 'day');
        }
        var current = firstDayOfBoard.clone();
        var prevMonth = month.clone().subtract(1, 'month');
        var nextMonth = month.clone().add(1, 'month');
        var today = moment();
        var daysOfCalendar = this.utilsService.createArray(42)
            .reduce(function (array) {
            array.push({
                date: current.clone(),
                selected: !!selected.find(function (selectedDay) { return current.isSame(selectedDay, 'day'); }),
                currentMonth: current.isSame(month, 'month'),
                prevMonth: current.isSame(prevMonth, 'month'),
                nextMonth: current.isSame(nextMonth, 'month'),
                currentDay: current.isSame(today, 'day'),
                disabled: _this.isDateDisabled(current, config)
            });
            current.add(1, 'day');
            if (current.format('HH') !== '00') {
                current.startOf('day').add(1, 'day');
            }
            return array;
        }, []);
        daysOfCalendar.forEach(function (day, index) {
            var weekIndex = Math.floor(index / 7);
            if (!monthArray[weekIndex]) {
                monthArray.push([]);
            }
            monthArray[weekIndex].push(day);
        });
        if (!config.showNearMonthDays) {
            monthArray = this.removeNearMonthWeeks(month, monthArray);
        }
        return monthArray;
    };
    DayCalendarService.prototype.generateWeekdays = function (firstDayOfWeek) {
        var weekdayNames = {
            su: moment().day(0),
            mo: moment().day(1),
            tu: moment().day(2),
            we: moment().day(3),
            th: moment().day(4),
            fr: moment().day(5),
            sa: moment().day(6)
        };
        var weekdays = [];
        var daysMap = this.generateDaysMap(firstDayOfWeek);
        for (var dayKey in daysMap) {
            if (daysMap.hasOwnProperty(dayKey)) {
                weekdays[daysMap[dayKey]] = weekdayNames[dayKey];
            }
        }
        return weekdays;
    };
    DayCalendarService.prototype.isDateDisabled = function (date, config) {
        if (config.isDayDisabledCallback) {
            return config.isDayDisabledCallback(date);
        }
        if (config.min && date.isBefore(config.min, 'day')) {
            return true;
        }
        return !!(config.max && date.isAfter(config.max, 'day'));
    };
    // todo:: add unit tests
    DayCalendarService.prototype.getHeaderLabel = function (config, month) {
        if (config.monthFormatter) {
            return config.monthFormatter(month);
        }
        return month.format(config.monthFormat);
    };
    // todo:: add unit tests
    DayCalendarService.prototype.shouldShowLeft = function (min, currentMonthView) {
        return min ? min.isBefore(currentMonthView, 'month') : true;
    };
    // todo:: add unit tests
    DayCalendarService.prototype.shouldShowRight = function (max, currentMonthView) {
        return max ? max.isAfter(currentMonthView, 'month') : true;
    };
    DayCalendarService.prototype.generateDaysIndexMap = function (firstDayOfWeek) {
        var firstDayIndex = this.DAYS.indexOf(firstDayOfWeek);
        var daysArr = this.DAYS.slice(firstDayIndex, 7).concat(this.DAYS.slice(0, firstDayIndex));
        return daysArr.reduce(function (map, day, index) {
            map[index] = day;
            return map;
        }, {});
    };
    DayCalendarService.prototype.getMonthCalendarConfig = function (componentConfig) {
        return this.utilsService.clearUndefined({
            min: componentConfig.min,
            max: componentConfig.max,
            format: componentConfig.format,
            isNavHeaderBtnClickable: true,
            allowMultiSelect: false,
            yearFormat: componentConfig.yearFormat,
            yearFormatter: componentConfig.yearFormatter,
            monthBtnFormat: componentConfig.monthBtnFormat,
            monthBtnFormatter: componentConfig.monthBtnFormatter,
            monthBtnCssClassCallback: componentConfig.monthBtnCssClassCallback,
            multipleYearsNavigateBy: componentConfig.multipleYearsNavigateBy,
            showMultipleYearsNavigation: componentConfig.showMultipleYearsNavigation,
            showGoToCurrent: componentConfig.showGoToCurrent
        });
    };
    DayCalendarService.prototype.getDayBtnText = function (config, day) {
        if (config.dayBtnFormatter) {
            return config.dayBtnFormatter(day);
        }
        return day.format(config.dayBtnFormat);
    };
    DayCalendarService.prototype.getDayBtnCssClass = function (config, day) {
        if (config.dayBtnCssClassCallback) {
            return config.dayBtnCssClassCallback(day);
        }
        return '';
    };
    return DayCalendarService;
}());
DayCalendarService.decorators = [
    { type: core_1.Injectable },
];
/** @nocollapse */
DayCalendarService.ctorParameters = function () { return [
    { type: utils_service_1.UtilsService, },
]; };
exports.DayCalendarService = DayCalendarService;
//# sourceMappingURL=day-calendar.service.js.map