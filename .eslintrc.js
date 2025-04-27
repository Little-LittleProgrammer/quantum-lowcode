module.exports = {
    root: true,
    // This tells ESLint to load the config from the package `eslint-config-custom`
    extends: require.resolve('@quantum-design-configs/eslint/eslint-base.js'),
    ignorePatterns: ['*.json', '*.yaml', '*.md']
};
