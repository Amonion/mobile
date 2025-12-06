/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#6E6E6E',
        primaryLight: '#A4A2A2',
        secondary: '#3A3A3A',
        custom: '#DA3986',
        success: '#0cc042',
        darkCustom: '#5B0A31',
        dark: {
          primary: '#BABABA',
          primaryLight: '#848484',
          success: '#0fce48',
          secondary: '#EFEFEF',
          custom: '#DA3986',
        },
      },

      backgroundColor: {
        primary: '#FFFFFF',
        success: '#0cc042',
        border: '#D8D8D8',
        secondary: '#EBEDF4',
        custom: '#DA3986',
        darkCustom: '#5B0A31',
        dark: {
          primary: '#1C1E21',
          secondary: '#121314',
          custom: '#DA3986',
          border: '#404040',
        },
      },

      borderColor: {
        border: '#D8D8D8',
        secondary: '#EBEDF4',
        custom: '#DA3986',
        dark: {
          border: '#404040',
          secondary: '#121314',
          custom: '#DA3986',
        },
      },

      fontFamily: {
        rRegular: ['Roboto-Regular', 'sans-serif'],
        pblack: ['Poppins-Black', 'sans-serif'],
        pbold: ['Poppins-Bold', 'sans-serif'],
        pextrabold: ['Poppins-ExtraBold', 'sans-serif'],
        pextralight: ['Poppins-ExtraLight', 'sans-serif'],
        plight: ['Poppins-Light', 'sans-serif'],
        pmedium: ['Poppins-Medium', 'sans-serif'],
        pregular: ['Poppins-Regular', 'sans-serif'],
        psemibold: ['Poppins-SemiBold', 'sans-serif'],
        pthin: ['Poppins-Thin', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
