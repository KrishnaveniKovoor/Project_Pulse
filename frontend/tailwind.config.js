/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3399B7',
        sidebar: '#485257',
        lightblue: '#A8D7E8',
        bglight: '#F0FAFD',
      }
    },
  },
  plugins: [],
}
