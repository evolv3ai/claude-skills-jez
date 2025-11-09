/** @type {import('tailwindcss').Config} */
module.exports = {
  // Content sources for Tailwind scanning
  content: [
    './hugo_stats.json',           // Hugo's generated stats file
    './layouts/**/*.html',         // All layout templates
    './content/**/*.{html,md}',    // All content files
  ],

  // Dark mode configuration
  darkMode: 'class',  // Use class-based dark mode (.dark on <html>)

  // Theme customization
  theme: {
    extend: {
      colors: {
        // Add custom colors
        primary: '#0066cc',
        secondary: '#6366f1',
      },
    },
  },

  // Plugins (add more as needed)
  plugins: [],
}
