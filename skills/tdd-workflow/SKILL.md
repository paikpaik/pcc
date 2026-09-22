---
name: tdd-workflow
description: Test-driven development workflow — RED/GREEN/REFACTOR cycle. Use when starting a new feature, fixing a bug, or refactoring, so tests stay the source of truth for behavior.
---

# TDD Workflow

## When to Use

- Starting a new feature or fixing a bug
- Refactoring existing code and wanting a safety net for it
- Any change where "did this break something else" is a real risk

## How It Works

### 1. Detect the test runner first

Don't assume `npm test`. Check `package.json` `scripts.test` (Jest, Vitest, or Bun's native
`bun:test`) for TypeScript/JavaScript, or `pyproject.toml`/`pytest.ini` for Python. Use
whatever the project already runs — don't introduce a second runner mid-task.

### 2. RED — write a failing test first

Describe the behavior as a test before writing the implementation. Run it and confirm it
fails for the *intended* reason (missing implementation), not a typo or broken import.

```typescript
test("returns empty array when no items match", () => {
  expect(filterActive([{ active: false }])).toEqual([])
})
```

```python
def test_returns_empty_when_no_items_match():
    assert filter_active([{"active": False}]) == []
```

A test that was written but never actually executed doesn't count as RED — always run it
and read the failure before touching implementation code.

### 3. GREEN — minimal implementation

Write just enough code to make the test pass. Resist building more than the test currently
demands — that's the next test's job.

### 4. REFACTOR — clean up with the safety net on

Remove duplication, improve naming, simplify. Rerun the tests after every change; they must
stay green throughout.

### 5. Repeat per behavior

One RED → GREEN → REFACTOR cycle per behavior, not one giant cycle for the whole feature.
Smaller cycles surface problems earlier and are easier to back out of individually.

## Testing Principles

- Test user-visible behavior, not internal state or implementation details.
- Name the test after the behavior, not the mechanism ("throws when API key is missing", not "test3").
- Prioritize the failure/edge case over the happy path — the `code-reviewer` agent already
  flags new code paths with no test coverage, so pair with it rather than duplicating its checklist here.
- Keep unit tests fast and isolated — no real network/disk I/O; mock external services at the boundary.

## Examples

**Test isolation** — each test should set up its own data, not depend on execution order:

```typescript
// WRONG — second test silently depends on the first having run
test("creates user", () => { /* ... */ })
test("updates same user", () => { /* assumes previous test's user still exists */ })

// CORRECT — each test is independent
test("creates user", () => {
  const user = makeTestUser()
  // ...
})
test("updates user", () => {
  const user = makeTestUser()
  // ...
})
```

**Selector stability in browser tests** — prefer semantic selectors over brittle CSS classes:

```typescript
// WRONG — breaks on any style refactor
await page.click(".css-x8f2a")

// CORRECT — resilient to markup/style changes
await page.click('button:has-text("Submit")')
```
