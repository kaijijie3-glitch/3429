/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#1E40AF',
        accent: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        surface: '#FFFFFF',
        background: '#F8FAFC',
        'text-primary': '#1E293B',
        'text-secondary': '#64748B',
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
