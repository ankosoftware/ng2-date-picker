"use strict";
var calendar_mode_enum_1 = require("../common/types/calendar-mode-enum");
var core_1 = require("@angular/core");
var day_calendar_service_1 = require("./day-calendar.service");
var moment = require("moment");
var forms_1 = require("@angular/forms");
var utils_service_1 = require("../common/services/utils/utils.service");
var DayCalendarComponent = (function () {
    function DayCalendarComponent(dayCalendarService, utilsService) {
        this.dayCalendarService = dayCalendarService;
        this.utilsService = utilsService;
        this.onSelect = new core_1.EventEmitter();
        this.onMonthSelect = new core_1.EventEmitter();
        this.onNavHeaderBtnClick = new core_1.EventEmitter();
        this.CalendarMode = calendar_mode_enum_1.ECalendarMode;
        this.isInited = false;
        this.currentCalendarMode = calendar_mode_enum_1.ECalendarMode.Day;
        this._shouldShowCurrent = true;
        this.api = {
            moveCalendarsBy: this.moveCalendarsBy.bind(this),
            toggleCalendar: this.toggleCalendar.bind(this),
            moveCalendarTo: this.moveCalendarTo.bind(this)
        };
    }
    Object.defineProperty(DayCalendarComponent.prototype, "selected", {
        get: function () {
            return this._selected;
        },
        set: function (selected) {
            this._selected = selected;
            this.onChangeCallback(this.processOnChangeCallback(selected));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DayCalendarComponent.prototype, "currentDateView", {
        get: function () {
            return this._currentDateView;
        },
        set: function (current) {
            this._currentDateView = current.clone();
            this.weeks = this.dayCalendarService
                .generateMonthArray(this.componentConfig, this._currentDateView, this.selected);
            this.navLabel = this.dayCalendarService.getHeaderLabel(this.componentConfig, this._currentDateView);
            this.showLeftNav = this.dayCalendarService.shouldShowLeft(this.componentConfig.min, this.currentDateView);
            this.showRightNav = this.dayCalendarService.shouldShowRight(this.componentConfig.max, this.currentDateView);
        },
        enumerable: true,
        configurable: true
    });
    DayCalendarComponent.prototype.ngOnInit = function () {
        this.isInited = true;
        this.init();
        this.initValidators();
    };
    DayCalendarComponent.prototype.init = function () {
        this.componentConfig = this.dayCalendarService.getConfig(this.config);
        this.selected = this.selected || [];
        this.currentDateView = this.displayDate
            ? this.utilsService.convertToMoment(this.displayDate, this.componentConfig.format).clone()
            : this.utilsService
                .getDefaultDisplayDate(this.currentDateView, this.selected, this.componentConfig.allowMultiSelect, this.componentConfig.min);
        this.weekdays = this.dayCalendarService
            .generateWeekdays(this.componentConfig.firstDayOfWeek);
        this.inputValueType = this.utilsService.getInputType(this.inputValue, this.componentConfig.allowMultiSelect);
        this.monthCalendarConfig = this.dayCalendarService.getMonthCalendarConfig(this.componentConfig);
        this._shouldShowCurrent = this.shouldShowCurrent();
    };
    DayCalendarComponent.prototype.ngOnChanges = function (changes) {
        if (this.isInited) {
            var minDate = changes.minDate, maxDate = changes.maxDate, config = changes.config;
            this.handleConfigChange(config);
            this.init();
            if (minDate || maxDate) {
                this.initValidators();
            }
        }
    };
    DayCalendarComponent.prototype.writeValue = function (value) {
        this.inputValue = value;
        if (value) {
            this.selected = this.utilsService
                .convertToMomentArray(value, this.componentConfig.format, this.componentConfig.allowMultiSelect);
            this.inputValueType = this.utilsService
                .getInputType(this.inputValue, this.componentConfig.allowMultiSelect);
        }
        else {
            this.selected = [];
        }
        this.weeks = this.dayCalendarService
            .generateMonthArray(this.componentConfig, this.currentDateView, this.selected);
    };
    DayCalendarComponent.prototype.registerOnChange = function (fn) {
        this.onChangeCallback = fn;
    };
    DayCalendarComponent.prototype.onChangeCallback = function (_) {
    };
    ;
    DayCalendarComponent.prototype.registerOnTouched = function (fn) {
    };
    DayCalendarComponent.prototype.validate = function (formControl) {
        if (this.minDate || this.maxDate) {
            return this.validateFn(formControl.value);
        }
        else {
            return function () { return null; };
        }
    };
    DayCalendarComponent.prototype.processOnChangeCallback = function (value) {
        return this.utilsService.convertFromMomentArray(this.componentConfig.format, value, this.componentConfig.returnedValueType || this.inputValueType);
    };
    DayCalendarComponent.prototype.initValidators = function () {
        this.validateFn = this.utilsService.createValidator({ minDate: this.minDate, maxDate: this.maxDate }, this.componentConfig.format, 'day');
        this.onChangeCallback(this.processOnChangeCallback(this.selected));
    };
    DayCalendarComponent.prototype.dayClicked = function (day) {
        this.selected = this.utilsService
            .updateSelected(this.componentConfig.allowMultiSelect, this.selected, day);
        this.weeks = this.dayCalendarService
            .generateMonthArray(this.componentConfig, this.currentDateView, this.selected);
        this.onSelect.emit(day);
    };
    DayCalendarComponent.prototype.getDayBtnText = function (day) {
        return this.dayCalendarService.getDayBtnText(this.componentConfig, day.date);
    };
    DayCalendarComponent.prototype.getDayBtnCssClass = function (day) {
        var cssClasses = {
            'dp-selected': day.selected,
            'dp-current-month': day.currentMonth,
            'dp-prev-month': day.prevMonth,
            'dp-next-month': day.nextMonth,
            'dp-current-day': day.currentDay
        };
        var customCssClass = this.dayCalendarService.getDayBtnCssClass(this.componentConfig, day.date);
        if (customCssClass) {
            cssClasses[customCssClass] = true;
        }
        return cssClasses;
    };
    DayCalendarComponent.prototype.onLeftNav = function () {
        this.moveCalendarsBy(this.currentDateView, -1, 'month');
    };
    DayCalendarComponent.prototype.onRightNav = function () {
        this.moveCalendarsBy(this.currentDateView, 1, 'month');
    };
    DayCalendarComponent.prototype.getWeekdayName = function (weekday) {
        if (this.componentConfig.weekDayFormatter) {
            return this.componentConfig.weekDayFormatter(weekday.day());
        }
        return weekday.format(this.componentConfig.weekDayFormat);
    };
    DayCalendarComponent.prototype.toggleCalendar = function (mode) {
        if (this.currentCalendarMode !== mode) {
            this.currentCalendarMode = mode;
            this.onNavHeaderBtnClick.emit(mode);
        }
    };
    DayCalendarComponent.prototype.monthSelected = function (month) {
        this.currentDateView = month.date.clone();
        this.currentCalendarMode = calendar_mode_enum_1.ECalendarMode.Day;
        this.onMonthSelect.emit(month);
    };
    DayCalendarComponent.prototype.moveCalendarsBy = function (current, amount, granularity) {
        if (granularity === void 0) { granularity = 'month'; }
        this.currentDateView = current.clone().add(amount, granularity);
    };
    DayCalendarComponent.prototype.moveCalendarTo = function (to) {
        if (to) {
            this.currentDateView = this.utilsService.convertToMoment(to, this.componentConfig.format);
        }
    };
    DayCalendarComponent.prototype.shouldShowCurrent = function () {
        return this.utilsService.shouldShowCurrent(this.componentConfig.showGoToCurrent, 'day', this.componentConfig.min, this.componentConfig.max);
    };
    DayCalendarComponent.prototype.goToCurrent = function () {
        this.currentDateView = moment();
    };
    DayCalendarComponent.prototype.handleConfigChange = function (config) {
        if (config) {
            var prevConf = this.dayCalendarService.getConfig(config.previousValue);
            var currentConf = this.dayCalendarService.getConfig(config.currentValue);
            if (this.utilsService.shouldResetCurrentView(prevConf, currentConf)) {
                this._currentDateView = null;
            }
        }
    };
    return DayCalendarComponent;
}());
DayCalendarComponent.decorators = [
    { type: core_1.Component, args: [{
                selector: 'dp-day-calendar',
                template: '<div class="dp-day-calendar-container" *ngIf="currentCalendarMode ===  CalendarMode.Day">   <dp-calendar-nav       [label]="navLabel"       [showLeftNav]="showLeftNav"       [showRightNav]="showRightNav"       [isLabelClickable]="componentConfig.enableMonthSelector"       [showGoToCurrent]="_shouldShowCurrent"       [theme]="theme"       (onLeftNav)="onLeftNav()"       (onRightNav)="onRightNav()"       (onLabelClick)="toggleCalendar(CalendarMode.Month)"       (goToCurrent)="goToCurrent()">   </dp-calendar-nav>    <div class="dp-calendar-wrapper"        [ngClass]="{\'dp-hide-near-month\': !componentConfig.showNearMonthDays}">     <div class="dp-weekdays">       <span class="dp-calendar-weekday"             *ngFor="let weekday of weekdays"             [innerText]="getWeekdayName(weekday)">       </span>     </div>     <div class="dp-calendar-week" *ngFor="let week of weeks">       <span class="dp-week-number"             *ngIf="componentConfig.showWeekNumbers"             [innerText]="week[0].date.isoWeek()">       </span>       <button type="button"               class="dp-calendar-day"               *ngFor="let day of week"               (click)="dayClicked(day)"               [disabled]="day.disabled"               [ngClass]="getDayBtnCssClass(day)"               [innerText]="getDayBtnText(day)">       </button>     </div>   </div> </div>  <dp-month-calendar     *ngIf="currentCalendarMode ===  CalendarMode.Month"     [config]="monthCalendarConfig"     [displayDate]="_currentDateView"     [theme]="theme"     (onSelect)="monthSelected($event)"     (onNavHeaderBtnClick)="toggleCalendar(CalendarMode.Day)"> </dp-month-calendar> ',
                styles: ['dp-day-calendar {  display: inline-block;}dp-day-calendar .dp-day-calendar-container {  background: #FFFFFF;}dp-day-calendar .dp-calendar-wrapper {  box-sizing: border-box;  border: 1px solid #000000;}dp-day-calendar .dp-calendar-wrapper .dp-calendar-weekday:first-child {  border-left: none;}dp-day-calendar .dp-weekdays {  font-size: 15px;  margin-bottom: 5px;}dp-day-calendar .dp-calendar-weekday {  box-sizing: border-box;  display: inline-block;  width: 30px;  text-align: center;  border-left: 1px solid #000000;  border-bottom: 1px solid #000000;}dp-day-calendar .dp-calendar-day {  box-sizing: border-box;  width: 30px;  height: 30px;  cursor: pointer;}dp-day-calendar .dp-selected {  background: #106CC8;  color: #FFFFFF;}dp-day-calendar .dp-prev-month,dp-day-calendar .dp-next-month {  opacity: 0.5;}dp-day-calendar .dp-hide-near-month .dp-prev-month,dp-day-calendar .dp-hide-near-month .dp-next-month {  visibility: hidden;}dp-day-calendar .dp-week-number {  position: absolute;  font-size: 9px;}dp-day-calendar.dp-material .dp-calendar-weekday {  height: 25px;  width: 30px;  line-height: 25px;  color: #7a7a7a;  border: none;}dp-day-calendar.dp-material .dp-calendar-wrapper {  border: 1px solid #E0E0E0;}dp-day-calendar.dp-material .dp-calendar-month,dp-day-calendar.dp-material .dp-calendar-day {  box-sizing: border-box;  background: #FFFFFF;  border-radius: 50%;  border: none;  outline: none;}dp-day-calendar.dp-material .dp-calendar-month:hover,dp-day-calendar.dp-material .dp-calendar-day:hover {  background: #E0E0E0;}dp-day-calendar.dp-material .dp-selected {  background: #106CC8;  color: #FFFFFF;}dp-day-calendar.dp-material .dp-selected:hover {  background: #106CC8;}dp-day-calendar.dp-material .dp-current-day {  border: 1px solid #106CC8;}'],
                encapsulation: core_1.ViewEncapsulation.None,
                providers: [
                    day_calendar_service_1.DayCalendarService,
                    {
                        provide: forms_1.NG_VALUE_ACCESSOR,
                        useExisting: core_1.forwardRef(function () { return DayCalendarComponent; }),
                        multi: true
                    },
                    {
                        provide: forms_1.NG_VALIDATORS,
                        useExisting: core_1.forwardRef(function () { return DayCalendarComponent; }),
                        multi: true
                    }
                ]
            },] },
];
/** @nocollapse */
DayCalendarComponent.ctorParameters = function () { return [
    { type: day_calendar_service_1.DayCalendarService, },
    { type: utils_service_1.UtilsService, },
]; };
DayCalendarComponent.propDecorators = {
    'config': [{ type: core_1.Input },],
    'displayDate': [{ type: core_1.Input },],
    'minDate': [{ type: core_1.Input },],
    'maxDate': [{ type: core_1.Input },],
    'theme': [{ type: core_1.HostBinding, args: ['class',] }, { type: core_1.Input },],
    'onSelect': [{ type: core_1.Output },],
    'onMonthSelect': [{ type: core_1.Output },],
    'onNavHeaderBtnClick': [{ type: core_1.Output },],
};
exports.DayCalendarComponent = DayCalendarComponent;
//# sourceMappingURL=day-calendar.component.js.map