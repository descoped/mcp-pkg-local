# Release Process

## Creating a New Release

1. **Update version** in `package.json` to match your release version
2. **Commit and push** changes to `master`
3. Go to [GitHub Releases](https://github.com/descoped/mcp-pkg-local/releases/new)
4. Click **"Draft a new release"**

## Release Configuration

### Tag Format
- **Stable**: `v0.1.0`, `v1.2.3`
- **Beta**: `v0.1.0-beta`, `v0.1.0-beta.1`

### Fill in Release Details
- **Tag**: Create new tag on publish (e.g., `v0.1.0`)
- **Target**: `master` branch
- **Title**: Version number (e.g., "v0.1.0" or "v0.1.0-beta")
- **Release Notes**: Describe changes, features, and fixes

### Publish
- Click **"Publish release"**
- GitHub Actions will automatically:
  - Run tests
  - Build the package
  - Publish to npm registry
  - Beta tags publish to `npm install @descoped/mcp-pkg-local@beta`
  - Stable tags publish to `npm install @descoped/mcp-pkg-local`

## Prerequisites
- `NPM_TOKEN` secret configured in repository settings
- Version in `package.json` matches tag version