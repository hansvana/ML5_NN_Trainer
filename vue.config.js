process.env.VUE_APP_VERSION = JSON.stringify(require('./package.json').version);

module.exports = {
  publicPath: '/nntrainer',
  transpileDependencies: ['vuetify'],
  configureWebpack: {
    externals: {
      ml5: 'ml5',
    },
  },
};
