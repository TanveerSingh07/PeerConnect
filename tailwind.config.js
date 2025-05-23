/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
      extend: {
        colors: {
          primary: {
            light: '#3b82f6',
            DEFAULT: '#2563eb',
            dark: '#1e40af',
          },
        },
      },
    },
    plugins: [],
  };
  