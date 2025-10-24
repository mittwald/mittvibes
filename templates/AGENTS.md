# mittwald Extension - Development Guide

## Project Overview
This is a mittwald extension project using React components and API integration with the mittwald platform.

## Important Commands

- `pnpm dev`: run dev server

### After changing prisma schema
1. `pnpm db:generate`
2. `pnpm db:push`

## Documentation Resources

mittwald extension development relies on three primary documentation sources. Each serves a distinct purpose in the development workflow:

### 1. Extension Core Concepts & Contribution Guide

**What it covers:**
- How extensions work (architecture, lifecycle, integration points)
- Extension lifecycle methods and webhook notifications
- Integration with mStudio platform
- Contribution requirements and process
- Monetization and support guidelines

**When to use:**
- Understanding extension architecture and how they connect to mStudio
- Learning about lifecycle events and webhook handling
- Planning contribution and release process
- Understanding requirements for becoming a contributor

**Access:**
- **URL**: https://developer.mittwald.de/docs/v2/contribution/
- Browse directly or fetch specific topics via WebFetch

**Key Concepts:**
- Extensions are independent web applications with public backends
- mStudio notifies extensions via webhooks for instance creation/deletion
- Extensions connect via REST APIs with OAuth authentication
- 80% revenue share for monetized extensions

### 2. REST API Documentation

**What it covers:**
- Available mittwald API endpoints
- Request parameters and response types
- Authentication methods
- Type-safe API client usage

**When to use:**
- Implementing server-side API calls
- Discovering available endpoints and their capabilities
- Understanding request/response schemas
- Troubleshooting API integration issues

**Access:**
- **Context7**: Use `mcp__context7__get-library-docs` with library-id: `/websites/developer_mittwald_de-v2`
- Specify topic for targeted results (e.g., "user", "project", "organization")
- Provides up-to-date endpoint documentation and type definitions

### 3. Flow UI Components

**What it covers:**
- React component APIs and props
- Component composition patterns
- Usage examples and best practices
- Component categories (layout, forms, data display, etc.)

**When to use:**
- Building extension UI
- Finding appropriate components for specific use cases
- Understanding component props and behavior
- Learning composition patterns

**Access:**
- **Browse**: https://mittwald.github.io/flow/03-components/ for component overview
- **Context7**: Use `mcp__context7__get-library-docs` with library-id: `/websites/mittwald_github_io_flow`
- Specify topic for targeted results (e.g., "Button", "LabeledValue", "List")
- **Critical**: Always use `@mittwald/flow-remote-react-components` package (see UI Components section below)

**Remember**: Flow components change frequently - always verify current API via Context7 for accurate, up-to-date information.

### Other Resources

- Tanstack Start: use context7
- Prisma: use context7

## Working with Documentation - CRITICAL RULES

### NEVER Guess or Invent URLs
**CRITICAL**: Never invent, guess, or construct URLs based on assumptions about documentation structure.

### Always Follow Links Systematically
When looking for documentation:

1. **Start with Known URLs**: Begin with verified working URLs:
   - Main contribution guide: `https://developer.mittwald.de/docs/v2/contribution/`
   - Flow components: `https://mittwald.github.io/flow/03-components/`

2. **Extract Navigation**: Use WebFetch to get the actual links on a page:
   ```
   WebFetch with prompt: "List all links and navigation items on this page. What are the main sections and their URLs?"
   ```

3. **Follow the Trail**: Navigate through the documentation structure using the links you found:
   - Start at a known page
   - Ask for links on that page
   - Follow those links to find what you need
   - Never skip ahead to "guessed" URLs

4. **Verify Before Using**: If a URL returns 404, stop and re-trace your steps from a known working URL

### Example: Finding Anchor Points Documentation

❌ **WRONG**: Guessing `https://developer.mittwald.de/docs/v2/reference/extensions/frontend-anchors`

✅ **CORRECT**:
1. Start at `https://developer.mittwald.de/docs/v2/contribution/`
2. WebFetch to find links → discover `/docs/v2/category/reference/`
3. WebFetch that page to find links → discover `/docs/v2/contribution/reference/frontend-fragment-anchors/`
4. Use the actual discovered URL

### Reference: Available Anchor Points

Documentation URL: `https://developer.mittwald.de/docs/v2/contribution/reference/frontend-fragment-anchors/`

**Organization/Customer Level:**
- `/customers/customer/menu/section/extensions/item` - Menu entry in organization (access: `customerId`)

**Project Level:**
- `/projects/project/menu/section/extensions/item` - Menu entry in project overview (access: `projectId`)
- `/projects/project/apps/detail/menu-top/item` - Tab in app detail views (access: `projectId`, `appInstallationId`)
- `/projects/project/email/addresses/detail/menu-top/item` - Tab in email config (access: `projectId`, `emailAddressId`)
- `/projects/project/domain/domains/detail/menu-top/item` - Tab in domain management (access: `projectId`, `ingressId`)
- `/projects/project/container/containers/detail/menu-top/item` - Tab in container detail (access: `projectId`, `containerId`)
- `/projects/project/backups/detail/menu-top/item` - Tab in backup detail (access: `projectId`, `backupId`)

**Required Properties**: All anchors need SVG icon and localized title object (currently "de" only)

## Package Management & Dependencies
- **Package Manager**: Use `pnpm` exclusively
- **API Client**: Always use `@mittwald/api-client` package's `MittwaldAPIV2Client.newWithToken()` for Mittwald API calls
- **UI Components**: ALWAYS use `@mittwald/flow-remote-react-components` instead of standard HTML elements
  - **CRITICAL**: Never use raw HTML elements (`<div>`, `<span>`, `<p>`, `<h1-6>`, `<button>`, etc.)
  - **CRITICAL**: ONLY import from `@mittwald/flow-remote-react-components` - never mix with `@mittwald/flow-react-components`
  - **Library Status**: Flow is in active development and changes frequently (sometimes daily). Always verify current APIs via Context7 (library-id: /websites/developer_mittwald_de-v2).

  ### Understanding Flow Packages
  Two packages exist, but **ONLY use the remote package**:
  - `@mittwald/flow-react-components` - Standard package (used in documentation examples)
  - `@mittwald/flow-remote-react-components` - **USE THIS** (for mittwald extensions)

  **Rule**: What's documented for the standard package works in the remote package - just change the import source.

  ### Component Philosophy
  - **Compositional**: Build UIs by composing semantic React components, not HTML primitives
  - **Semantic**: Components convey meaning and structure (e.g., `Header`, `Section`, `Content`)
  - **Examples**: Use `Content` instead of `<div>`, `Text` instead of `<p>`, `Heading` instead of `<h1>`, `Button` instead of `<button>`

  ### Working with Lists
  - **Pattern**: Use `typedList<T>()` factory function for type-safe lists
  - **Import**: `import { typedList } from "@mittwald/flow-remote-react-components"`
  - **Basic Structure**:
    ```tsx
    interface Item { id: string; name: string; }
    const ItemList = typedList<Item>();

    <ItemList.List aria-label="Items">
      <ItemList.StaticData data={items} />
      <ItemList.Item>
        {(item) => (
          <ItemList.ItemView>
            <Heading>{item.name}</Heading>
            {/* Additional content */}
          </ItemList.ItemView>
        )}
      </ItemList.Item>
    </ItemList.List>
    ```
  - **Documentation**: Query Context7 with `/websites/mittwald_github_io_flow` and topic "List" for current API

  ### Finding & Using Components
  1. **Browse Flow Documentation**: https://mittwald.github.io/flow/03-components/
     - Explore component categories and usage patterns
     - Note: Examples show `@mittwald/flow-react-components` imports

  2. **Get Current API via Context7**:
     - Use `mcp__context7__get-library-docs` with library ID `/websites/mittwald_github_io_flow`
     - Specify topic (e.g., "Button", "LabeledValue", "List") for targeted results
     - Provides up-to-date component APIs, props, and usage patterns

  3. **Apply Import Rule**: Replace package name in examples
     - Documentation shows: `import { Component } from "@mittwald/flow-react-components"`
     - You use: `import { Component } from "@mittwald/flow-remote-react-components"`

  4. **Verify if Needed**: Check `node_modules/@mittwald/flow-remote-react-components/dist/types` for exports

  **Remember**: Flow components change frequently - always verify current API via Context7 rather than relying on static documentation

## API Integration

### Server-Side API Calls
- **CRITICAL**: All mittwald API calls MUST be made on the server side using `createServerFn()`
- Never make API calls directly from client components
- Always use the session token from context for authentication

### Context Management & Context-ID
- **CRITICAL**: The `context.contextId` is provided by mittwald and determines the scope in which your extension operates
- **Context Types**: The context-id can be either:
  - **Organization-ID**: When the extension is operating in an organization context
  - **Project-ID**: When the extension is operating in a project context
- **Importance**: This ID is fundamental for understanding which resource scope your extension is working with
- Always retrieve the context-id from the mittwald context object, never hardcode it

**Best Practices**:
- Always use `context.contextId` from the mittwald context
- Never assume or hardcode organization/project IDs
- The context-id determines which resources your extension has access to

### Authentication & Client Setup
- **Token Exchange**: Use `getAccessToken()` to exchange session token for access token
- **Client Creation**: Use `@mittwald/api-client` package's `MittwaldAPIV2Client.newWithToken()`
- **Type Safety**: Always use `assertStatus()` after API calls for proper type inference

### Making API Calls - Complete Pattern

```typescript
import { MittwaldAPIV2Client, assertStatus } from "@mittwald/api-client";
import { getAccessToken } from "@mittwald/ext-bridge/node";

try {
    // Exchange session token for accessToken
    const { publicToken: accessToken } = await getAccessToken(
        context.sessionToken,
        env.EXTENSION_SECRET,
    );

    // Instantiate client
    const client = await MittwaldAPIV2Client.newWithToken(
        accessToken,
    );

    // Make API call to mittwald API
    const user = await client.user.getUser({
        userId,
    });

    // IMPORTANT: Must be done for type inference to work correctly
    assertStatus(user, 200);

    return user;
} catch(error) {
    console.error(error);
    // Handle error appropriately (return error response, throw, etc.)
}
```

### Error Handling
- Always wrap API calls in try-catch blocks
- Log errors for debugging
- Return appropriate error responses to the client
- Consider different status codes and handle them appropriately

### Documentation Reference
- **Latest API Documentation**: Always reference context7 (library-id: /websites/developer_mittwald_de-v2) for the most up-to-date mittwald API documentation
- Use context7 (library-id: /websites/developer_mittwald_de-v2) to find available endpoints, parameters, and response types

## Code Standards & Architecture
- always refer to mittwald with lowercase "m"

### Module System
- **ESM Only**: Always use ESM-style imports, never `require()`
- **Import Extensions**: Avoid `.js` extensions in imports, use clean ESM imports
- **Async Patterns**: Prefer `async/await` over Promises or callbacks
- **No Conditional Imports**: Avoid dynamic imports like `const { fetchResourceData } = await import("../../api-client")`

### Environment & Configuration
- **Environment Variables**: Access via `[env.ts]` - all variables are set in process.env
- **Configuration**: The `.env` file exists but is not accessible - assume it exists or ask user to verify

### Testing Strategy
- **Unit Tests**:
  - Colocated with source files, named `*.test.ts`
  - Only for complex logic, keep short and focused
  - Mock only when absolutely necessary (fetch calls, DB calls, slow operations)
- **Error Coverage**: After debugging errors, add tests to prevent regression

### Validation & Data Handling
- **Schema Validation**: Check if Zod is viable for validation needs
- **Error Handling**: Implement comprehensive error handling with appropriate logging

## File Structure & Important Paths

### Core Files
- `[package.json]` - Project dependencies and scripts
- `@env.ts` - Environment variable definitions and access
- **Ignored Files**: Don't consider files in `.gitignore`, except for `tasks/**`

### Development Workflow
- **Git Management**: Don't suggest git commits - handled manually
- **Debugging Process**: Always add test coverage after resolving bugs

## Best Practices
- Maintain clean, readable code following established patterns
- Use TypeScript strictly with proper type definitions
- Follow the existing project structure and naming conventions
- Prioritize performance and maintainability
- Document complex logic inline when necessary
