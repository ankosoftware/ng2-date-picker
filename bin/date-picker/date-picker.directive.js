"use strict";
var date_picker_directive_service_1 = require("./date-picker-directive.service");
var date_picker_component_1 = require("./date-picker.component");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var DatePickerDirective = (function () {
    function DatePickerDirective(viewContainerRef, elemRef, componentFactoryResolver, service, formControl) {
        this.viewContainerRef = viewContainerRef;
        this.elemRef = elemRef;
        this.componentFactoryResolver = componentFactoryResolver;
        this.service = service;
        this.formControl = formControl;
        this._mode = 'day';
        this.open = new core_1.EventEmitter();
        this.close = new core_1.EventEmitter();
        this.onChange = new core_1.EventEmitter();
    }
    Object.defineProperty(DatePickerDirective.prototype, "config", {
        get: function () {
            return this._config;
        },
        set: function (config) {
            this._config = this.service.getConfig(config, this.viewContainerRef.element, this.attachTo);
            this.updateDatepickerConfig();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DatePickerDirective.prototype, "attachTo", {
        get: function () {
            return this._attachTo;
        },
        set: function (attachTo) {
            this._attachTo = attachTo;
            this._config = this.service.getConfig(this.config, this.viewContainerRef.element, this.attachTo);
            this.updateDatepickerConfig();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DatePickerDirective.prototype, "theme", {
        get: function () {
            return this._theme;
        },
        set: function (theme) {
            this._theme = theme;
            if (this.datePicker) {
                this.datePicker.theme = theme;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DatePickerDirective.prototype, "mode", {
        get: function () {
            return this._mode;
        },
        set: function (mode) {
            this._mode = mode;
            if (this.datePicker) {
                this.datePicker.mode = mode;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DatePickerDirective.prototype, "minDate", {
        get: function () {
            return this._minDate;
        },
        set: function (minDate) {
            this._minDate = minDate;
            if (this.datePicker) {
                this.datePicker.minDate = minDate;
                this.datePicker.ngOnInit();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DatePickerDirective.prototype, "maxDate", {
        get: function () {
            return this._maxDate;
        },
        set: function (maxDate) {
            this._maxDate = maxDate;
            if (this.datePicker) {
                this.datePicker.maxDate = maxDate;
                this.datePicker.ngOnInit();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DatePickerDirective.prototype, "minTime", {
        get: function () {
            return this._minTime;
        },
        set: function (minTime) {
            this._minTime = minTime;
            if (this.datePicker) {
                this.datePicker.minTime = minTime;
                this.datePicker.ngOnInit();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DatePickerDirective.prototype, "maxTime", {
        get: function () {
            return this._maxTime;
        },
        set: function (maxTime) {
            this._maxTime = maxTime;
            if (this.datePicker) {
                this.datePicker.maxTime = maxTime;
                this.datePicker.ngOnInit();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DatePickerDirective.prototype, "displayDate", {
        get: function () {
            return this._displayDate;
        },
        set: function (displayDate) {
            this._displayDate = displayDate;
            this.updateDatepickerConfig();
        },
        enumerable: true,
        configurable: true
    });
    DatePickerDirective.prototype.ngOnInit = function () {
        this.datePicker = this.createDatePicker();
        this.api = this.datePicker.api;
        this.updateDatepickerConfig();
        this.attachModelToDatePicker();
        this.datePicker.theme = this.theme;
    };
    DatePickerDirective.prototype.createDatePicker = function () {
        var factory = this.componentFactoryResolver.resolveComponentFactory(date_picker_component_1.DatePickerComponent);
        return this.viewContainerRef.createComponent(factory).instance;
    };
    DatePickerDirective.prototype.attachModelToDatePicker = function () {
        var _this = this;
        if (!this.formControl) {
            return;
        }
        this.datePicker.onViewDateChange(this.formControl.value);
        this.formControl.valueChanges.subscribe(function (value) {
            if (value !== _this.datePicker.inputElementValue) {
                _this.datePicker.onViewDateChange(value);
            }
        });
        var setup = true;
        this.datePicker.registerOnChange(function (value) {
            if (value) {
                var isMultiselectEmpty = setup && Array.isArray(value) && !value.length;
                if (!isMultiselectEmpty) {
                    _this.formControl.control.setValue(_this.datePicker.inputElementValue);
                }
            }
            var errors = _this.datePicker.validateFn(value);
            if (!setup) {
                _this.formControl.control.markAsDirty(true);
            }
            else {
                setup = false;
            }
            if (errors) {
                if (errors.hasOwnProperty('format')) {
                    var given = errors['format'].given;
                    _this.datePicker.inputElementValue = given;
                    _this.formControl.control.setValue(given);
                }
                _this.formControl.control.setErrors(errors);
            }
        });
    };
    DatePickerDirective.prototype.onClick = function () {
        this.datePicker.onClick();
    };
    DatePickerDirective.prototype.onFocus = function () {
        this.datePicker.inputFocused();
    };
    DatePickerDirective.prototype.updateDatepickerConfig = function () {
        if (this.datePicker) {
            this.datePicker.minDate = this.minDate;
            this.datePicker.maxDate = this.maxDate;
            this.datePicker.minTime = this.minTime;
            this.datePicker.maxTime = this.maxTime;
            this.datePicker.mode = this.mode || 'day';
            this.datePicker.displayDate = this.displayDate;
            this.datePicker.config = this.config;
            this.datePicker.open = this.open;
            this.datePicker.close = this.close;
            this.datePicker.onChange = this.onChange;
            this.datePicker.init();
            if (this.datePicker.componentConfig.disableKeypress) {
                this.elemRef.nativeElement.setAttribute('readonly', true);
            }
            else {
                this.elemRef.nativeElement.removeAttribute('readonly');
            }
        }
    };
    return DatePickerDirective;
}());
DatePickerDirective.decorators = [
    { type: core_1.Directive, args: [{
                exportAs: 'dpDayPicker',
                providers: [date_picker_directive_service_1.DatePickerDirectiveService],
                selector: '[dpDayPicker]'
            },] },
];
/** @nocollapse */
DatePickerDirective.ctorParameters = function () { return [
    { type: core_1.ViewContainerRef, },
    { type: core_1.ElementRef, },
    { type: core_1.ComponentFactoryResolver, },
    { type: date_picker_directive_service_1.DatePickerDirectiveService, },
    { type: forms_1.NgControl, decorators: [{ type: core_1.Optional },] },
]; };
DatePickerDirective.propDecorators = {
    'config': [{ type: core_1.Input, args: ['dpDayPicker',] },],
    'attachTo': [{ type: core_1.Input },],
    'theme': [{ type: core_1.Input },],
    'mode': [{ type: core_1.Input },],
    'minDate': [{ type: core_1.Input },],
    'maxDate': [{ type: core_1.Input },],
    'minTime': [{ type: core_1.Input },],
    'maxTime': [{ type: core_1.Input },],
    'displayDate': [{ type: core_1.Input },],
    'open': [{ type: core_1.Output },],
    'close': [{ type: core_1.Output },],
    'onChange': [{ type: core_1.Output },],
    'onClick': [{ type: core_1.HostListener, args: ['click',] },],
    'onFocus': [{ type: core_1.HostListener, args: ['focus',] },],
};
exports.DatePickerDirective = DatePickerDirective;
//# sourceMappingURL=date-picker.directive.js.map