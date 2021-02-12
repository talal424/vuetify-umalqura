import { VDatePickerDateTable } from "vuetify/lib";

import { createFormatter, pad, daysInMonth, firstDayOfTheMonth, weekOfYear } from './util';

export default {
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
    
            while (day--) {
                const date = `${prevMonthYear}-${pad(prevMonth)}-${pad(firstDayFromPreviousMonth - day)}`;
                rows.push(this.$createElement('td', this.showAdjacentMonths ? [this.genButton(date, true, 'date', this.formatter, true)] : []));
            }
    
            for (day = 1; day <= daysInCurrentMonth; day++) {
                const date = `${this.displayedYear}-${pad(this.displayedMonth)}-${pad(day)}`;
                rows.push(this.$createElement('td', [this.genButton(date, true, 'date', this.formatter)]));
    
                if (rows.length % (this.showWeek ? 8 : 7) === 0) {
                    children.push(this.genTR(rows));
                    rows = [];
        
                    if (this.showWeek && day < daysInCurrentMonth) {
                        rows.push(this.genWeekNumber(this.getWeekNumber((day + 7) > daysInCurrentMonth ? daysInCurrentMonth : (day + 7))));
                    }
                }
            }

            const nextMonthYear = this.displayedMonth === 12 ? this.displayedYear + 1 : this.displayedYear;
            const nextMonth = this.displayedMonth === 12 ? 1 : this.displayedMonth + 1;
            let nextMonthDay = 1;

            while (rows.length < 7) {
                const date = `${nextMonthYear}-${pad(nextMonth)}-${pad(nextMonthDay++)}`;
                rows.push(this.$createElement('td', this.showAdjacentMonths ? [this.genButton(date, true, 'date', this.formatter, true)] : []));
            }
    
            if (rows.length) {
                children.push(this.genTR(rows));
            }
    
            return this.$createElement('tbody', children);
        },
    }
}