/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        angel: {
          teal: '#14B8A6',
          cream: '#FFFDF7',
          sage: '#7FA582',
          sageDark: '#5F8764',
          ink: '#18312F'
        }
      },
      boxShadow: {
        soft: '0 16px 40px rgba(24, 49, 47, 0.12)'
      }
    }
  },
  plugins: []
};
