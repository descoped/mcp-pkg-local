# chalk Overview

## 📦 Package Information
name: chalk
version: 4.1.2
type: Terminal string styling done right
main: source
license: MIT
package_manager: npm
type_system: dynamically typed
type_annotations: available

## 🔧 Configuration
build_system: npm

commands:
  - test: xo && nyc ava && tsd
  - bench: matcha benchmark.js

## 🏗️ Core Components

### 1. ChalkClass
purpose: Class implementation
visibility: private

## 🔌 Exports
named_exports:
  - Level
  - Options
  - Instance
  - ColorSupport
  - ChalkFunction
  - Chalk
  - supportsColor
  - stderr
  - stringReplaceAll
  - stringEncaseCRLFWithFirstIndex

## 🔗 Dependencies
  - ansi-styles: ^4.1.0
  - supports-color: ^7.1.0

### Development Dependencies
  - ava: ^2.4.0
  - coveralls: ^3.0.7
  - execa: ^4.0.0
  - import-fresh: ^3.1.0
  - matcha: ^0.7.0
  - nyc: ^15.0.0
  - resolve-from: ^5.0.0
  - tsd: ^0.7.4
  - xo: ^0.28.2
