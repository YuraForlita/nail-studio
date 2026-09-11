/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        shell: 'rgb(var(--color-shell) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        inkSoft: 'rgb(var(--color-ink-soft) / <alpha-value>)',
        wine: {
          DEFAULT: 'rgb(var(--color-wine) / <alpha-value>)',
          dark: 'rgb(var(--color-wine-dark) / <alpha-value>)',
          light: 'rgb(var(--color-wine-light) / <alpha-value>)',
        },
        caramel: {
          DEFAULT: 'rgb(var(--color-caramel) / <alpha-value>)',
          light: 'rgb(var(--color-caramel-light) / <alpha-value>)',
        },
        sage: 'rgb(var(--color-sage) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        // Завжди світлий — для тексту/іконок поверх насичених кольорових кнопок (bg-wine тощо),
        // незалежно від теми.
        cream: '#F3ECE7',
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
