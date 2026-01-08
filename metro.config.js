const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for Windows: disable features that cause 'node:' prefixed directory issues
config.resolver.unstable_enablePackageExports = false;
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;
