/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs", // EJS templates in the views folder
    "./routes/**/*.js", // JavaScript files in the routes folder
    "./*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
