# mittwald Extension - Development Guide

## Project Overview
This is a mittwald extension project using React components and API integration with the mittwald platform.

## Package Management & Dependencies
- **Package Manager**: Use `pnpm` exclusively
- **API Client**: Always use `@mittwald/api-client` package's `MittwaldAPIV2Client.newWithToken()` for Mittwald API calls
- **UI Components**: ALWAYS use `@mittwald/flow-remote-react-components` instead of standard HTML elements
  - **CRITICAL**: Never use raw HTML elements (`<div>`, `<span>`, `<p>`, `<h1-6>`, `<button>`, etc.)
  - **Library Status**: Flow is in active development and changes frequently (sometimes daily). Always verify current APIs and components via Context7.

  ### Core Component Mappings
  - Use `Content` instead of `<div>`
  - Use `Text` instead of `<p>`, `<span>`
  - Use `Heading` instead of `<h1>`, `<h2>`, etc.
  - Use `Button` instead of `<button>`
  - Use `Section` for vertical content organization with automatic spacing/separators

  ### Component Philosophy
  - **Compositional**: Build UIs by composing semantic React components, not HTML primitives
  - **Semantic**: Components convey meaning and structure (e.g., `Header`, `Section`, `Content`)

  ### Component Categories
  Flow organizes components into semantic categories:
  - **Structure**: `Section`, `ColumnLayout`, `Flex`, `LayoutCard`, `Accordion`, `Table`, `List`, `Separator`
  - **Content**: `Text`, `Heading`, `Label`, `LabeledValue`, `Icon`, `Image`, `Avatar`, `CodeBlock`, `Markdown`, `Skeleton`
  - **Actions**: `Button`, `ActionGroup`, `Link`, `ContextMenu`
  - **Form Controls**: `TextField`, `TextArea`, `NumberField`, `Select`, `Checkbox`, `Radio`, `Switch`, `DatePicker`, `Slider`, `FileField`, `MarkdownEditor`
  - **Navigation**: Navigation components, tabs, breadcrumbs
  - **Overlays**: Modals, popovers, tooltips, dialogs
  - **Status**: Status indicators, badges, alerts

  ### UI Patterns
  Flow provides documented patterns for common layouts:
  - **Dashboard**: Presenting information in organized sections on a single surface
  - **Setup/Onboarding**: Multi-step flows for user onboarding
  - **Structural Layouts**: Page structure, content organization, spacing systems

  ### Finding Component Information
  - **Primary Source**: Use Context7 to find current component APIs, props, and usage patterns
  - **Documentation**: https://mittwald.github.io/flow/03-components/
  - **Remember**: Documentation may be outdated due to rapid development - Context7 has the latest information

## API Integration

### Server-Side API Calls
- **CRITICAL**: All mittwald API calls MUST be made on the server side using `createServerFn()`
- Never make API calls directly from client components
- Always use the session token from context for authentication

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
- **Latest API Documentation**: Always reference context7 for the most up-to-date mittwald API documentation
- Use context7 to find available endpoints, parameters, and response types

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
