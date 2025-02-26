#!/bin/bash

# Set the path to the team-journal repository
REPO_PATH=~/Documents/Web/teamday

# Create output directory
OUTPUT_DIR="$REPO_PATH/changelogs"
mkdir -p "$OUTPUT_DIR"

# Run the changelog generator
echo "Running changelog generator on $REPO_PATH..."
echo "Output will be saved to $OUTPUT_DIR"

# Change to the repository directory
cd "$REPO_PATH" || { echo "Error: Repository not found at $REPO_PATH"; exit 1; }

# Run the changelog generator executable with the required environment variables
# Use the path to the executable from the current directory
# GEMINI_API_KEY="your_api_key_here" \
OUTPUT_DIR="$OUTPUT_DIR" \
MAX_COMMITS=300 \
~/Documents/Web/markdown-changelog-from-git/changelog-gen

echo ""
echo "Done! Check the changelogs directory for generated files."
