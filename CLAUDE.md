# CLAUDE.md - Agent Instructions

## Build/Run Commands
- Run: `bun run index.ts`
- Test: `bun test`
- Lint: `bun run lint`
- Type check: `bun run typecheck` or `bunx tsc --noEmit`
- Run single test: `bun test <test-file-name>` or `bun test --pattern "<test-name>"`

## Code Style Guidelines
- **Formatting**: Use TypeScript with ESNext features
- **Imports**: Use ES modules; group imports by external/internal/types
- **Types**: Prefer explicit typing; enable strict TypeScript mode
- **Naming**: camelCase for variables/functions, PascalCase for classes/types
- **Error handling**: Use try/catch blocks with meaningful error messages
- **Project purpose**: Generate markdown changelogs from git commit history

## Additional Notes
- Bun runtime used for JavaScript/TypeScript execution
- Project structure follows module-based organization
- No code comments unless complexity warrants explanation
- Return early pattern preferred for error handling
- ESM modules only (specified in package.json)