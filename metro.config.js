const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add resolver for detect-node-es issues
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // Handle detect-node-es resolution
    if (moduleName === 'detect-node-es') {
      return {
        filePath: require.resolve('detect-node-es/es5/browser.js'),
        type: 'sourceFile',
      };
    }

    // Call the default resolver
    return context.resolveRequest(context, moduleName, platform);
  },
  blockList: [
    /node_modules\/.*\/esm\/.*\.js$/, // Block ESM versions
  ],
};

// Add transformer options
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;