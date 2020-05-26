const InjectPlugin = require('webpack-inject-plugin').default;
const SyncResponse = require('./e2e/mocks/sync_request');

module.exports = function (wpConf, zappConfig, options) {
  if (options.server === 'none') {
    wpConf.plugins.push(
      // TODO: Enhance the developer UX
      new InjectPlugin(function() {
        return `
e2e.addMockedResponse(${JSON.stringify(SyncResponse)});
`;
      })
    );
  }
};
