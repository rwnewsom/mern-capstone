# Contributing to Exercise Tracker

Thank you for contributing to the Exercise Tracker application! This guide explains how to work with the project and get your changes merged.

## Quick Start

1. **Fork or branch the repository**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes**
   - Follow the coding conventions in [CLAUDE.md](./CLAUDE.md)
   - Keep commits focused and descriptive

3. **Test locally**
   ```bash
   # Backend tests
   cd backend-rest && npm test

   # Frontend tests
   cd frontend-react && npm test
   ```

4. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature
   ```

5. **Wait for CI checks**
   - GitHub Actions runs automatically
   - All tests must pass
   - Review feedback if tests fail

6. **Merge**
   - Once all checks pass, merge the PR to main

## Important Rules

### ✋ Branch Protection

- **No direct commits to main**
- All changes must go through pull requests
- All tests must pass before merging
- Keep main stable and deployable

### 📝 Commit Messages

Write clear, descriptive commit messages:

**Good:**
```
Fix validation bug in exercise creation

Previously, negative reps were accepted due to missing 
validation check. Added proper validation to prevent invalid data.
```

**Bad:**
```
fix bug
updated code
work in progress
```

**Format:**
```
Brief one-line summary (50 chars max)

Detailed explanation of what changed and why (if needed).
Keep to 72 chars per line for readability.
```

**Note:** Don't include "Phase X" references in commit messages — those belong in PR descriptions and documentation, not git history.

### ✅ Testing Requirements

**Before Creating a PR:**

1. Run all tests locally
2. Fix any failing tests
3. Verify all tests pass
4. Only then push

**Test Commands:**

```bash
# Backend (165 tests)
cd backend-rest
npm test

# Frontend (29 tests)
cd frontend-react
npm test

# Both should show: "X passed" with no failures
```

**GitHub Actions will:**
- Run all tests automatically
- Show results in the PR
- Block merge if any tests fail

### 📦 Dependencies

**Adding a new dependency:**

1. Use `npm install` in the appropriate directory
2. Commit both `package.json` and `package-lock.json`
3. Explain the dependency in your PR description

**Removing a dependency:**

1. Use `npm uninstall`
2. Verify tests still pass
3. Explain why removal is needed

## Code Style

### JavaScript
- Use `const` by default, `let` if reassignment needed
- Use arrow functions for callbacks
- Use async/await for promises
- No `var` — use `const` or `let`

### Naming
- Functions: `camelCase` (getExercises, validateInput)
- Constants: `UPPER_SNAKE_CASE` (VALID_UNITS, ERROR_RESPONSES)
- Components: `PascalCase` (Toast, ErrorBoundary)
- Files: `kebab-case` or `PascalCase.jsx`

### Comments
- Minimal comments — code should be self-documenting
- Only comment non-obvious "why" (workarounds, constraints)
- No commented-out code

## File Organization

```
backend-rest/
├── *.mjs              # Main files
├── test/              # Test files
└── package.json

frontend-react/
├── src/
│   ├── components/    # Reusable components
│   ├── pages/         # Route pages
│   ├── utils/         # Utility functions
│   ├── test/          # Test files
│   └── constants.js   # App constants
└── package.json
```

## Making Different Types of Changes

### Adding a Feature

1. Create branch: `feature/feature-name`
2. Implement feature
3. Add tests for feature
4. Run `npm test` to verify
5. Create PR with description of new feature

### Fixing a Bug

1. Create branch: `fix/bug-description`
2. Write a test that reproduces the bug (should fail)
3. Fix the bug (test should now pass)
4. Run `npm test` to verify all tests pass
5. Create PR explaining the bug and fix

### Refactoring Code

1. Create branch: `refactor/what-improved`
2. Make the refactoring changes
3. Ensure tests still pass (100%)
4. Don't change functionality, only structure
5. Create PR explaining why refactoring helps

### Updating Documentation

1. Create branch: `docs/what-changed`
2. Update `.md` files, comments, etc.
3. No tests needed for doc changes
4. Create PR with description of documentation update

## Pull Request Checklist

Before requesting review:

- [ ] Tests run locally and pass (npm test)
- [ ] No console errors or warnings
- [ ] Commit message is clear
- [ ] No unnecessary dependencies added
- [ ] Code follows style conventions
- [ ] Documentation updated if needed
- [ ] No direct commits to main

## Handling Test Failures

**If GitHub Actions fails:**

1. Click "Details" on the failed check
2. Review the test output
3. Identify which tests failed
4. Reproduce locally: `npm test`
5. Fix the issue
6. Commit and push the fix
7. Workflow runs automatically again

**Don't push workarounds or disable tests.** Always fix the root cause.

## Code Review

When submitting a PR:

- Be open to feedback
- Respond to comments promptly
- Request changes if you disagree
- Re-review after updates

When reviewing others' PRs:

- Be constructive and kind
- Ask questions if unclear
- Approve when tests pass and code is good

## Common Workflows

### Syncing with Main

If main has new commits while you're working:

```bash
git fetch origin
git merge origin/main
npm test
git push origin feature/your-branch
```

### Updating a PR

After feedback:

```bash
# Make changes
git add .
git commit -m "Address feedback: ..."
git push origin feature/your-branch
# Workflow runs automatically again
```

### Abandoning a Branch

If you no longer need the branch:

```bash
git branch -D feature/abandoned
git push origin --delete feature/abandoned
```

## Questions?

- Check [CLAUDE.md](./CLAUDE.md) for technical architecture
- Check [GITHUB_WORKFLOW.md](./GITHUB_WORKFLOW.md) for CI/CD details
- Review existing code for patterns and conventions
- Look at recent PRs to see accepted practices

## Summary

✅ Never commit directly to main
✅ Always run tests locally first
✅ Write clear commit messages
✅ Wait for GitHub Actions to pass
✅ Be open to code review feedback
✅ Keep commits focused and meaningful

Happy contributing! 🚀
