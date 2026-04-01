/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#000000',
        card: '#ffffff',
        'card-foreground': '#000000',
        popover: '#ffffff',
        'popover-foreground': '#000000',
        primary: '#000000',
        'primary-foreground': '#ffffff',
        secondary: '#f4f4f5',
        'secondary-foreground': '#000000',
        muted: '#f4f4f5',
        'muted-foreground': '#71717a',
        accent: '#f4f4f5',
        'accent-foreground': '#000000',
        destructive: '#7f1d1d',
        'destructive-foreground': '#fef2f2',
        border: '#e4e4e7',
        input: '#e4e4e7',
        ring: '#18181b',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
