const path = require('path');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = function (wpConf, zappConfig) {
	wpConf.plugins.push(
		new WorkboxPlugin.InjectManifest({
			// importWorkboxFrom: 'local',
			swSrc: path.resolve(process.cwd(), 'src', 'serviceworker', 'main.js'),
			swDest: 'contacts-sw.js'
		})
	);
	/* wpConf.devServer.proxy['/zx/zimlet/com_zextras_theme_default/'] = {
		target: 'http://localhost:9001',
		pathRewrite: { '^/zx/zimlet/com_zextras_theme_default/': '/' }
	}; */
};
