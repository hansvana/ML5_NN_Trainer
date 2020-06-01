module.exports = {
  publicPath: '/nntrainer',
  transpileDependencies: ['vuetify'],
  configureWebpack: {
    externals: {
      ml5: 'ml5',
    },
  },
};
