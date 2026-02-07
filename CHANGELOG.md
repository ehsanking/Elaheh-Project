# Changelog

All notable changes to Project Elaheh will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-07

### 🎯 Major Focus: Iran Accessibility & Stability

This release specifically addresses issues faced by users in Iran and other regions with restricted internet access.

### Added
- `.npmrc` configuration file for automatic use of Iran-accessible npm mirrors
- `build-release.sh` script for automated and standardized release building
- New npm script `npm run release` for easy release package creation
- Fallback mechanisms for CDN loading failures
- Enhanced error logging in installation script
- Multiple download methods (curl/wget) with retry logic in installer
- GitHub mirror fallback for release downloads

### Changed
- **CRITICAL:** Replaced `https://esm.sh` with `https://cdn.jsdelivr.net` for ES module imports
- **CRITICAL:** Replaced Google Fonts CDN with jsDelivr-hosted Vazirmatn font
- **CRITICAL:** Replaced Tailwind CSS CDN with accessible alternatives
- Improved `loadServerConfig()` with proper error handling and fallback
- Enhanced installer with multiple download source attempts
- Updated version numbering from 1.0.9 to 1.1.0 across all files
- Improved timeout and retry configurations for network operations

### Fixed
- **CRITICAL:** Fixed blank/white page issue when accessing panel from Iran
- Fixed installer failures due to blocked GitHub API in sanctioned regions
- Fixed application crashes when `server-config.json` is missing
- Fixed font loading failures in restricted networks
- Fixed module import failures due to blocked CDNs

### Technical Details

#### CDN Replacements
```
Before (Blocked in Iran):
- fonts.googleapis.com
- fonts.gstatic.com  
- cdn.tailwindcss.com
- esm.sh

After (Accessible):
- cdn.jsdelivr.net/gh/rastikerdar/vazirmatn
- cdn.jsdelivr.net/npm/tailwindcss
- cdn.jsdelivr.net/npm/@angular/*
- cdn.jsdelivr.net/npm/rxjs
```

#### NPM Registry Configuration
```
Primary: https://registry.npmmirror.com/
Fallback: https://registry.npm.taobao.org/
Default: https://registry.npmjs.org/
```

#### Installer Improvements
- Added 3 methods for fetching release URLs
- Added dual download methods (curl + wget)
- Added connection timeout (30s) and retry logic (3 attempts)
- Added fallback to specific version if latest detection fails

### Security
- No security vulnerabilities addressed in this release
- All CDN changes maintain HTTPS/TLS encryption
- No changes to authentication or authorization mechanisms

### Performance
- Improved initial load time by reducing external dependencies
- Better caching strategies for static assets
- Reduced network round-trips with consolidated CDN sources

### Breaking Changes
- None. This release is fully backward compatible with 1.0.x

### Migration Guide
**For existing installations:**
1. No manual migration needed
2. Run the install script again to update: `bash <(curl -Ls https://raw.githubusercontent.com/ehsanking/Elaheh-Project/main/install.sh)`

**For developers:**
1. Pull latest changes
2. Run `npm install` to update dependencies
3. Use `npm run release` to build new packages

### Known Issues
- None at this time

### Contributors
- EHSANKiNG (@ehsanking) - Lead Developer

---

## [1.0.9] - 2026-01-XX

### Previous Release
- Pre-compiled panel distribution
- Initial installer script
- Basic Iran server support
- Core tunneling functionality

For older releases, see the [releases page](https://github.com/ehsanking/Elaheh-Project/releases).

---

## Versioning Scheme

- **Major (X.0.0):** Breaking changes, major new features
- **Minor (1.X.0):** New features, significant improvements (backward compatible)
- **Patch (1.1.X):** Bug fixes, minor improvements

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/ehsanking/Elaheh-Project/issues
- Pull Requests: https://github.com/ehsanking/Elaheh-Project/pulls
