module.exports = {
  // mode: 'jit',
  purge: ['./index.html', './src/**/*.js,ts,gjs,gts'],
  darkMode: false,
  theme: {
    extend: {}
  },
  variants: {
    extend: {
      height: ['last'],
      margin: ['last']
    }
  },
  plugins: []
};
