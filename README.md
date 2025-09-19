# mittvibes

CLI tool to generate boilerplate for Mittwald extensions.

*Powered by weissaufschwarz*

## Installation

```bash
npm install -g mittvibes-cli
# or
pnpm add -g mittvibes-cli
```

Or run directly with npx:
```bash
npx mittvibes-cli
```

## Usage

Run the CLI in your desired directory:

```bash
mittvibes
```

The CLI will guide you through the setup process:

1. **Project Configuration**: Choose project name and directory
2. **Dependency Installation**: Automatically install dependencies with pnpm
3. **Database Setup**: Configure PostgreSQL connection and run migrations
4. **Contributor Setup**: Choose between contributor paths

## Features

### 🚀 Complete Boilerplate
- TanStack Start framework setup
- Prisma ORM with PostgreSQL and field encryption
- Mittwald Extension Bridge integration
- Webhook handling with mitthooks
- Sentry error tracking
- Biome linting and formatting

### 🛠️ Developer Experience
- Interactive CLI
- Automatic dependency installation
- Database migration handling
- Environment configuration
- Pre-configured development scripts

### 📦 Generated Project Structure
```
my-extension/
├── src/
│   ├── components/
│   ├── middlewares/
│   ├── routes/
│   │   └── api/webhooks.mittwald.ts
│   ├── server/functions/
│   ├── env.ts
│   └── db.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── package.json
├── vite.config.ts
└── .env.example
```

## Requirements

### For Running the CLI Tool
- Node.js v20.11.1 or higher

### For Developing the CLI Tool
- Node.js v20.11.1 or higher
- pnpm v10.4.1 or higher

### For Generated Extensions
- **Node.js & pnpm**: Required for running the generated extension projects
- **Database**: PostgreSQL database with non-pooling connection
- **Hosting**: A place to run the generated boilerplate (localhost for development, or hosting service for production)
- **Internet Access**: For webhook configuration and mittwald API communication
- **mittwald Account**: Access to mStudio for extension configuration

## Development

To develop the CLI tool itself:

```bash
git clone <repository>
cd mittvibes
cd cli
pnpm install
pnpm start
```

## Technology Stack

The CLI generates extensions using modern web technologies:

### **Framework & Runtime**
- **TanStack Start** - Full-stack React framework with SSR/SSG support
- **React 19** - Latest React with modern patterns
- **TypeScript** - Strict type safety throughout
- **Vite** - Fast build tool and dev server

### **Database & Backend**
- **Prisma ORM** - Type-safe database access with field encryption
- **PostgreSQL** - Production-ready relational database
- **Server Functions** - TanStack Start server-side functions

### **mittwald Integration**
- **mittwald Extension Bridge** - Authentication and configuration
- **mittwald API Client** - Official API client for mittwald services
- **mitthooks** - Webhook handling library
- **mittwald Flow Components** - Official UI component library

### **Development Tools**
- **Biome** - Fast linting and formatting
- **Vitest** - Modern testing framework
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Server state management
- **Environment Validation** - Runtime environment validation with envalid

### **Additional Features**
- **Field Encryption** - Automatic database field encryption
- **Middleware System** - Authentication and request handling
- **Hot Reload** - Fast development with Vite HMR
- **Development Tools** - Built-in dev tools for debugging

## Local Development & Testing

The CLI is built with TypeScript for better development experience and type safety.

### Development Setup

```bash
# Navigate to the CLI directory
cd cli

# Install dependencies
pnpm install

# Development (TypeScript with hot reload)
pnpm dev

# Build TypeScript to JavaScript
pnpm build

# Run built version
pnpm start
```

### Testing Options

```bash
# Option 1: Direct development execution (TypeScript)
pnpm dev

# Option 2: Build and test production version
pnpm build && node dist/index.js

# Option 3: Create global symlink for testing
npm link
# Now you can run 'mittvibes' from anywhere

# Option 4: Test in a separate directory
mkdir /tmp/test-extension
cd /tmp/test-extension
node /path/to/mittvibes/cli/dist/index.js

# Option 5: Package and install locally
npm pack
npm install -g ./mittvibes-cli-1.0.0.tgz
mittvibes
```

## Contributor Setup

### Existing Contributors
The CLI guides you through:
1. Webhook configuration in mStudio
2. Scope and context setup
3. Anchor configuration (pointing to localhost:5173)
4. First extension installation via API
5. Development server startup

### New Contributors
For users who aren't contributors yet, the CLI provides links to:
- [Become a Contributor Guide](https://developer.mittwald.de/de/docs/v2/contribution/how-to/become-contributor/)
- Extension development documentation
- API documentation

## Support

- CLI Issues: Report in this repository
- Mittwald Extension Development: [Developer Documentation](https://developer.mittwald.de/docs/v2/contribution/)
- API Reference: [Mittwald API Docs](https://api.mittwald.de/v2/docs/)

---

*Made with ⚡ by weissaufschwarz*