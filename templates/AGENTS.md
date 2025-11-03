# mittwald Extension - Development Guide

## Project Overview
This is a mittwald extension project using React components and API integration with the mittwald platform.

## Critical Development Rules (NEVER VIOLATE THESE)

### UI Components - ABSOLUTE REQUIREMENTS
- always refer to mittwald with lowercase "m"
- **NEVER use raw HTML elements** (`<div>`, `<span>`, `<p>`, `<h1-6>`, `<button>`, etc.)
- **ONLY import from `@mittwald/flow-remote-react-components`** - never use `@mittwald/flow-react-components`
- Flow component documentation uses `@mittwald/flow-react-components` but `@mittwald/flow-remote-react-components` exports exactly the same functionality but explicitly for mittwald extensions
- **Use semantic React components** for all UI: `Content` instead of `<div>`, `Text` instead of `<p>`, `Heading` instead of `<h1>`, `Button` instead of `<button>`
- **Flow components change frequently** - always verify current APIs via context7

### API Integration - MANDATORY PATTERNS
- **All mittwald API calls MUST be server-side** using `createServerFn()`
- **Never make API calls from client components**
- **Always use `context.contextId`** - never hardcode organization/project IDs
- **Use `@mittwald/api-client` package's `MittwaldAPIV2Client.newWithToken()`**
- **Always call `assertStatus()` after API calls** for proper type inference

### Documentation Access Rules
- **NEVER guess or invent URLs** - always follow links systematically
- **Start with known URLs** and use WebFetch to discover navigation
- **Use Context7** with proper library IDs:
  - `/websites/developer_mittwald_de-v2` for API docs
  - `/websites/mittwald_github_io_flow` for Flow components

## Documentation Resources

### 1. Extension Core Concepts & Contribution Guide
- **URL**: https://developer.mittwald.de/docs/v2/contribution/
- **Covers**: Architecture, lifecycle, integration points, webhooks
- **Key concepts**: Extensions are independent web apps rendered inside of the mStudio similar to Shopify's Remote DOM, mStudio notifies via webhooks

### 2. REST API Documentation
- **Access**: Use context7 with library-id `/websites/developer_mittwald_de-v2`
- **Covers**: API endpoints, authentication, request/response schemas
- **Usage**: Specify topic for targeted results (e.g., "user", "project", "organization")

### 3. Flow UI Components
- **Browse**: https://mittwald.github.io/flow/03-components/
- **Context7**: Use library-id `/websites/mittwald_github_io_flow`
- **Critical**: Documentation shows standard package imports, but you MUST use remote package

## Essential Patterns

### Server-Side API Call Pattern
```typescript
import { MittwaldAPIV2Client, assertStatus } from "@mittwald/api-client";
import { getAccessToken } from "@mittwald/ext-bridge/node";

const { publicToken: accessToken } = await getAccessToken(
    context.sessionToken,
    env.EXTENSION_SECRET,
);

const client = await MittwaldAPIV2Client.newWithToken(accessToken);
const result = await client.user.getUser({ userId });
assertStatus(result, 200);
```

### Flow Components Usage
```typescript
import { Content, Text, Heading, Button } from "@mittwald/flow-remote-react-components";

// CORRECT
<Content>
    <Heading>Title</Heading>
    <Text>Description</Text>
    <Button>Action</Button>
</Content>

// WRONG - Never do this
<div>
    <h1>Title</h1>
    <p>Description</p>
    <button>Action</button>
</div>
```

### Typed Lists Pattern
```typescript
import { typedList } from "@mittwald/flow-remote-react-components";

interface Item { id: string; name: string; }
const ItemList = typedList<Item>();

<ItemList.List aria-label="Items">
    <ItemList.StaticData data={items} />
    <ItemList.Item>
        {(item) => (
            <ItemList.ItemView>
                <Heading>{item.name}</Heading>
            </ItemList.ItemView>
        )}
    </ItemList.Item>
</ItemList.List>
```

## Available Anchor Points
Reference: https://developer.mittwald.de/docs/v2/contribution/reference/frontend-fragment-anchors/
- Anchor points are configured by the user via the mStudio UI

## Development Standards

### Package Management
- **Use `pnpm` exclusively**
- **ESM imports only** - no `require()` or `.js` extensions
- **Avoid dynamic imports** - use static imports

### Code Quality
- **TypeScript strict mode** with proper type definitions, use zod for parsing unknown data
- **Comprehensive error handling** with try-catch blocks
- **Environment variables** via `env.ts`. The `.env` file exists but is not accessible - assume it exists or ask user to verify
- **Async/await patterns** preferred over Promises

### Testing Strategy
- **Colocated unit tests** named `*.test.ts`
- Only for complex logic, keep short and focused
- **Mock only when necessary** (fetch calls, DB calls, slow operations)
- **Add test coverage** after debugging errors, add tests to prevent regression

When providing guidance or code examples, first analyze the request against these critical rules to ensure compliance. Wrap your analysis in <analysis> tags inside your thinking block, systematically checking:

1. **UI Components Check**: Does this request involve UI elements? If so, list the specific Flow remote components that will be needed and verify none use raw HTML.

2. **API Integration Check**: Does this involve mittwald API calls? If so, confirm server-side implementation with createServerFn() and identify which API endpoints are needed.

3. **Context Usage Check**: Does this involve accessing mittwald resources? If so, confirm use of context.contextId rather than hardcoded IDs.

4. **Documentation Lookup Check**: Do I need to verify current component APIs or patterns? If so, identify which context7 library IDs or documentation URLs I need to access.

5. **Architecture Pattern Check**: Which essential patterns (server-side API, Flow components, typed lists, etc.) apply to this request?

6. **Code Standards Check**: Note any TypeScript, ESM import, or error handling requirements.

Then provide your guidance and code examples. Your final response should focus on answering the user's question and should not duplicate or rehash the compliance analysis work you did in the thinking block.
