module.exports = function (wpConf, zappConfig, options) {
    wpConf.output.publicPath = options.watch ? `/` : `/zx/zmlet/${zappConfig.pkgName}/`;
    wpConf.output.chunkFilename = options.watch ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
    wpConf.externals['@zextras/zapp-shell'] = '__ZAPP_SHARED_LIBRARIES__[\'@zextras/zapp-shell\']';
};
