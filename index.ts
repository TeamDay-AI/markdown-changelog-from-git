import { execSync } from "child_process";
import { mkdirSync, existsSync, writeFileSync } from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Types
interface ChangelogOptions {
  outputDir: string;
  startDate?: string;
  endDate?: string;
  apiKey: string;
  maxCommits?: number;
}

interface Commit {
  hash: string;
  author: string;
  date: string;
  message: string;
  body: string;
  files: string[];
  stats: {
    additions: number;
    deletions: number;
  };
}

// Main function
async function generateChangelog(options: ChangelogOptions): Promise<void> {
  console.log("Generating changelog from git history...");

  // Create output directory if it doesn't exist
  if (!existsSync(options.outputDir)) {
    mkdirSync(options.outputDir, { recursive: true });
  }

  // Create date string for filename
  const dateRange =
    options.startDate && options.endDate
      ? `${options.startDate.replace(/-/g, "")}_to_${options.endDate.replace(
          /-/g,
          ""
        )}`
      : "full_history";

  const outputPath = path.join(options.outputDir, `changelog_${dateRange}.md`);

  // Get git commits
  const commits = getGitCommits(options);
  if (commits.length === 0) {
    console.log("No commits found in the specified date range.");
    return;
  }

  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI(options.apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Generate the changelog content
  const changelogContent = await generateChangelogContent(commits, model);

  // Write to file
  writeFileSync(outputPath, changelogContent);
  console.log(`Changelog generated successfully at ${outputPath}`);
}

function getGitCommits(options: ChangelogOptions): Commit[] {
  // Build git log command with date filters if provided
  let gitCommand = 'git log --pretty=format:"%H|%an|%ad|%s|%b" --date=short';

  if (options.startDate) {
    gitCommand += ` --since="${options.startDate}"`;
  }

  if (options.endDate) {
    gitCommand += ` --until="${options.endDate}"`;
  }

  if (options.maxCommits) {
    gitCommand += ` -n ${options.maxCommits}`;
  }

  try {
    const output = execSync(gitCommand).toString().trim();
    if (!output) return [];

    const commits = output.split("\n").map((line) => {
      const [hash, author, date, message, body] = line.split("|");

      // Get file changes for this commit
      const filesOutput = execSync(`git show --name-only --format="" ${hash}`)
        .toString()
        .trim();
      const files = filesOutput ? filesOutput.split("\n") : [];

      // Get stats for this commit
      const statsOutput = execSync(`git show --numstat --format="" ${hash}`)
        .toString()
        .trim();
      let additions = 0;
      let deletions = 0;

      if (statsOutput) {
        statsOutput.split("\n").forEach((line) => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 2) {
            const add = parseInt(parts[0], 10);
            const del = parseInt(parts[1], 10);
            if (!isNaN(add)) additions += add;
            if (!isNaN(del)) deletions += del;
          }
        });
      }

      return {
        hash,
        author,
        date,
        message,
        body,
        files,
        stats: {
          additions,
          deletions,
        },
      };
    });

    return commits;
  } catch (error: unknown) {
    console.error(
      "Error fetching git commits:",
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}

async function generateChangelogContent(
  commits: Commit[],
  model: any
): Promise<string> {
  const commitData = commits
    .map((commit) => {
      // Format file list with limit if too many files
      const fileList =
        commit.files.length > 20
          ? commit.files.slice(0, 20).join("\n") +
            `\n... and ${commit.files.length - 20} more files`
          : commit.files.join("\n");

      return `Hash: ${commit.hash}
Author: ${commit.author}
Date: ${commit.date}
Message: ${commit.message}
Body: ${commit.body}
Stats: +${commit.stats.additions}/-${commit.stats.deletions} lines
Files Changed (${commit.files.length}):
${fileList}`;
    })
    .join("\n\n");

  const prompt = `
You are creating a customer-focused, marketing-oriented changelog for a software product. Your goal is to transform technical git commits into clear, benefit-focused release notes that highlight value to end-users.

Given the following git commit information, generate a well-formatted markdown changelog that emphasizes user benefits, improvements, and new capabilities.

ANALYSIS INSTRUCTIONS:
1. Analyze the file changes to understand what actual features or improvements were implemented:
   - Look at file extensions to determine change types (.js/.ts for code, .css/.scss for styling, etc.)
   - Use directories/paths to understand which product areas were modified
   - Consider additions/deletions to gauge change scope
   - Use file paths to identify modules, components, or services

2. When analyzing commits, prioritize:
   - User-facing features
   - UI/UX improvements
   - Performance enhancements
   - Bug fixes that impact user experience
   - Security improvements
   - New capabilities or integrations

Git commits:
${commitData}

OUTPUT INSTRUCTIONS:
Create a polished, customer-friendly changelog in markdown format with:

1. An engaging header with the date range and optional version number
2. User-focused categories such as:
   - ✨ New Features
   - 🚀 Improvements
   - 🐛 Bug Fixes
   - 🔒 Security Updates
   - 🏎️ Performance Enhancements
   - 📚 Documentation Updates

3. For each item:
   - Focus on the user benefit, not the technical implementation
   - Use clear, non-technical language whenever possible
   - Highlight specific improvements with measurable impacts when available
   - Maintain a positive, solution-oriented tone
   - Only include commit hashes in a subtle, non-distracting way (or omit entirely for purely customer-facing releases)

4. Additional guidelines:
   - Avoid developer jargon unless necessary
   - Emphasize how changes improve the user experience
   - Maintain a consistent, friendly voice throughout
   - Use bullet points for readability
   - Consider adding a "Coming Soon" section if future plans are mentioned in commits

This changelog should be immediately ready to share with customers and highlight the value of your product updates.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    console.error(
      "Error generating changelog with Gemini:",
      error instanceof Error ? error.message : String(error)
    );
    return `# Changelog Generation Failed\n\nError: ${
      error instanceof Error ? error.message : String(error)
    }\n\n## Raw Commits\n\n${commits
      .map((c) => `* ${c.date} - ${c.message} (${c.hash.substring(0, 7)})`)
      .join("\n")}`;
  }
}

// CLI interface
function parseArguments(): ChangelogOptions {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required.");
  }

  return {
    outputDir: process.env.OUTPUT_DIR || "./changelogs",
    startDate: process.env.START_DATE,
    endDate: process.env.END_DATE,
    apiKey,
    maxCommits: process.env.MAX_COMMITS
      ? parseInt(process.env.MAX_COMMITS, 10)
      : undefined,
  };
}

// Run the script if executed directly
if (import.meta.main) {
  try {
    const options = parseArguments();
    generateChangelog(options).catch((error: unknown) => {
      console.error(
        "Failed to generate changelog:",
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    });
  } catch (error: unknown) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error)
    );
    console.log("\nUsage:");
    console.log(
      "GEMINI_API_KEY=your_api_key [START_DATE=YYYY-MM-DD] [END_DATE=YYYY-MM-DD] [OUTPUT_DIR=./changelogs] [MAX_COMMITS=50] bun run index.ts"
    );
    process.exit(1);
  }
}
