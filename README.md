# mittvibes

CLI tool to generate boilerplate for mittwald mStudio extensions.

*Powered by weissaufschwarz*

## Installation

```bash
npm install -g @mittwald/mittvibes
# or
pnpm add -g @mittwald/mittvibes
# or run directly
npx @mittwald/mittvibes
```

## Usage

### First Time Setup

Authenticate with mittwald:

```bash
mittvibes auth:login
```

This opens your browser for OAuth authentication (uses port 52847 for callback).

### Creating Extensions

Run the CLI in your desired directory:

```bash
mittvibes
```

The CLI guides you through:

1. **Organization Selection** - Choose your mittwald organization
2. **Contributor Check** - Automatically verify contributor status
3. **Interest Submission** - Submit contributor interest if needed (via API)
4. **Extension Context** - Choose organization-level or project-level extensions
5. **Project Selection** - Select specific project for project-level extensions
6. **Project Setup** - Choose name and directory
7. **Dependencies** - Automatically install with pnpm
8. **Database Setup** - Configure PostgreSQL and run migrations
9. **Extension Config** - Set up credentials with auto-generated secrets

## Features

- **Complete Boilerplate** - TanStack Start, Prisma ORM with field encryption, mittwald Extension Bridge, mitthooks, Biome linting
- **OAuth Authentication** - Secure PKCE-based authentication
- **Organization Management** - Select organizations, automatic contributor verification and interest submission
- **Extension Context** - Choose organization-level or project-level extensions
- **Auto-Configuration** - Auto-generated secrets, dependency installation, database migrations, environment setup
- **Interactive CLI** - Step-by-step guided setup with visual indicators

## CLI Commands

```bash
# Authentication
mittvibes auth:login    # Authenticate with mittwald OAuth
mittvibes auth:logout   # Clear authentication tokens
mittvibes auth:status   # Check authentication status

# Project Creation
mittvibes              # Create new extension project (default)
mittvibes init         # Explicit project initialization

# Help
mittvibes help         # Show available commands
```

## Requirements

**For Using the CLI:**
- Node.js v18.0.0+
- mittwald account with access to organizations
- Port 52847 available for OAuth callback

**For Generating Extensions:**
- Organization with contributor status

---

## Development

### Setup

```bash
git clone <repository>
cd mittvibes/cli
pnpm install
```

### Commands

```bash
pnpm dev        # TypeScript with hot reload
pnpm build      # Compile to JavaScript
pnpm start      # Run built version
```

### Testing

```bash
# Development mode
pnpm dev

# Build and test
pnpm build && pnpm start

# Global symlink
pnpm link --global
mittvibes  # Available globally

# Test in temp directory
mkdir /tmp/test-extension && cd /tmp/test-extension
node /path/to/mittvibes/cli/dist/index.js
```

## Technology Stack

**Framework & Runtime:**
TanStack Start, React 19, TypeScript, Vite

**Database & Backend:**
Prisma ORM with field encryption, PostgreSQL, Server Functions

**mittwald Integration:**
Extension Bridge, API Client, mitthooks, Flow Components

**Development Tools:**
Biome, Vitest, TanStack Router, TanStack Query, Environment Validation

## Contributor Management

The CLI automatically detects contributor status for your organizations. If you're not a contributor yet, it will submit an interest request via API.

**Resources:**
- [Become a Contributor](https://developer.mittwald.de/de/docs/v2/contribution/how-to/become-contributor/)
- [Extension Development Docs](https://developer.mittwald.de/docs/v2/contribution/)
- [API Reference](https://api.mittwald.de/v2/docs/)

## Troubleshooting

**Port 52847 in use:**
```bash
lsof -i :52847  # Check what's using the port
```

**Authentication issues:**
```bash
mittvibes auth:logout && mittvibes auth:login  # Clear and retry
mittvibes auth:status  # Check status
```

**Organization access:**
Ensure you have the necessary permissions for the mittwald organization

## Support

- CLI Issues: Report in this repository
- mittwald Extension Development: [Developer Documentation](https://developer.mittwald.de/docs/v2/contribution/)
- API Reference: [mittwald API Docs](https://api.mittwald.de/v2/docs/)

---

*Made with ⚡ by weissaufschwarz*
