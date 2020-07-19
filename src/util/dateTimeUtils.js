import umalqura from '@umalqura/core';

export function createFormatter(type, locale) {
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

export function daysInMonth(year, month){
    return umalqura(year, month, 1).daysInMonth
}

export function firstDayOfTheMonth(year, month) {
    return umalqura(year, month, 1).dayOfWeek
}

export function weekOfYear(year, month, date) {
    return umalqura(year, month, date).weekOfYear
}