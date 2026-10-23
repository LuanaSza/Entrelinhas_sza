/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0C10",
        surface: "#14131A",
        paper: "#F3F0F5",
        muted: "#AAA3B5",
        accent: "#BBA2DE",
        line: "#302B38"
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["'DM Sans'", "sans-serif"]
      }
    }
  },
  plugins: []
};
