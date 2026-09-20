/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "dark-green": "#064C3B",
        green: "#0A634D",
        sage: "#AABF78",
        "light-sage": "#E8EEDC",
        cream: "#FBF7ED",
        "off-white": "#FFFDF8",
        coral: "#E9877B",
        "text-dark": "#20312B",
        "text-muted": "#5B655F",
        border: "#E5DFCF",
      },
      fontFamily: {
        heading: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 4px rgba(6, 76, 59, 0.04)",
        soft: "0 10px 28px rgba(6, 76, 59, 0.10)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      maxWidth: {
        app: "1280px",
      },
    },
  },
  plugins: [],
};
