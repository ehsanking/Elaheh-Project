#!/bin/bash

# Project Elaheh - Release Builder
# Version 1.1.0
# This script builds a production-ready release package

set -e  # Exit on error

# Colors for output
GREEN='\033[1;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
VERSION="1.1.0"
RELEASE_NAME="panel-v${VERSION}"
BUILD_DIR="dist"
RELEASE_DIR="release"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Project Elaheh Release Builder${NC}"
echo -e "${CYAN}  Version: ${VERSION}${NC}"
echo -e "${CYAN}========================================${NC}\n"

# Clean previous builds
echo -e "${YELLOW}[1/6]${NC} Cleaning previous builds..."
rm -rf "$BUILD_DIR" "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

# Install dependencies (using Iran-friendly registry)
echo -e "${YELLOW}[2/6]${NC} Installing dependencies..."
if [ -f ".npmrc" ]; then
    echo "  → Using .npmrc configuration for Iran-friendly registry"
fi
npm install --loglevel=error

# Build the project
echo -e "${YELLOW}[3/6]${NC} Building project for production..."
npm run build -- --configuration production

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}Error: Build directory not found!${NC}"
    exit 1
fi

# Create assets directory in build
echo -e "${YELLOW}[4/6]${NC} Preparing release structure..."
mkdir -p "$BUILD_DIR/assets"

# Create a sample server-config.json template
cat > "$BUILD_DIR/assets/server-config.json.template" <<EOF
{
  "role": "iran",
  "domain": "YOUR_DOMAIN_HERE",
  "installedAt": "AUTO_GENERATED"
}
EOF

# Copy essential files
echo -e "${YELLOW}[5/6]${NC} Copying essential files..."
cp -r "$BUILD_DIR"/* "$RELEASE_DIR/"
cp README.md "$RELEASE_DIR/" 2>/dev/null || echo "  → README.md not found, skipping"
cp LICENSE "$RELEASE_DIR/" 2>/dev/null || echo "  → LICENSE not found, skipping"

# Create installation notes
cat > "$RELEASE_DIR/INSTALL.txt" <<EOF
Project Elaheh v${VERSION} - Installation Instructions
========================================================

AUTOMATIC INSTALLATION (Recommended):
-------------------------------------
Run this command on your server:

bash <(curl -Ls https://raw.githubusercontent.com/ehsanking/Elaheh-Project/main/install.sh)


MANUAL INSTALLATION:
--------------------
1. Extract this archive to /opt/elaheh-project
2. Configure Nginx to serve files from that directory
3. Create assets/server-config.json based on the template
4. Set up SSL certificate (Let's Encrypt or self-signed)
5. Open firewall ports: 80, 443

For detailed instructions, see README.md

Default Credentials:
  Username: admin
  Password: admin

Support: https://github.com/ehsanking/Elaheh-Project/issues
EOF

# Create release archive
echo -e "${YELLOW}[6/6]${NC} Creating release package..."
cd "$RELEASE_DIR"
zip -q -r "../${RELEASE_NAME}.zip" ./*
cd ..

# Calculate size
RELEASE_SIZE=$(du -h "${RELEASE_NAME}.zip" | cut -f1)

# Cleanup
rm -rf "$RELEASE_DIR"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Release built successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "  Package: ${CYAN}${RELEASE_NAME}.zip${NC}"
echo -e "  Size: ${CYAN}${RELEASE_SIZE}${NC}"
echo -e "  Location: ${CYAN}$(pwd)/${RELEASE_NAME}.zip${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Test the release locally"
echo -e "  2. Create a GitHub release"
echo -e "  3. Upload ${RELEASE_NAME}.zip as a release asset"
echo -e "  4. Update the release notes\n"

echo -e "${GREEN}Done!${NC}"
