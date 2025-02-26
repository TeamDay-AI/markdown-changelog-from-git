# markdown-changelog-from-git

A tool that automatically transforms your git history into beautifully formatted, customer-focused changelogs that highlight the real value of your product updates. Powered by Google's Gemini 2.0 Flash AI.

## Features

- Extract commit history from a git repository
- Analyze file changes, additions, and deletions for better context
- Generate customer-focused changelogs that emphasize user benefits
- Create marketing-friendly release notes with emojis and engaging categories
- Highlight user-facing features and measurable improvements
- Transform technical commits into value-focused updates
- Filter commits by date range and limit processing

## Installation

```bash
bun install
```

## Usage

### Option 1: Using the Executable

After building with `bun run build`, you can run the executable directly:

```bash
GEMINI_API_KEY=your_api_key [OPTIONS] ./changelog-gen
```

### Option 2: Using Bun

Run the tool with the following environment variables:

```bash
GEMINI_API_KEY=your_api_key [OPTIONS] bun run index.ts
```

### Required Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key (required)

### Optional Environment Variables

- `START_DATE`: Filter commits starting from this date (format: YYYY-MM-DD)
- `END_DATE`: Filter commits until this date (format: YYYY-MM-DD)
- `OUTPUT_DIR`: Directory to save generated changelogs (default: "./changelogs")
- `MAX_COMMITS`: Maximum number of commits to process

### Example

```bash
GEMINI_API_KEY=your_api_key START_DATE=2023-01-01 END_DATE=2023-12-31 OUTPUT_DIR=./docs/changelogs MAX_COMMITS=100 ./changelog-gen
```

### Using the Convenience Script

For the team-journal repository, you can use the provided script:

1. Edit `run-on-team-journal.sh` to add your Gemini API key
2. Make the script executable: `chmod +x run-on-team-journal.sh`
3. Run it: `./run-on-team-journal.sh`

This will generate changelogs for the team-journal repository in `~/Documents/Web/team-journal/changelogs/`.

## How it Works

1. The tool extracts detailed commit information using git commands
2. For each commit, it collects:
   - Basic commit data (hash, author, date, message)
   - List of all changed files
   - Statistics on additions and deletions
3. This comprehensive data is sent to Google's Gemini 1.5 Flash model
4. The AI transforms technical details into customer benefits:
   - Analyzes file paths to identify user-facing features
   - Converts technical changes into benefit statements
   - Groups updates into engaging categories with emoji icons
   - Uses marketing-friendly language to highlight improvements
   - Maintains focus on user value, not technical implementation
5. The polished, customer-ready changelog is saved as a Markdown file

## Development

This project was created using `bun init` in bun v1.2.3. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
