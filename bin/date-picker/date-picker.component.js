"use strict";
var dom_appender_service_1 = require("../common/services/dom-appender/dom-appender.service");
var utils_service_1 = require("../common/services/utils/utils.service");
var calendar_mode_enum_1 = require("../common/types/calendar-mode-enum");
var calendar_value_enum_1 = require("../common/types/calendar-value-enum");
var day_calendar_service_1 = require("../day-calendar/day-calendar.service");
var day_time_calendar_service_1 = require("../day-time-calendar/day-time-calendar.service");
var time_select_service_1 = require("../time-select/time-select.service");
var date_picker_service_1 = require("./date-picker.service");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var moment = require("moment");
var DatePickerComponent = (function () {
    function DatePickerComponent(dayPickerService, domHelper, elemRef, renderer, utilsService) {
        this.dayPickerService = dayPickerService;
        this.domHelper = domHelper;
        this.elemRef = elemRef;
        this.renderer = renderer;
        this.utilsService = utilsService;
        this.isInitialized = false;
        this.mode = 'day';
        this.placeholder = '';
        this.disabled = false;
        this.open = new core_1.EventEmitter();
        this.close = new core_1.EventEmitter();
        this.onChange = new core_1.EventEmitter();
        this._areCalendarsShown = false;
        this.hideStateHelper = false;
        this._selected = [];
        this.isFocusedTrigger = false;
        this.handleInnerElementClickUnlisteners = [];
        this.globalListnersUnlisteners = [];
        this.api = {
            open: this.showCalendars.bind(this),
            close: this.hideCalendar.bind(this)
        };
    }
    Object.defineProperty(DatePickerComponent.prototype, "selected", {
        get: function () {
            return this._selected;
        },
        set: function (selected) {
            this._selected = selected;
            this.inputElementValue = this.utilsService
                .convertFromMomentArray(this.componentConfig.format, selected, calendar_value_enum_1.ECalendarValue.StringArr)
                .join(', ');
            var val = this.processOnChangeCallback(selected);
            this.onChangeCallback(val);
            this.onChange.emit(val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DatePickerComponent.prototype, "areCalendarsShown", {
        get: function () {
            return this._areCalendarsShown;
        },
        set: function (value) {
            if (value) {
                this.startGlobalListeners();
                this.domHelper.appendElementToPosition({
                    container: this.appendToElement,
                    element: this.calendarWrapper,
                    anchor: this.inputElementContainer,
                    dimElem: this.popupElem,
                    drops: this.componentConfig.drops,
                    opens: this.componentConfig.opens
                });
            }
            else {
                this.stopGlobalListeners();
                this.dayPickerService.pickerClosed();
            }
            this._areCalendarsShown = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DatePickerComponent.prototype, "openOnFocus", {
        get: function () {
            return this.componentConfig.openOnFocus;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DatePickerComponent.prototype, "openOnClick", {
        get: function () {
            return this.componentConfig.openOnClick;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DatePickerComponent.prototype, "currentDateView", {
        get: function () {
            return this._currentDateView;
        },
        set: function (date) {
            this._currentDateView = date;
            if (this.dayCalendarRef) {
                this.dayCalendarRef.moveCalendarTo(date);
            }
            if (this.monthCalendarRef) {
                this.monthCalendarRef.moveCalendarTo(date);
            }
            if (this.dayTimeCalendarRef) {
                this.dayTimeCalendarRef.moveCalendarTo(date);
            }
        },
        enumerable: true,
        configurable: true
    });
    DatePickerComponent.prototype.onClick = function () {
        if (!this.openOnClick) {
            return;
        }
        if (!this.isFocusedTrigger && !this.disabled) {
            this.hideStateHelper = true;
            if (!this.areCalendarsShown) {
                this.showCalendars();
            }
        }
    };
    DatePickerComponent.prototype.onBodyClick = function () {
        if (!this.hideStateHelper && this.areCalendarsShown) {
            this.hideCalendar();
        }
        this.hideStateHelper = false;
    };
    DatePickerComponent.prototype.onScroll = function () {
        if (this.areCalendarsShown) {
            this.domHelper.setElementPosition({
                container: this.appendToElement,
                element: this.calendarWrapper,
                anchor: this.inputElementContainer,
                dimElem: this.popupElem,
                drops: this.componentConfig.drops,
                opens: this.componentConfig.opens
            });
        }
    };
    DatePickerComponent.prototype.writeValue = function (value) {
        this.inputValue = value;
        if (value || value === '') {
            this.selected = this.utilsService
                .convertToMomentArray(value, this.componentConfig.format, this.componentConfig.allowMultiSelect);
            this.init();
        }
        else {
            this.selected = [];
        }
    };
    DatePickerComponent.prototype.registerOnChange = function (fn) {
        this.onChangeCallback = fn;
    };
    DatePickerComponent.prototype.onChangeCallback = function (_) {
    };
    ;
    DatePickerComponent.prototype.registerOnTouched = function (fn) {
    };
    DatePickerComponent.prototype.validate = function (formControl) {
        return this.validateFn(formControl.value);
    };
    DatePickerComponent.prototype.processOnChangeCallback = function (selected) {
        if (typeof selected === 'string') {
            return selected;
        }
        else {
            return this.utilsService.convertFromMomentArray(this.componentConfig.format, selected, this.componentConfig.returnedValueType || this.inputValueType);
        }
    };
    DatePickerComponent.prototype.initValidators = function () {
        this.validateFn = this.utilsService.createValidator({
            minDate: this.minDate,
            maxDate: this.maxDate,
            minTime: this.minTime,
            maxTime: this.maxTime
        }, this.componentConfig.format, this.mode);
        this.onChangeCallback(this.processOnChangeCallback(this.selected));
    };
    DatePickerComponent.prototype.ngOnInit = function () {
        this.isInitialized = true;
        this.init();
        this.initValidators();
    };
    DatePickerComponent.prototype.ngOnChanges = function (changes) {
        if (this.isInitialized) {
            var minDate = changes.minDate, maxDate = changes.maxDate, minTime = changes.minTime, maxTime = changes.maxTime;
            this.init();
            if (minDate || maxDate || minTime || maxTime) {
                this.initValidators();
            }
        }
    };
    DatePickerComponent.prototype.ngAfterViewInit = function () {
        this.setElementPositionInDom();
    };
    DatePickerComponent.prototype.setDisabledState = function (isDisabled) {
        this.disabled = isDisabled;
    };
    DatePickerComponent.prototype.setElementPositionInDom = function () {
        this.calendarWrapper = this.calendarContainer.nativeElement;
        this.setInputElementContainer();
        this.popupElem = this.elemRef.nativeElement.querySelector('.dp-popup');
        this.handleInnerElementClick(this.popupElem);
        var appendTo = this.componentConfig.appendTo;
        if (appendTo) {
            if (typeof appendTo === 'string') {
                this.appendToElement = document.querySelector(appendTo);
            }
            else {
                this.appendToElement = appendTo;
            }
        }
        else {
            this.appendToElement = this.elemRef.nativeElement;
        }
        this.appendToElement.appendChild(this.calendarWrapper);
    };
    DatePickerComponent.prototype.setInputElementContainer = function () {
        this.inputElementContainer = this.componentConfig.inputElementContainer
            || this.elemRef.nativeElement.querySelector('.dp-input-container')
            || document.body;
    };
    DatePickerComponent.prototype.handleInnerElementClick = function (element) {
        var _this = this;
        this.handleInnerElementClickUnlisteners.push(this.renderer.listen(element, 'click', function () {
            _this.hideStateHelper = true;
        }));
    };
    DatePickerComponent.prototype.init = function () {
        this.componentConfig = this.dayPickerService.getConfig(this.config, this.mode);
        this.currentDateView = this.displayDate
            ? this.utilsService.convertToMoment(this.displayDate, this.componentConfig.format).clone()
            : this.utilsService
                .getDefaultDisplayDate(this.currentDateView, this.selected, this.componentConfig.allowMultiSelect, this.componentConfig.min);
        this.inputValueType = this.utilsService.getInputType(this.inputValue, this.componentConfig.allowMultiSelect);
        this.dayCalendarConfig = this.dayPickerService.getDayConfigService(this.componentConfig);
        this.dayTimeCalendarConfig = this.dayPickerService.getDayTimeConfigService(this.componentConfig);
        this.timeSelectConfig = this.dayPickerService.getTimeConfigService(this.componentConfig);
    };
    DatePickerComponent.prototype.inputFocused = function () {
        var _this = this;
        if (!this.openOnFocus) {
            return;
        }
        this.isFocusedTrigger = true;
        setTimeout(function () {
            _this.hideStateHelper = false;
            if (!_this.areCalendarsShown) {
                _this.showCalendars();
            }
            _this.isFocusedTrigger = false;
        }, this.componentConfig.onOpenDelay);
    };
    DatePickerComponent.prototype.showCalendars = function () {
        this.hideStateHelper = true;
        this.areCalendarsShown = true;
        if (this.timeSelectRef) {
            this.timeSelectRef.api.triggerChange();
        }
        this.open.emit();
    };
    DatePickerComponent.prototype.hideCalendar = function () {
        this.areCalendarsShown = false;
        if (this.dayCalendarRef) {
            this.dayCalendarRef.api.toggleCalendar(calendar_mode_enum_1.ECalendarMode.Day);
        }
        this.close.emit();
    };
    DatePickerComponent.prototype.onViewDateChange = function (value) {
        if (this.dayPickerService.isValidInputDateValue(value, this.componentConfig)) {
            this.selected = this.dayPickerService.convertInputValueToMomentArray(value, this.componentConfig);
            this.currentDateView = this.selected.length
                ? this.utilsService.getDefaultDisplayDate(null, this.selected, this.componentConfig.allowMultiSelect, this.componentConfig.min)
                : this.currentDateView;
        }
        else {
            this._selected = this.utilsService
                .getValidMomentArray(value, this.componentConfig.format);
            this.onChangeCallback(this.processOnChangeCallback(value));
        }
    };
    DatePickerComponent.prototype.shouldShowGoToCurrent = function () {
        return this.componentConfig.showGoToCurrent &&
            this.utilsService.isDateInRange(moment(), this.componentConfig.min, this.componentConfig.max) &&
            this.mode !== 'time';
    };
    DatePickerComponent.prototype.dateSelected = function (date, granularity, ignoreClose) {
        this.selected = this.utilsService
            .updateSelected(this.componentConfig.allowMultiSelect, this.selected, date, granularity);
        if (!ignoreClose) {
            this.onDateClick();
        }
    };
    DatePickerComponent.prototype.onDateClick = function () {
        if (this.componentConfig.closeOnSelect) {
            setTimeout(this.hideCalendar.bind(this), this.componentConfig.closeOnSelectDelay);
        }
    };
    DatePickerComponent.prototype.onKeyPress = function (event) {
        switch (event.keyCode) {
            case (9):
            case (27):
                this.hideCalendar();
                break;
        }
    };
    DatePickerComponent.prototype.startGlobalListeners = function () {
        var _this = this;
        this.globalListnersUnlisteners.push(this.renderer.listen(document, 'keydown', function (e) {
            _this.onKeyPress(e);
        }));
    };
    DatePickerComponent.prototype.stopGlobalListeners = function () {
        this.globalListnersUnlisteners.forEach(function (ul) { return ul(); });
        this.globalListnersUnlisteners = [];
    };
    DatePickerComponent.prototype.ngOnDestroy = function () {
        this.handleInnerElementClickUnlisteners.forEach(function (ul) { return ul(); });
        if (this.appendToElement) {
            this.appendToElement.removeChild(this.calendarWrapper);
        }
    };
    return DatePickerComponent;
}());
DatePickerComponent.decorators = [
    { type: core_1.Component, args: [{
                selector: 'dp-date-picker',
                template: '<div [ngClass]="{\'dp-open\': areCalendarsShown}">   <div class="dp-input-container"        [hidden]="componentConfig.hideInputContainer"        [attr.data-hidden]="componentConfig.hideInputContainer">     <input type="text"            class="dp-picker-input"            [placeholder]="placeholder"            [ngModel]="inputElementValue"            (ngModelChange)="onViewDateChange($event)"            (focus)="inputFocused()"            [readonly]="componentConfig.disableKeypress"            [disabled]="disabled"/>   </div>   <div #container>     <div class="dp-popup {{theme}}"          [ngSwitch]="mode"          [hidden]="!_areCalendarsShown"          [attr.data-hidden]="!_areCalendarsShown">       <dp-day-calendar #dayCalendar                        *ngSwitchCase="\'day\'"                        [config]="dayCalendarConfig"                        [ngModel]="_selected"                        [displayDate]="displayDate"                        (onSelect)="dateSelected($event, \'day\')"                        [theme]="theme">       </dp-day-calendar>        <dp-month-calendar #monthCalendar                          *ngSwitchCase="\'month\'"                          [config]="dayCalendarConfig"                          [ngModel]="_selected"                          [displayDate]="displayDate"                          (onSelect)="dateSelected($event, \'month\')"                          [theme]="theme">       </dp-month-calendar>        <dp-time-select #timeSelect                       *ngSwitchCase="\'time\'"                       [config]="timeSelectConfig"                       [ngModel]="_selected && _selected[0]"                       (onChange)="dateSelected($event, \'second\', true)"                       [theme]="theme">       </dp-time-select>        <dp-day-time-calendar #daytimeCalendar                             *ngSwitchCase="\'daytime\'"                             [config]="dayTimeCalendarConfig"                             [displayDate]="displayDate"                             [ngModel]="_selected && _selected[0]"                             (onChange)="dateSelected($event, \'second\', true)"                             [theme]="theme">       </dp-day-time-calendar>        <div class="dp-month-calendar-container">         <ng-content>         </ng-content>       </div>     </div>   </div> </div> ',
                styles: ['dp-date-picker {  display: inline-block;}dp-date-picker.dp-material .dp-picker-input {  box-sizing: border-box;  height: 30px;  width: 213px;  font-size: 13px;  outline: none;}dp-date-picker .dp-input-container {  position: relative;}dp-date-picker .dp-selected {  background: #106CC8;  color: #FFFFFF;}.dp-popup {  position: relative;  background: #FFFFFF;  box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, 0.1);  border-left: 1px solid rgba(0, 0, 0, 0.1);  border-right: 1px solid rgba(0, 0, 0, 0.1);  border-bottom: 1px solid rgba(0, 0, 0, 0.1);  z-index: 9999;  white-space: nowrap;}'],
                encapsulation: core_1.ViewEncapsulation.None,
                providers: [
                    date_picker_service_1.DatePickerService,
                    day_time_calendar_service_1.DayTimeCalendarService,
                    day_calendar_service_1.DayCalendarService,
                    time_select_service_1.TimeSelectService,
                    {
                        provide: forms_1.NG_VALUE_ACCESSOR,
                        useExisting: core_1.forwardRef(function () { return DatePickerComponent; }),
                        multi: true
                    },
                    {
                        provide: forms_1.NG_VALIDATORS,
                        useExisting: core_1.forwardRef(function () { return DatePickerComponent; }),
                        multi: true
                    }
                ]
            },] },
];
/** @nocollapse */
DatePickerComponent.ctorParameters = function () { return [
    { type: date_picker_service_1.DatePickerService, },
    { type: dom_appender_service_1.DomHelper, },
    { type: core_1.ElementRef, },
    { type: core_1.Renderer, },
    { type: utils_service_1.UtilsService, },
]; };
DatePickerComponent.propDecorators = {
    'config': [{ type: core_1.Input },],
    'mode': [{ type: core_1.Input },],
    'placeholder': [{ type: core_1.Input },],
    'disabled': [{ type: core_1.Input },],
    'displayDate': [{ type: core_1.Input },],
    'theme': [{ type: core_1.HostBinding, args: ['class',] }, { type: core_1.Input },],
    'minDate': [{ type: core_1.Input },],
    'maxDate': [{ type: core_1.Input },],
    'minTime': [{ type: core_1.Input },],
    'maxTime': [{ type: core_1.Input },],
    'open': [{ type: core_1.Output },],
    'close': [{ type: core_1.Output },],
    'onChange': [{ type: core_1.Output },],
    'calendarContainer': [{ type: core_1.ViewChild, args: ['container',] },],
    'dayCalendarRef': [{ type: core_1.ViewChild, args: ['dayCalendar',] },],
    'monthCalendarRef': [{ type: core_1.ViewChild, args: ['monthCalendar',] },],
    'dayTimeCalendarRef': [{ type: core_1.ViewChild, args: ['daytimeCalendar',] },],
    'timeSelectRef': [{ type: core_1.ViewChild, args: ['timeSelect',] },],
    'onClick': [{ type: core_1.HostListener, args: ['click',] },],
    'onBodyClick': [{ type: core_1.HostListener, args: ['document:click',] },],
    'onScroll': [{ type: core_1.HostListener, args: ['document:scroll',] }, { type: core_1.HostListener, args: ['window:resize',] },],
};
exports.DatePickerComponent = DatePickerComponent;
//# sourceMappingURL=date-picker.component.js.map