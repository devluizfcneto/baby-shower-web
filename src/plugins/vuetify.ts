/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'babyShowerLight',
    themes: {
      babyShowerLight: {
        dark: false,
        colors: {
          background: '#F6F9FB',
          error: '#B3261E',
          info: '#1769AA',
          primary: '#355C8A',
          secondary: '#DB7742',
          success: '#2E7D32',
          surface: '#FFFFFF',
          warning: '#B26A00',
        },
      },
    },
  },
})
