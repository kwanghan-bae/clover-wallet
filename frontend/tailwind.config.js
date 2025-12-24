/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./app/**/*.{js,jsx,ts,tsx}", 
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4CAF50", // Clover Green
        secondary: "#FFC107", // Gold Yellow
        accent: "#2196F3", // Sky Blue
        background: "#F5F5F5",
        text: {
          dark: "#212121",
          light: "#757575",
        }
      },
    },
  },
  plugins: [],
}