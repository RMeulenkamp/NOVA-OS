/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nova: {
          // Core backgrounds — deep purple-black (real NOVA brand)
          bg: '#080827',
          surface: '#0e0e38',
          card: '#12123f',
          border: '#1e1e5a',

          // Primary accent — purple
          accent: '#7b4fe9',
          'accent-soft': '#6b12dd',
          'accent-bright': '#9b6ff9',

          // Energy color — mint/teal
          mint: '#8fffe6',
          'mint-soft': 'rgba(143,255,230,0.12)',
          teal: '#4de8c8',

          // Text
          text: '#e8e8f5',
          'text-bright': '#ffffff',
          muted: '#9898c0',
          dim: '#55557a',

          // Status
          success: '#4de8a0',
          warning: '#f5a623',
          danger: '#ef4444',

          // Glow
          glow: 'rgba(123, 79, 233, 0.18)',
          'mint-glow': 'rgba(143, 255, 230, 0.10)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'nova-gradient': 'linear-gradient(135deg, #080827 0%, #0d0d35 50%, #080827 100%)',
        'card-gradient': 'linear-gradient(135deg, #12123f 0%, #0e0e38 100%)',
        'accent-gradient': 'linear-gradient(135deg, #6b12dd 0%, #7b4fe9 100%)',
        'mint-gradient': 'linear-gradient(135deg, #4de8c8 0%, #8fffe6 100%)',
        'energy-lines': "url('https://d1yei2z3i6k35z.cloudfront.net/15951706/69d693f21f10c3.82209124_NOVA_WEB_GRAPHICS_BACKGROUND_MOBILE6.png')",
        'glow-radial': 'radial-gradient(ellipse at 50% 0%, rgba(123, 79, 233, 0.15) 0%, transparent 70%)',
        'mint-radial': 'radial-gradient(ellipse at 50% 100%, rgba(143, 255, 230, 0.08) 0%, transparent 60%)',
      },
      boxShadow: {
        'nova': '0 0 0 1px rgba(123, 79, 233, 0.12), 0 4px 24px rgba(0, 0, 0, 0.5)',
        'nova-accent': '0 0 24px rgba(123, 79, 233, 0.25)',
        'nova-mint': '0 0 24px rgba(143, 255, 230, 0.15)',
        'nova-sm': '0 2px 8px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
