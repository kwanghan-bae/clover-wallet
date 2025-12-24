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
      fontFamily: {
        sans: ["NotoSansKR_400Regular"],
        medium: ["NotoSansKR_500Medium"],
        bold: ["NotoSansKR_700Bold"],
        black: ["NotoSansKR_900Black"],
      },
      colors: {
        primary: "#4CAF50", // Clover Green
        "primary-dark": "#388E3C",
        "primary-light": "#C8E6C9",
        secondary: "#FFC107", // Gold
        accent: "#2196F3", // Blue
        background: "#F5F7FA", // Light Grey-Blue
        "text-dark": "#1A1A1A",
        "text-grey": "#757575",
        error: "#E53935",
      },
    },
  },
  plugins: [],
}