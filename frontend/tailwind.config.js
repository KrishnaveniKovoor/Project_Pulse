/** @type {import('tailwindcss').Config} */
// Arctic Reflection Palette
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Arctic Reflection palette
        'arctic-dark':      '#243C4C', // dark sidebar / navbar / headings
        'arctic-primary':   '#5289AD', // primary buttons, links, active states
        'arctic-secondary': '#698696', // secondary elements
        'arctic-muted':     '#ACBCBF', // borders, muted elements
        'arctic-bg':        '#F4FCFB', // main background

        // Aliases for backward compat
        primary:   '#5289AD',
        sidebar:   '#243C4C',
        lightblue: '#ACBCBF',
        bglight:   '#F4FCFB',
      }
    },
  },
  plugins: [],
}
