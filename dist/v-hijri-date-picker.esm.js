import { VDatePickerHeader, VDatePickerMonthTable, VDatePickerDateTable, VDatePickerYears, VDatePicker } from 'vuetify/lib';
import umalqura from '@umalqura/core';
import { pad, createItemTypeListeners } from 'vuetify/lib/components/VDatePicker/util';
import isDateAllowed from 'vuetify/lib/components/VDatePicker/util/isDateAllowed';
import { wrapInArray } from 'vuetify/lib/util/helpers';

umalqura.locale('en');

function createFormatter(type, locale) {
    return dateString => {
        const [year, month, date] = dateString.trim().split(' ')[0].split('-');

        if (type === 'day') {
            return umalqura(year, month, date).format('d', locale)
        }
        
        if (type === 'year') {
            return year
        }
    
        if (type === 'month') {
            return umalqura(year, month, 1).format('MMMM', locale)
        }

        if (type === 'date') {
            return umalqura(year, month, date).format(locale === 'ar' ? 'dddd, d MMM' : 'ddd, MMM d', locale)
        }

        if (type === 'monthYear') {
            return umalqura(year, month, 1).format('MMMM yyyy', locale)
        }
    }
}

function daysInMonth(year, month){
    return umalqura(year, month, 1).daysInMonth
}

function firstDayOfTheMonth(year, month) {
    return umalqura(year, month, 1).dayOfWeek
}

function weekOfYear(year, month, date) {
    return umalqura(year, month, date).weekOfYear
}

var VHijriDatePickerHeader = {
    extends: VDatePickerHeader,
    computed: {
        formatter() {
            return this.format || createFormatter(String(this.value).split('-')[1] ? 'monthYear' : 'year', this.currentLocale);
        }
    },
};

var VHijriDatePickerMonthTable = {
    extends: VDatePickerMonthTable,
    computed: {
        formatter() {
            return this.format || createFormatter('month', this.currentLocale);
        }
    },
    methods: {
        genTBody() {
            const children = [];
            const cols = Array(3).fill(null);
            const rows = 12 / cols.length;
    
            for (let row = 0; row < rows; row++) {
                const tds = cols.map((_, col) => {
                    const month = row * cols.length + col;
                    const date = `${this.displayedYear}-${pad(month + 1)}`;
                    return this.$createElement('td', { key: month }, [this.genButton(date, false, 'month', this.formatter)]);
                });
                children.push(this.$createElement('tr', { key: row }, tds));
            }
    
            return this.$createElement('tbody', children);
        },
        genButton(value, isFloating, mouseEventType, formatter) {
            const isAllowed = isDateAllowed(value, this.min, this.max, this.allowedDates);
            const isSelected = this.isSelected(value) && isAllowed;
            const isCurrent = value === this.current;
            const setColor = isSelected ? this.setBackgroundColor : this.setTextColor;
            const color = (isSelected || isCurrent) && (this.color || 'accent');
            return this.$createElement('button', setColor(color, {
                staticClass: 'v-btn',
                class: this.genButtonClasses(isAllowed, isFloating, isSelected, isCurrent),
                attrs: {
                    type: 'button'
                },
                domProps: {
                    disabled: this.disabled || !isAllowed
                },
                on: this.genButtonEvents(value, isAllowed, mouseEventType)
            }), [this.$createElement('div', {
                staticClass: 'v-btn__content'
            }, [formatter(value)]), this.genEvents(value)]);
        },
    }
};

var VHijriDatePickerDateTable = {
    extends: VDatePickerDateTable,
    computed: {
        formatter() {
            return this.format || createFormatter('day', this.currentLocale);
        },
    },
    methods: {
        weekDaysBeforeFirstDayOfTheMonth() {
            const weekDay = firstDayOfTheMonth(this.displayedYear, this.displayedMonth);
            return (weekDay - parseInt(this.firstDayOfWeek) + 7) % 7;
        },

        getWeekNumber(dayInMonth) {
            return weekOfYear(this.displayedYear, this.displayedMonth, dayInMonth)
        },

        genTBody() {
            const children = [];
            const daysInCurrentMonth = daysInMonth(this.displayedYear, this.displayedMonth);
            let rows = [];
            let day = this.weekDaysBeforeFirstDayOfTheMonth();
    
            if (this.showWeek) {
                rows.push(this.genWeekNumber(this.getWeekNumber(1)));
            }

            const prevMonthYear = this.displayedMonth === 1 ? this.displayedYear - 1 : this.displayedYear;
            const prevMonth = this.displayedMonth === 1 ? 12 : this.displayedMonth - 1;
            const firstDayFromPreviousMonth = daysInMonth(prevMonthYear, prevMonth);
            const cellsInRow = this.showWeek ? 8 : 7;
    
            while (day--) {
                const date = `${prevMonthYear}-${pad(prevMonth)}-${pad(firstDayFromPreviousMonth - day)}`;
                rows.push(this.$createElement('td', this.showAdjacentMonths ? [this.genButton(date, true, 'date', this.formatter, true)] : []));
            }
    
            for (day = 1; day <= daysInCurrentMonth; day++) {
                const date = `${this.displayedYear}-${pad(this.displayedMonth)}-${pad(day)}`;
                rows.push(this.$createElement('td', [this.genButton(date, true, 'date', this.formatter)]));
    
                if (rows.length % cellsInRow === 0) {
                    children.push(this.genTR(rows));
                    rows = [];
        
                    if (this.showWeek && (day < daysInCurrentMonth || this.showAdjacentMonths)) {
                        rows.push(this.genWeekNumber(this.getWeekNumber((day + 7) > daysInCurrentMonth ? daysInCurrentMonth : (day + 7))));
                    }
                }
            }

            const nextMonthYear = this.displayedMonth === 12 ? this.displayedYear + 1 : this.displayedYear;
            const nextMonth = this.displayedMonth === 12 ? 1 : this.displayedMonth + 1;
            let nextMonthDay = 1;

            while (rows.length < cellsInRow) {
                const date = `${nextMonthYear}-${pad(nextMonth)}-${pad(nextMonthDay++)}`;
                rows.push(this.$createElement('td', this.showAdjacentMonths ? [this.genButton(date, true, 'date', this.formatter, true)] : []));
            }
    
            if (rows.length) {
                children.push(this.genTR(rows));
            }
    
            return this.$createElement('tbody', children);
        },
    }
};

var VHijriDatePickerYearItems = {
    extends: VDatePickerYears,
    computed: {
        formatter() {
            return this.format || createFormatter('year', this.currentLocale);
        }
    },
};

function sanitizeDateString(dateString, type) {
    const [year, month = 1, date = 1] = dateString.split("-");
    return `${year}-${pad(month)}-${pad(date)}`.substr(
        0,
        {
            date: 10,
            month: 7,
            year: 4
        }[type]
    );
}

var VHijriDatePicker = {
    extends: VDatePicker,
    name: "VHijriDatePicker",
    props: {
        max: {
            type: String,
            validator: dateString => {
                return Number(sanitizeDateString(dateString, 'year')) <= umalqura.max.hy
            }
        },
        min: {
            type: String,
            validator: dateString => {
                return Number(sanitizeDateString(dateString, 'year')) >= umalqura.min.hy
            }
        },
    },
    data() {
        const now = umalqura();
        return {
            internalActivePicker: this.type.toUpperCase(),
            inputDay: null,
            inputMonth: null,
            inputYear: null,
            isReversing: false,
            now,
            tableDate: (() => {
                if (this.pickerDate) {
                    return this.pickerDate;
                }

                const multipleValue = wrapInArray(this.value);
                const date = multipleValue[multipleValue.length - 1] || (typeof this.showCurrent === 'string' ? this.showCurrent : `${now.hy}-${now.hm}`);
                return sanitizeDateString(date, this.type === 'date' ? 'month' : 'year');
            })(),
        };
    },
    computed: {
        current() {
            if (this.showCurrent === true) {
                return sanitizeDateString(`${this.now.hy}-${this.now.hm}-${this.now.hd}`, this.type);
            }
            return this.showCurrent || null;
        },

        inputDate() {
            return this.type === 'date' ? `${this.inputYear}-${pad(this.inputMonth)}-${pad(this.inputDay)}` : `${this.inputYear}-${pad(this.inputMonth)}`;
        },

        tableMonth() {
            return Number((this.pickerDate || this.tableDate).split('-')[1]);
        },

        minMonth() {
            return this.min ? sanitizeDateString(this.min, 'month') : umalqura.min.format('yyyy-MM', 'en');
        },
      
        maxMonth() {
            return this.max ? sanitizeDateString(this.max, 'month') : umalqura.max.subtract(1,'year').format('yyyy-MM', 'en');
        },
      
        minYear() {
            return this.min ? sanitizeDateString(this.min, 'year') : umalqura.min.format('yyyy', 'en');
        },
      
        maxYear() {
            return this.max ? sanitizeDateString(this.max, 'year') : umalqura.max.subtract(1,'year').format('yyyy', 'en');
        },

        formatters() {
            return {
                year: createFormatter('year', this.currentLocale),
                titleDate: this.titleDateFormat || (this.isMultiple ? this.defaultTitleMultipleDateFormatter : this.defaultTitleDateFormatter)
            };
        },

        defaultTitleDateFormatter() {
            const titleDateFormatter = createFormatter(this.type, this.currentLocale);
    
            const landscapeFormatter = date => titleDateFormatter(date).replace(/([^\d\s])([\d])/g, (match, nonDigit, digit) => `${nonDigit} ${digit}`).replace(', ', ',<br>');
    
            return this.landscape ? landscapeFormatter : titleDateFormatter;
        }
    },
    methods: {
        yearClick(value) {
            this.inputYear = value;
    
            if (this.type === 'month') {
                this.tableDate = `${value}`;
            } else {
                this.tableDate = `${value}-${pad(this.tableMonth || 1)}`;
            }
    
            this.internalActivePicker = 'MONTH';
    
            if (this.reactive && !this.readonly && !this.isMultiple && this.isDateAllowed(this.inputDate)) {
                this.$emit('input', this.inputDate);
            }
        },

        monthClick(value) {
            this.inputYear = parseInt(value.split('-')[0], 10);
            this.inputMonth = parseInt(value.split('-')[1], 10);
    
            if (this.type === 'date') {
                if (this.inputDay) {
                    this.inputDay = Math.min(this.inputDay, daysInMonth(this.inputYear, this.inputMonth));
                }
    
                this.tableDate = value;
                this.internalActivePicker = 'DATE';
    
                if (this.reactive && !this.readonly && !this.isMultiple && this.isDateAllowed(this.inputDate)) {
                    this.$emit('input', this.inputDate);
                }
            } else {
                this.emitInput(this.inputDate);
            }
        },
      
        dateClick(value) {
            this.inputYear = parseInt(value.split('-')[0], 10);
            this.inputMonth = parseInt(value.split('-')[1], 10);
            this.inputDay = parseInt(value.split('-')[2], 10);
            this.emitInput(this.inputDate);
        },
        
        genTableHeader() {
            return this.$createElement(VHijriDatePickerHeader, {
                props: {
                    nextIcon: this.nextIcon,
                    color: this.color,
                    dark: this.dark,
                    disabled: this.disabled,
                    format: this.headerDateFormat,
                    light: this.light,
                    locale: this.locale,
                    min: this.internalActivePicker === 'DATE' ? this.minMonth : this.minYear,
                    max: this.internalActivePicker === 'DATE' ? this.maxMonth : this.maxYear,
                    nextAriaLabel: this.internalActivePicker === 'DATE' ? this.nextMonthAriaLabel : this.nextYearAriaLabel,
                    prevAriaLabel: this.internalActivePicker === 'DATE' ? this.prevMonthAriaLabel : this.prevYearAriaLabel,
                    prevIcon: this.prevIcon,
                    readonly: this.readonly,
                    value: this.internalActivePicker === 'DATE' ? `${pad(this.tableYear, 4)}-${pad(this.tableMonth)}` : `${pad(this.tableYear, 4)}`
                },
                on: {
                    toggle: () => this.internalActivePicker = this.internalActivePicker === 'DATE' ? 'MONTH' : 'YEAR',
                    input: value => this.tableDate = value
                }
            });
        },

        genDateTable() {
            return this.$createElement(VHijriDatePickerDateTable, {
                props: {
                    allowedDates: this.allowedDates,
                    color: this.color,
                    current: this.current,
                    dark: this.dark,
                    disabled: this.disabled,
                    events: this.events,
                    eventColor: this.eventColor,
                    firstDayOfWeek: this.firstDayOfWeek,
                    format: this.dayFormat,
                    light: this.light,
                    locale: this.locale,
                    localeFirstDayOfYear: this.localeFirstDayOfYear,
                    min: this.min,
                    max: this.max,
                    range: this.range,
                    readonly: this.readonly,
                    scrollable: this.scrollable,
                    showAdjacentMonths: this.showAdjacentMonths,
                    showWeek: this.showWeek,
                    tableDate: `${pad(this.tableYear, 4)}-${pad(this.tableMonth + 1)}`,
                    value: this.value,
                    weekdayFormat: this.weekdayFormat
                },
                ref: 'table',
                on: {
                    input: this.dateClick,
                    'update:table-date': value => this.tableDate = value,
                    ...createItemTypeListeners(this, ':date')
                }
            });
        },
        
        genMonthTable() {
            return this.$createElement(VHijriDatePickerMonthTable, {
                props: {
                    allowedDates: this.type === 'month' ? this.allowedDates : null,
                    color: this.color,
                    current: this.current ? sanitizeDateString(this.current, 'month') : null,
                    dark: this.dark,
                    disabled: this.disabled,
                    events: this.type === 'month' ? this.events : null,
                    eventColor: this.type === 'month' ? this.eventColor : null,
                    format: this.monthFormat,
                    light: this.light,
                    locale: this.locale,
                    min: this.minMonth,
                    max: this.maxMonth,
                    range: this.range,
                    readonly: this.readonly && this.type === 'month',
                    scrollable: this.scrollable,
                    value: this.selectedMonths,
                    tableDate: `${pad(this.tableYear, 4)}`
                },
                ref: 'table',
                on: {
                    input: this.monthClick,
                    'update:table-date': value => this.tableDate = value,
                    ...createItemTypeListeners(this, ':month')
                }
            });
        },

        genYears() {
            return this.$createElement(VHijriDatePickerYearItems, {
                props: {
                    allowedDates: this.type === 'year' ? this.allowedDates : null,
                    color: this.color,
                    current: this.current ? sanitizeDateString(this.current, 'year') : null,
                    dark: this.dark,
                    disabled: this.disabled,
                    events: this.type === 'year' ? this.events : null,
                    eventColor: this.type === 'year' ? this.eventColor : null,
                    light: this.light,
                    locale: this.locale,
                    min: this.minMonth,
                    max: this.maxMonth,
                    range: this.range,
                    readonly: this.readonly && this.type === 'year',
                    scrollable: this.scrollable,
                    value: this.selectedMonths,
                },
                ref: 'table',
                on: {
                    input: this.yearClick,
                    'update:table-date': value => this.tableDate = value,
                    ...createItemTypeListeners(this, ':year')
                }
            });
        },

        setInputDate() {
            if (this.lastValue) {
                const array = this.lastValue.split('-');
                this.inputYear = parseInt(array[0], 10);
                this.inputMonth = parseInt(array[1], 10);
        
                if (this.type === 'date') {
                    this.inputDay = parseInt(array[2], 10);
                }
            } else {
                this.inputYear = this.inputYear || this.now.hy;
                this.inputMonth = this.inputMonth == null ? this.inputMonth : this.now.hm;
                this.inputDay = this.inputDay || this.now.hd;
            }
        },
    }
};

export default VHijriDatePicker;
