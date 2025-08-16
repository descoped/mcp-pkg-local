# minimist Overview

## 📦 Package Information
name: minimist
version: 1.2.8
type: parse argument options
main: index.js
license: MIT
package_manager: npm
type_system: dynamically typed

## 🔧 Configuration
build_system: npm

commands:
  - prepack: npmignore --auto --commentLines=auto
  - prepublishOnly: safe-publish-latest
  - prepublish: not-in-publish || npm run prepublishOnly
  - lint: eslint --ext=js,mjs .
  - pretest: npm run lint
  - tests-only: nyc tape 'test/**/*.js'
  - test: npm run tests-only
  - posttest: aud --production
  - version: auto-changelog && git add CHANGELOG.md
  - postversion: auto-changelog && git add CHANGELOG.md && git commit --no-edit --amend && git tag -f "v$(node -e "console.log(require('./package.json').version)")"

## 🏗️ Core Components

## 🔌 Exports
