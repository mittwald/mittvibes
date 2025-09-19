# mittvibes CLI - Development Guide

## Project Overview
This is a CLI tool built with TypeScript that generates boilerplate for mittwald extensions. It provides an interactive setup experience with proper TypeScript development workflow.

## Package Management & Dependencies
- **Package Manager**: Use `pnpm` exclusively
- **CLI Framework**: Built with native Node.js and TypeScript, no external CLI framework
- **Interactive Prompts**: Always use `inquirer` for user input
- **Output Styling**: Use `chalk` for colored output (monochrome white/gray theme)
- **File Operations**: Use `fs-extra` for enhanced file system operations
- **Process Management**: Use `execSync` for running shell commands in generated projects

## Code Standards & Architecture
- Always refer to mittwald with lowercase "m"
- Maintain monochrome CLI styling (white on black theme) for weissaufschwarz branding

### Module System
- **ESM Only**: Always use ESM-style imports, never `require()`
- **TypeScript**: All source files in TypeScript with strict typing
- **Import Extensions**: Avoid `.js` extensions in imports, use clean ESM imports
- **Async Patterns**: Prefer `async/await` over Promises or callbacks
- **No Conditional Imports**: Avoid dynamic imports

### TypeScript Development
- **Strict Configuration**: Use strict TypeScript settings with full type checking
- **Interface Definitions**: Define interfaces for configuration objects (e.g., `ProjectConfig`)
- **Type Safety**: All inquirer prompts should be properly typed
- **Error Handling**: Use typed error handling with proper Error types

### Testing Strategy
- **Unit Tests**:
  - Colocated with source files, named `*.test.ts`
  - Focus on CLI logic, file generation, and validation functions
  - Mock file system operations and external commands
- **Integration Tests**: Test complete CLI workflows
- **Error Coverage**: After debugging errors, add tests to prevent regression

### CLI User Experience
- **Interactive Flow**: Guide users through each step with clear prompts
- **Validation**: Validate all user inputs (project names, URLs, etc.)
- **Progress Indicators**: Use `ora` spinners for long-running operations
- **Error Messages**: Provide helpful, actionable error messages
- **Monochrome Theme**: Use only white, gray, and bold white colors

## File Structure & Important Paths

### CLI Structure
```
cli/
├── src/
│   ├── index.ts          # Main CLI entry point
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── templates/        # Template generation logic
├── dist/                 # Compiled JavaScript output
├── package.json          # CLI dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

### Core Files
- `src/index.ts` - Main CLI logic and user interaction flow
- `package.json` - CLI dependencies, scripts, and bin configuration
- `tsconfig.json` - TypeScript compilation settings
- `dist/index.js` - Compiled entry point (generated)

### Development Workflow
- **Development**: Use `pnpm dev` for TypeScript hot reload with `tsx`
- **Building**: Use `pnpm build` to compile TypeScript to JavaScript
- **Testing**: Use `pnpm test` (when tests are added)
- **Git Management**: Don't suggest git commits - handled manually
- **Publishing**: Use `prepublishOnly` script to auto-build before npm publish

### Template Integration
- **Template Path**: Always use relative path to `../templates` directory
- **File Copying**: Use `fs-extra.copy()` for copying template files
- **Dynamic Generation**: Update `package.json` and `.env` files with user-provided values
- **Validation**: Ensure all required template files exist before copying

## Best Practices

### Code Quality
- Maintain clean, readable TypeScript code following established patterns
- Use strict TypeScript with proper type definitions
- Follow consistent naming conventions (camelCase for variables, PascalCase for types)
- Prioritize maintainability and extensibility
- Document complex logic inline when necessary

### CLI Development
- **User-Centric Design**: Always think from the user's perspective
- **Graceful Degradation**: Handle missing dependencies or failed operations gracefully
- **Cross-Platform**: Ensure commands work on macOS, Linux, and Windows
- **Performance**: Keep CLI startup time fast, avoid unnecessary operations

### Template Management
- **Consistency**: Ensure generated projects follow the same patterns as reference
- **Updates**: When updating templates, verify CLI generates valid projects
- **Validation**: Test generated projects can be built and run successfully

### Error Handling
- **Comprehensive Logging**: Use console.error for errors, console.log for info
- **Exit Codes**: Use appropriate exit codes (0 for success, 1 for errors)
- **User Guidance**: Provide actionable error messages with suggested fixes
- **Fallback Options**: Offer manual steps when automated operations fail

## Development Commands

```bash
# Development with hot reload
pnpm dev

# Build for production
pnpm build

# Test production build
pnpm start

# Clean build artifacts
pnpm clean

# Install dependencies
pnpm install

# Link for local testing
npm link
```

## Template Sync
- Keep CLI template generation in sync with `../templates/` directory
- When templates change, update CLI to handle new files/configurations
- Test CLI with updated templates to ensure compatibility
- Maintain backward compatibility when possible