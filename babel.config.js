module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // MUST be first, before class-properties
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // Required for WatermelonDB decorators (@field, @date, etc.)
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      // Path aliases
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};