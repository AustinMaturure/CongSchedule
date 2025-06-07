/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1f1f1f",
        lightwhite: "#FBFAF8",
        lightblue: "#80a0d6",
        lightorang: "#FFD166",
        lightyellow:"#faf0ca8d",
        honeydew: "#CFDECA",
      },
    },
  },
  plugins: [],
};
