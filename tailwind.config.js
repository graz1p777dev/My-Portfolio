/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class', // ← это критично
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: { extend: {} },
  plugins: [],
};

export default config;
