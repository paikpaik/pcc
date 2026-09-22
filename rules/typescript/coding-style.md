# TypeScript/JavaScript Coding Style

## Types

- Add parameter and return types to exported functions and shared utilities. Let TypeScript infer obvious local variable types.
- Avoid `any` in application code. Use `unknown` for external/untrusted input and narrow it before use.
- Use `interface` for object shapes that may be extended; use `type` for unions, intersections, and mapped types.

```typescript
// WRONG
function getErrorMessage(error: any) {
  return error.message
}

// CORRECT
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Unexpected error"
}
```

## Immutability

Prefer spread/`map`/`filter` over in-place mutation.

```typescript
// WRONG
function updateUser(user: User, name: string): User {
  user.name = name // mutation
  return user
}

// CORRECT
function updateUser(user: Readonly<User>, name: string): User {
  return { ...user, name }
}
```

## Error Handling

- Use `async`/`await` with `try`/`catch`; narrow `unknown` errors before using them.
- Never swallow an error silently — log it or rethrow with context.
- Don't leak internal error details (stack traces, DB errors) into client-facing responses.

## Input Validation

Validate external input (API bodies, query params, env vars) at the boundary with a schema library (e.g. Zod) rather than ad-hoc `if` checks scattered through the code.

## Debug Output

No `console.log` left in committed code — use a real logger, or remove it before committing.
