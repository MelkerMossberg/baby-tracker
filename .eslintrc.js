module.exports = {
  extends: ['expo', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Add any project-specific rules here
  },
  ignorePatterns: ['node_modules/', 'ios/', 'android/', '.expo/'],
};