# TypeScript/JavaScript Testing

## Framework

Use whatever the project already uses (Vitest or Jest are the common defaults for new projects). Don't introduce a second test runner into a project that already has one.

## Structure — Arrange/Act/Assert

```typescript
test("returns empty array when no items match", () => {
  // Arrange
  const items = [{ active: false }]

  // Act
  const result = filterActive(items)

  // Assert
  expect(result).toEqual([])
})
```

## Naming

Test names describe the observable behavior, not the implementation:

```typescript
test("throws when API key is missing") // GOOD
test("test1") // BAD
```

## What to Cover

- New code paths get a test in the same PR that introduces them.
- Prioritize the failure/edge case over the happy path — the happy path is usually the least likely place a bug hides.
- Don't chase 100% coverage on trivial glue code (simple re-exports, type-only files).
