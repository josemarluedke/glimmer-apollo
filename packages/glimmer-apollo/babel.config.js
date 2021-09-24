module.exports = {
  plugins: [
    ['@babel/plugin-transform-typescript'],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties']
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ],
  assumptions: {
    // For legacy decorator support with class fields to work
    setPublicClassFields: true
  }
};
