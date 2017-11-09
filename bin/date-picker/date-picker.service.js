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
var time_select_service_1 = require("../time-select/time-select.service");
var day_time_calendar_service_1 = require("../day-time-calendar/day-time-calendar.service");
var DatePickerService = (function () {
    function DatePickerService(utilsService, timeSelectService, daytimeCalendarService) {
        this.utilsService = utilsService;
        this.timeSelectService = timeSelectService;
        this.daytimeCalendarService = daytimeCalendarService;
        this.onPickerClosed = new core_1.EventEmitter();
        this.defaultConfig = {
            closeOnSelect: true,
            closeOnSelectDelay: 100,
            format: 'DD-MM-YYYY',
            openOnFocus: true,
            openOnClick: true,
            onOpenDelay: 0,
            disableKeypress: false,
            showNearMonthDays: true,
            showWeekNumbers: false,
            enableMonthSelector: true,
            showGoToCurrent: true,
            locale: moment.locale()
        };
    }
    // todo:: add unit tests
    DatePickerService.prototype.getConfig = function (config, mode) {
        if (mode === void 0) { mode = 'daytime'; }
        var _config = __assign({}, this.defaultConfig, { format: this.getDefaultFormatByMode(mode) }, this.utilsService.clearUndefined(config));
        this.utilsService.convertPropsToMoment(_config, _config.format, ['min', 'max']);
        if (config && config.allowMultiSelect && config.closeOnSelect === undefined) {
            _config.closeOnSelect = false;
        }
        moment.locale(_config.locale);
        return _config;
    };
    DatePickerService.prototype.getDayConfigService = function (pickerConfig) {
        return {
            min: pickerConfig.min,
            max: pickerConfig.max,
            isDayDisabledCallback: pickerConfig.isDayDisabledCallback,
            weekDayFormat: pickerConfig.weekDayFormat,
            showNearMonthDays: pickerConfig.showNearMonthDays,
            showWeekNumbers: pickerConfig.showWeekNumbers,
            firstDayOfWeek: pickerConfig.firstDayOfWeek,
            format: pickerConfig.format,
            allowMultiSelect: pickerConfig.allowMultiSelect,
            monthFormat: pickerConfig.monthFormat,
            monthFormatter: pickerConfig.monthFormatter,
            enableMonthSelector: pickerConfig.enableMonthSelector,
            yearFormat: pickerConfig.yearFormat,
            yearFormatter: pickerConfig.yearFormatter,
            dayBtnFormat: pickerConfig.dayBtnFormat,
            dayBtnFormatter: pickerConfig.dayBtnFormatter,
            dayBtnCssClassCallback: pickerConfig.dayBtnCssClassCallback,
            monthBtnFormat: pickerConfig.monthBtnFormat,
            monthBtnFormatter: pickerConfig.monthBtnFormatter,
            monthBtnCssClassCallback: pickerConfig.monthBtnCssClassCallback,
            multipleYearsNavigateBy: pickerConfig.multipleYearsNavigateBy,
            showMultipleYearsNavigation: pickerConfig.showMultipleYearsNavigation,
            locale: pickerConfig.locale,
            returnedValueType: pickerConfig.returnedValueType,
            showGoToCurrent: pickerConfig.showGoToCurrent
        };
    };
    DatePickerService.prototype.getDayTimeConfigService = function (pickerConfig) {
        return this.daytimeCalendarService.getConfig(pickerConfig);
    };
    DatePickerService.prototype.getTimeConfigService = function (pickerConfig) {
        return this.timeSelectService.getConfig(pickerConfig);
    };
    DatePickerService.prototype.pickerClosed = function () {
        this.onPickerClosed.emit();
    };
    // todo:: add unit tests
    DatePickerService.prototype.isValidInputDateValue = function (value, config) {
        var _this = this;
        value = value ? value : '';
        var datesStrArr = this.utilsService.datesStringToStringArray(value);
        return datesStrArr.every(function (date) { return _this.utilsService.isDateValid(date, config.format); });
    };
    // todo:: add unit tests
    DatePickerService.prototype.convertInputValueToMomentArray = function (value, config) {
        value = value ? value : '';
        var datesStrArr = this.utilsService.datesStringToStringArray(value);
        return this.utilsService.convertToMomentArray(datesStrArr, config.format, config.allowMultiSelect);
    };
    DatePickerService.prototype.getDefaultFormatByMode = function (mode) {
        switch (mode) {
            case 'day':
                return 'DD-MM-YYYY';
            case 'daytime':
                return 'DD-MM-YYYY HH:mm:ss';
            case 'time':
                return 'HH:mm:ss';
            case 'month':
                return 'MMM, YYYY';
        }
    };
    return DatePickerService;
}());
DatePickerService.decorators = [
    { type: core_1.Injectable },
];
/** @nocollapse */
DatePickerService.ctorParameters = function () { return [
    { type: utils_service_1.UtilsService, },
    { type: time_select_service_1.TimeSelectService, },
    { type: day_time_calendar_service_1.DayTimeCalendarService, },
]; };
exports.DatePickerService = DatePickerService;
//# sourceMappingURL=date-picker.service.js.map