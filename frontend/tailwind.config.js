/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sliit: {
          blue: '#053668',
          orange: '#FF7100',
          yellow: '#F7ECB5',
        },
      },
    },
  },
  plugins: [],
}
