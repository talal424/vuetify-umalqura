import { VDatePickerHeader } from "vuetify/lib";

import { createFormatter } from './util';

export default {
    extends: VDatePickerHeader,
    computed: {
        formatter() {
            return this.format || createFormatter(String(this.value).split('-')[1] ? 'monthYear' : 'year', this.currentLocale);
        }
    },
}