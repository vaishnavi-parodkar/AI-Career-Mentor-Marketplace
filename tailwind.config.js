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
        "text-muted": "#777C76",
        border: "#E5DFCF",
      },
      fontFamily: {
        heading: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px rgba(6, 76, 59, 0.06)",
        soft: "0 4px 20px rgba(6, 76, 59, 0.08)",
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
