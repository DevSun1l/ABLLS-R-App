/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7F77DD",
        success: "#1D9E75",
        warning: "#EF9F27",
        danger: "#E24B4A",
        info: "#378ADD",
        background: "#F8F8F6",
        card: "#FFFFFF",
        textPrimary: "#1A1A1A",
        textSecondary: "#6B6B6B",
        border: "#E5E5E3",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
