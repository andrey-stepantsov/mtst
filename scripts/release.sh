#!/bin/sh
set -e

# This script automates version bumping, committing, and tagging.
# It ensures the working directory is clean before proceeding.

# Usage via npm:
# npm run release -- <major|minor|patch>

# Check for a clean working directory. `npm version` does this, but we can provide a clearer message.
if ! git diff-index --quiet HEAD --; then
    echo "Error: Working directory is not clean. Please commit or stash your changes." >&2
    exit 1
fi

# Check if a version part is provided
if [ -z "$1" ]; then
    echo "Error: No version part specified." >&2
    echo "Usage: npm run release -- <major|minor|patch>" >&2
    exit 1
fi

VERSION_PART=$1

# Validate the version part
if [ "$VERSION_PART" != "major" ] && [ "$VERSION_PART" != "minor" ] && [ "$VERSION_PART" != "patch" ]; then
    echo "Error: Invalid version part '$VERSION_PART'. Use 'major', 'minor', or 'patch'." >&2
    echo "Usage: npm run release -- <major|minor|patch>" >&2
    exit 1
fi

# Bump the version using npm, which also creates a commit and a tag.
# The commit message format matches your previous version bump commit.
echo "Bumping $VERSION_PART version..."
npm version "$VERSION_PART" -m "chore: bump version to %s"

NEW_VERSION=$(node -p "require('./package.json').version")

echo ""
echo "Version bumped to $NEW_VERSION successfully."
echo "To publish the new version and tag, run:"
echo "git push && git push --tags"
