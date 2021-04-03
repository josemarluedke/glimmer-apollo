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
  overrides: [
    {
      plugins: [
        // ['@babel/plugin-transform-destructuring', { loose: true }],
        // ['@babel/plugin-transform-spread', { loose: true }]
      ],
      env: {
        cjs: {
          presets: [['@babel/preset-env', { modules: 'commonjs' }]]
        },
        mjs: {
          presets: [['@babel/preset-env', { modules: false }]]
        }
      }
    }
  ]
};
