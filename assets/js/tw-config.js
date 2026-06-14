/* Tailwind Play CDN config - бренд «Штурман».
   Подключается СРАЗУ после <script src="https://cdn.tailwindcss.com">. */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        orange:   { DEFAULT: '#FF4D14', 600: '#E63F0C', 700: '#C23308', 300: '#FF8A5C', 100: '#FFE3D6' },
        ink:      { DEFAULT: '#0E0E11', 2: '#15151A', 3: '#1E1E25', 4: '#272730' },
        cream:    { DEFAULT: '#F4F1EA', dim: '#B8B4AB', faint: '#7E7B74' },
        paper:    { DEFAULT: '#F5F4F1', 2: '#FFFFFF', 3: '#ECEAE4' },
        inktext:  { DEFAULT: '#121216', dim: '#5C5C66', faint: '#8A8A93' },
        line:     { light: '#E6E4DF', dark: '#2A2A33' },
        drift: '#FF5A1F', circuit: '#2E8BFF', rally: '#19B36B', moto: '#B26BFF',
      },
      fontFamily: {
        display: ['"Russo One"', 'system-ui', 'sans-serif'],
        head:    ['Manrope', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xs: '8px', sm: '12px', DEFAULT: '16px', lg: '22px', xl: '28px', '2xl': '34px' },
      maxWidth: { content: '1240px' },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(20,20,30,.18)',
        card: '0 6px 24px -10px rgba(20,20,30,.16)',
        glow: '0 14px 50px -10px rgba(255,77,20,.45)',
      },
      letterSpacing: { tightish: '-0.02em', tighter2: '-0.035em' },
    },
  },
};
