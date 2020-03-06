module.exports = {
  env: {
    browser: true,
    es6: true
  },
  "ignorePatterns": [
    "node_modules/",
    "dist/bundle.js"
  ],
  extends: [
    'plugin:react/recommended',
    'standard-jsx',
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    'react'
  ],
  rules: {
    "react/prop-types": "off"
  }
}
