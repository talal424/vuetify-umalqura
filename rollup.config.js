import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'src/index.js',
    output: {
        name: 'VHijriDatePicker',
        exports: 'named',
        file: 'dist/v-hijri-date-picker.esm.js',
        format: 'esm'// "amd", "cjs", "system", "", "iife" or "umd"
    },
    plugins: [
        commonjs(),
        resolve({
            customResolveOptions: {
                moduleDirectory: 'node_modules'
            }
        })
    ],
    external: [
        'vuetify/lib',
        '@umalqura/core',
        'vuetify/lib/components/VDatePicker/util',
        'vuetify/lib/components/VDatePicker/util/isDateAllowed',
        'vuetify/lib/util/helpers'
    ]
}