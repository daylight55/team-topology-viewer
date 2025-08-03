/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'stream-aligned': '#3B82F6', // blue
        'platform': '#10B981', // green
        'enabling': '#F59E0B', // amber
        'complicated-subsystem': '#8B5CF6', // violet
      },
    },
  },
  plugins: [],
}