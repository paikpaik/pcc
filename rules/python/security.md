# Python Security

## Secret Management

```python
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ["OPENAI_API_KEY"]  # raises KeyError if missing — fail loud, not silent
```

## Common Vulnerabilities

- **SQL injection** — use parameterized queries (`cursor.execute(query, params)`), never f-string/`.format()` a query.
- **Shell injection** — never build a shell command with f-strings from user input; use `subprocess.run([...])` with a list of args, not `shell=True`.
- **Requests without a timeout** — every `requests`/`httpx` call to an external service needs an explicit `timeout=`.
- **Pickle/eval on untrusted input** — never `pickle.load`/`eval` data that came from a user or an external service.

## Scanning

`bandit -r src/` for static security analysis before merging security-sensitive changes.

## Review

Run `/code-review` before merging security-sensitive changes (auth, payments, external input handling) — the `code-reviewer` agent treats these as CRITICAL-severity findings.
