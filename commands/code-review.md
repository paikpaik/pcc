---
description: Review local uncommitted changes, or a GitHub PR (pass a PR number/URL)
argument-hint: [pr-number | pr-url | blank for local review]
---

**Input**: $ARGUMENTS

## Mode selection

If `$ARGUMENTS` contains a PR number or URL → **PR mode**. Otherwise → **Local mode**.

## Local mode

1. Run `git diff --staged` and `git diff`. If both are empty, fall back to `git log --oneline -5` and review the latest commit instead.
2. If there is nothing to review, say so and stop.
3. Delegate the review to the `code-reviewer` subagent, passing it the diff and full context of the changed files.
4. Print the subagent's findings and verdict (APPROVE / WARNING / BLOCK) as-is.

## PR mode

1. `gh pr view <NUMBER> --json number,title,body,author,baseRefName,headRefName,changedFiles`
2. `gh pr diff <NUMBER>`
3. Delegate the review to the `code-reviewer` subagent using that diff plus the full contents of each changed file at the PR head revision.
4. Print the findings and verdict.
5. **Do not post the review to GitHub automatically.** Show the summary and ask before running `gh pr review` — posting a review is a visible action on shared state and needs explicit confirmation each time.

## Edge cases

- No `gh` CLI available → fall back to local-mode review of the current working tree, and say why PR mode was skipped.
- Large diff (>50 changed files) → warn about review scope, prioritize source files over tests/config/docs.
