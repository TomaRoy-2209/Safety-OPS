/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The "SafeCity" Dark Theme
        cyber: {
          black: '#020617', // Main Background (Darkest)
          panel: '#0f172a', // Card Background (Slightly lighter)
          border: '#1e293b', // Borders
          text: '#f1f5f9',  // Main Text
          muted: '#94a3b8', // Secondary Text
          primary: '#3b82f6', // Action Buttons (Blue)
          danger: '#ef4444', // Alerts (Red)
          success: '#10b981', // Success (Green)
        }
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
};
