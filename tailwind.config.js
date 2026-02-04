/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,mdx}",
    "./src/components/**/*.{js,jsx,mdx}",
    "./src/pages/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1E40AF",
          secondary: "#4338CA",
          bg: "#F8FAFC",
          surface: "#FFFFFF",
          text: "#0F172A",
          muted: "#475569",
          accent: "#0EA5E9",
        },
        status: {
          draft: "#CBD5E1",
          scheduled: "#6366F1",
          open: "#16A34A",
          closed: "#DC2626",
        },
      },
    },
  },
  plugins: [],
};