/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
import { VIconBtn } from 'vuetify/labs/VIconBtn'
import { VColorInput } from 'vuetify/labs/VColorInput'
import { VDateInput } from 'vuetify/labs/VDateInput'

// Translation
import { pt, en } from 'vuetify/locale'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#F0F2F5',     // Very soft gray (like Notion/Figma)
          surface: '#FFFFFF',        // Card surfaces
          primary: '#5E6C84',        // Muted slate gray-blue
          secondary: '#9AA1AC',      // Soft mid-gray
          accent: '#ADB5BD',         // Subtle gray-blue
          error: '#D76C6C',          // Soft error red
          info: '#5B8DEF',           // Muted blue
          success: '#6BA67C',        // Dusty green
          warning: '#E1B055',        // Muted amber
        },
      },
      dark: {
        dark: true,
        colors: {
          background: '#1F1F23',     // Deep charcoal gray
          surface: '#2C2C30',        // Card gray (like VSCode)
          primary: '#AAB2BF',        // Muted light gray-blue
          secondary: '#7C828A',
          accent: '#8E99A4',         // Neutral light tone
          error: '#D66A6A',
          info: '#6A95D2',
          success: '#88B796',
          warning: '#F4C17D',
        },
      },
    }
  },
  locale: {
    locale: 'pt',
    fallback: 'en',
    messages: { pt, en },
  },
  components: {
    VIconBtn,
    VColorInput,
    VDateInput
  },
})
