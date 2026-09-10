/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        shell: '#F3ECE7',
        ink: '#2B2320',
        inkSoft: '#5B4F49',
        wine: {
          DEFAULT: '#7A2E3C',
          dark: '#5C2130',
          light: '#9C4A59',
        },
        caramel: {
          DEFAULT: '#C98F65',
          light: '#E4BE99',
        },
        sage: '#5C7A5E',
        line: '#E4D9D0',
        card: '#FFFDFB',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(43,35,32,0.06), 0 8px 24px -12px rgba(43,35,32,0.12)',
      },
    },
  },
  plugins: [],
}
