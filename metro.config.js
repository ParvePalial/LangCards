// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support
  isCSSEnabled: true,
});

// Add support for importing from directories: app, components, etc.
config.resolver.sourceExts.push('mjs');
// Required for loading static resources
config.resolver.assetExts.push('csv');

// Enable require.context for Expo Router
config.transformer.unstable_allowRequireContext = true;

module.exports = config; 