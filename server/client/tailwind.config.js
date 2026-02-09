/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#1a1f3a',
          800: '#1e293b',
          700: '#252b42'
        },
        primary: {
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca'
        },
        accent: {
          500: '#8b5cf6'
        },
        success: '#10b981',
        error: '#ef4444'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'soft-lg': '0 20px 40px rgba(15, 23, 42, 0.6)'
      }
    }
  },
  plugins: []
};

