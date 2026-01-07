/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-family-primary)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem', // 12px - standard
        'full': '9999px', // circular
      },
    },
  },
  plugins: [],
}
