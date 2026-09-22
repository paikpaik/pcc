# TypeScript/JavaScript Security

## Secret Management

```typescript
// NEVER
const apiKey = "sk-proj-xxxxx"

// ALWAYS
const apiKey = process.env.API_KEY
if (!apiKey) {
  throw new Error("API_KEY not configured")
}
```

## Common Vulnerabilities

- **SQL injection** — use parameterized queries, never string-concatenate user input into a query.
- **XSS** — never render unescaped user input into HTML/JSX. Sanitize with a library (e.g. DOMPurify) if raw HTML is unavoidable.
- **Path traversal** — never build a filesystem path from user input without validating/normalizing it first.
- **Insecure dependencies** — check `npm audit` output before adding a new dependency to a security-sensitive path.

## Review

Run `/code-review` before merging security-sensitive changes (auth, payments, user input handling) — the `code-reviewer` agent treats these as CRITICAL-severity findings.
