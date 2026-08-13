# GitHub Workflows - CI/CD Pipeline

This document describes the automated testing pipeline for the Exercise Tracker application.

## Overview

The project uses GitHub Actions to automatically run tests on every pull request. Both backend and frontend tests must pass before a PR can be merged to the main branch.

**Workflow File:** `.github/workflows/ci.yml`

## Workflow Behavior

### Trigger Events

The CI workflow runs automatically when:
- A pull request is created targeting the `main` branch
- New commits are pushed to an existing pull request
- A pull request is ready for review

### Test Jobs

#### 1. Backend Tests
- **Name:** `backend-tests`
- **Location:** `backend-rest/`
- **Node Version:** 20
- **Command:** `npm test`
- **Runs:** Unit and integration tests
- **Expected Output:** 15 tests passing

#### 2. Frontend Tests
- **Name:** `frontend-tests`
- **Location:** `frontend-react/`
- **Node Version:** 20
- **Command:** `npm test -- --run`
- **Runs:** Component and utility tests
- **Expected Output:** 29 tests passing

#### 3. All Tests Passed Check
- **Name:** `all-tests-passed`
- **Depends On:** Both backend and frontend test jobs
- **Requires:** Both jobs must complete successfully
- **Failure:** Blocks PR merge if any tests fail

### Workflow Status

The workflow status appears in the pull request as:
- 🟡 **Pending:** Tests are running
- ✅ **Success:** All tests passed - PR can be merged
- ❌ **Failed:** Tests failed - PR cannot be merged until fixed

## Branch Protection Rules

To enforce this workflow, the following branch protection rules are configured on the `main` branch:

### Required Settings (via GitHub Web UI)

1. **Require status checks to pass before merging**
   - ✅ Require branches to be up to date before merging
   - ✅ Require status checks:
     - `backend-tests`
     - `frontend-tests`
     - `all-tests-passed`

2. **Require pull request reviews before merging**
   - Require at least 1 approval (optional)

3. **Require code reviews from code owners** (optional)
   - Can add CODEOWNERS file

4. **Require branches to be up to date before merging**
   - Ensures no conflicting changes

## How to Work with Branches

### For All Team Members

**DO NOT commit directly to main.**

All changes must go through pull requests with passing tests.

### Creating a Feature Branch

```bash
# Update main to latest
git checkout main
git pull origin main

# Create feature branch (use descriptive names)
git checkout -b feature/add-user-auth
git checkout -b fix/validation-bug
git checkout -b refactor/api-structure
```

### Before Creating a PR

1. **Run tests locally first:**
   ```bash
   # Backend tests
   cd backend-rest
   npm test

   # Frontend tests (in another terminal)
   cd frontend-react
   npm test
   ```

2. **Commit your changes:**
   ```bash
   git add <files>
   git commit -m "Feature description (without 'Phase X' reference)"
   ```

3. **Push to remote:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Creating a Pull Request

1. Visit https://github.com/rwnewsom/mern-capstone
2. Click "New Pull Request"
3. Select:
   - Base: `main`
   - Compare: `your-feature-branch`
4. Add PR title and description:
   ```
   Title: Brief summary of changes
   
   Description:
   - What changed
   - Why it changed
   - Any important notes
   ```
5. Click "Create Pull Request"

### PR Workflow

```
1. Create PR
   ↓
2. GitHub Actions runs tests automatically
   ↓
3. Backend tests execute (5s-30s)
   ├─ Run: npm test
   ├─ Expected: 15 tests pass
   └─ Status: ✅ or ❌
   ↓
4. Frontend tests execute (10s-45s)
   ├─ Run: npm test --run
   ├─ Expected: 29 tests pass
   └─ Status: ✅ or ❌
   ↓
5. All Tests Passed Check
   ├─ If any failed: ❌ PR blocked
   └─ If all passed: ✅ PR ready to merge
   ↓
6. Merge PR to main
   (only if all tests pass)
```

## Test Failures

### If Tests Fail in PR

**Status:** ❌ `Pull request checks failed`

**Fix Steps:**

1. **Identify failing tests:**
   - Click "Details" on the failing check
   - Review the test output
   - Find which tests failed

2. **Fix the code locally:**
   ```bash
   # Check out your branch
   git checkout feature/your-branch
   
   # Run tests locally to debug
   npm test
   
   # Fix the issues
   # (edit files, run tests again)
   ```

3. **Commit and push the fix:**
   ```bash
   git add <fixed-files>
   git commit -m "Fix: test failures in validation"
   git push origin feature/your-branch
   ```

4. **Workflow runs automatically again**
   - GitHub Actions re-runs all tests
   - If tests pass: ✅ PR is ready
   - If tests still fail: ❌ Repeat steps above

### Common Test Failures

**Backend Tests (15 tests)**
- Validation tests: Check input constraints
- Endpoint tests: Check HTTP responses
- Error handling: Check error codes

**Frontend Tests (29 tests)**
- Toast component: Check notifications
- ErrorBoundary: Check error handling
- API utilities: Check error conversion
- Constants: Check valid values

## Viewing Test Results

### In Pull Request

1. Scroll to "Checks" section
2. Click on failed job to expand
3. Click "Details" to see full output
4. Look for:
   - ✔ Passed tests (green)
   - ✖ Failed tests (red)
   - Error messages and stack traces

### In GitHub Actions Tab

1. Visit https://github.com/rwnewsom/mern-capstone/actions
2. Find your PR's workflow run
3. Click to view logs
4. Each job logs are separate:
   - `backend-tests` logs
   - `frontend-tests` logs
   - `all-tests-passed` summary

## Local Testing Before PR

**Always run tests locally before pushing:**

```bash
# Backend
cd backend-rest
npm test

# Frontend (in another terminal)
cd frontend-react
npm test

# Both should show:
# ✔ All tests passing
# ✔ No failures
# ✔ No skipped tests
```

If tests fail locally, fix them before pushing.

## Workflow Performance

**Typical Execution Times:**

- Backend tests: 5-30 seconds
- Frontend tests: 10-45 seconds
- Total: 30-90 seconds
- Status available: Within 2 minutes of push

**Factors that affect timing:**
- First run (dependencies install): Slower
- Cached run (dependencies cached): Faster
- Test complexity: More tests = longer
- GitHub Actions load: Can vary

## Troubleshooting

### "Workflow fails but tests pass locally"

**Possible causes:**
- Node version mismatch (CI uses Node 20)
- Missing dependencies
- Cache issues

**Solution:**
```bash
# Clear cache locally
rm -rf node_modules package-lock.json

# Reinstall
npm ci

# Run tests
npm test
```

### "PR can't be merged despite passing tests"

**Check:**
1. Are branch protection rules enabled?
2. Are all status checks enabled?
3. Do you have write access?
4. Is the branch up to date with main?

**Solution:**
```bash
# Update your branch with latest main
git fetch origin
git merge origin/main
npm test
git push origin feature/your-branch
```

### "I need to merge without tests"

**DO NOT DO THIS.** Disabling tests defeats the purpose of the CI pipeline.

Instead:
1. Fix the failing tests
2. Push the fix
3. Wait for tests to pass
4. Then merge

## Future Enhancements

Potential additions to the workflow:

- Code coverage reporting
- Linting checks (ESLint)
- Security scanning (npm audit)
- Build verification (Docker build)
- Performance benchmarks
- Integration tests with database

## For Repository Admins

### Enabling Branch Protection

1. Go to Settings → Branches
2. Select "main" branch
3. Click "Add rule"
4. Configure:
   ```
   ✅ Require a pull request before merging
   ✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   ✅ Include administrators
   ```
5. Select required status checks:
   - `backend-tests`
   - `frontend-tests`
   - `all-tests-passed`
6. Save changes

### Monitoring Workflow Performance

1. Visit GitHub Actions tab
2. Review workflow run times
3. Check for patterns (slow runs, frequent failures)
4. Optimize if needed:
   - Cache improvements
   - Test optimization
   - Dependency updates

### Updating the Workflow

Edit `.github/workflows/ci.yml` to:
- Change Node version
- Add new test suites
- Add linting or security checks
- Modify trigger events

**Changes to the workflow file itself do NOT require approval** — they take effect on the next PR.

---

## Summary

✅ **Automated testing on every PR**
✅ **Both backend (15 tests) and frontend (29 tests) must pass**
✅ **Direct commits to main are prevented**
✅ **Clear feedback on test failures**
✅ **Easy to debug and fix issues**

All changes now go through quality gates before merging!
