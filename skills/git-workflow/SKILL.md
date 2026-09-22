---
name: git-workflow
description: Git conventions for commit messages, merge vs rebase, conflict resolution, and undoing mistakes. Use when writing a commit message, deciding whether to merge or rebase, resolving a conflict, or cleaning up branches.
---

# Git Workflow

## When to Use

- Writing a commit message or PR description
- Deciding merge vs. rebase
- Resolving a merge/rebase conflict
- Undoing a commit or cleaning up branches
- Cutting a release tag

## How It Works

### Commit Messages — Conventional Commits

```
<type>(<scope>): <subject>

[optional body — explain why, not what]
```

| Type | Use for |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change that isn't a feature or fix |
| `test` | Adding/updating tests |
| `chore` | Maintenance (deps, config) |
| `perf` | Performance improvement |

```
# BAD: no context
git commit -m "fixed stuff"

# GOOD: specific, explains why
git commit -m "fix(api): retry on 503 — upstream flakes during peak hours"
```

### Merge vs. Rebase

- **Rebase** your local feature branch onto `main` before opening/updating a PR — keeps history linear. Safe because the branch is still local-only or yours alone.
- **Merge** (not rebase) once a branch has been pushed and anyone/anything else may have based work on it — rewriting shared history breaks other people's clones.
- Never rebase `main` or any branch you've already opened a PR from and someone reviewed — force-pushing invalidates their review context. If you must, say so explicitly before pushing.

```bash
# Update a local-only feature branch with the latest main
git fetch origin
git rebase origin/main
git push --force-with-lease origin feature/x   # only if you're the sole contributor
```

### Conflict Resolution

```bash
git status                    # see conflicted files
# edit file, resolve <<<<<<< ======= >>>>>>> markers
git add <file>
git rebase --continue          # or: git commit, if this was a merge
```

Shortcuts when one side is simply correct:
```bash
git checkout --ours  <file>   # keep current branch's version
git checkout --theirs <file>  # keep incoming version
```

### Undoing Mistakes

| Situation | Command |
|---|---|
| Undo last commit, keep changes staged | `git reset --soft HEAD~1` |
| Undo last commit, discard changes | `git reset --hard HEAD~1` (only if unpushed) |
| Undo a commit already pushed/shared | `git revert HEAD` |
| Fix the last commit message | `git commit --amend -m "..."` |
| Add a forgotten file to the last commit | `git add <file> && git commit --amend --no-edit` |

### Branch Cleanup

```bash
git branch --merged main | grep -v '^\*\|main' | xargs -n1 git branch -d
git fetch -p   # prune remote-tracking refs for branches deleted on the remote
```

## Examples

**Branch naming**: `feature/short-name`, `fix/short-name`, `hotfix/short-name`.

**PR description (adjust to the change's actual size)**:
```markdown
## What
## Why
## Testing
```

**Anti-patterns to avoid**: committing directly to `main` without a branch, vague commit messages ("update", "fix", "wip" with no context), committing `.env`/secrets, force-pushing a branch someone else has already pulled.
