import { VDatePickerYears } from "vuetify/lib";

import { createFormatter } from './util';

export default {
    extends: VDatePickerYears,
    computed: {
        formatter() {
            return this.format || createFormatter('year', this.currentLocale);
        }
    },
}