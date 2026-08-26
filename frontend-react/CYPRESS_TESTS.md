# Cypress E2E Tests

End-to-end regression tests for the Exercise Tracker frontend.

## Setup

Cypress is already installed as a dev dependency. No additional setup required.

## Running Tests

### Interactive Mode (Recommended for Development)

```bash
npm run cypress:open
```

This opens the Cypress UI where you can:

- See all test files
- Run individual tests
- Watch tests run in real-time
- Inspect elements and debug

### Headless Mode (CI/CD)

```bash
npm run cypress:run
```

Runs all tests in headless mode and generates test reports.

### Run Specific Test

```bash
npx cypress run --spec "cypress/e2e/auth-flow.cy.js"
```

## Test Structure

### `cypress/support/e2e.js`

Global test helpers and commands:

- `cy.login(email, password)` — Login to existing account
- `cy.register(email, username, password)` — Register and auto-login
- `cy.verifyLoggedIn(username)` — Assert user is logged in
- `cy.verifyLoggedOut()` — Assert user is logged out

### `cypress/e2e/auth-flow.cy.js`

UI-specific authentication tests (API/backend tested separately):

**Registration Form Validation:**
- ✅ Invalid username validation (length, special characters)
- ✅ Password mismatch detection

**Login Form Validation:**
- ✅ Invalid credentials handling
- ✅ Invalid email format detection

**Navigation & Routing:**
- ✅ Login/signup buttons visible when not authenticated
- ✅ Unauthenticated users redirected to login
- ✅ Form toggle (login ↔ signup)
- ✅ Form error clearing on toggle

**Note:** Registration/login success, logout, auth persistence, and localStorage are tested in backend tests (`backend-rest/test/auth_controller.test.mjs`). Exercise CRUD is tested in backend exercise tests.

## Prerequisites for Running Tests

1. **Backend must be running** on `http://localhost:3000`

   ```bash
   cd backend-rest && npm start
   ```

2. **Frontend must be running** on `http://localhost:5173`

   ```bash
   cd frontend-react && npm run dev
   ```

3. **MongoDB must be accessible** (via connection string from .env)

## Continuous Integration

Tests are configured to run in GitHub Actions on every PR. See `.github/workflows/` for CI configuration.

## Writing New Tests

1. Create a new file in `cypress/e2e/` with `.cy.js` extension
2. Use the helper commands from `cypress/support/e2e.js`
3. Follow existing test patterns for consistency

Example:

```javascript
describe('New Feature', () => {
  it('should do something', () => {
    cy.login('test@example.com', 'password123');
    cy.visit('/');
    cy.contains('Expected Text').should('be.visible');
  });
});
```

## Debugging

### View Console Logs

In Cypress UI, check the "Console" tab to see browser console messages.

### Slow Down Tests

Add `.pause()` or `.debug()` to any command:

```javascript
cy.login(email, password).debug();
cy.contains('text').pause(); // Pauses execution
```

### Take Screenshots

```javascript
cy.screenshot('my-screenshot');
```

Screenshots are saved to `cypress/screenshots/`

## Test Data

Tests create new test accounts for each run using timestamps:

```javascript
const testEmail = `test-${Date.now()}@example.com`;
```

This ensures tests don't conflict with existing data.

## Known Issues / Limitations

- Tests clear localStorage before each test to ensure clean state
- Auth confirmation dialogs tested via `cy.on('window:confirm')`
- Fixtures for pre-seeding data not yet implemented (tests create data on-the-fly)

## Future Enhancements

- [ ] Add admin panel tests (Phase 6.3 completion)
- [ ] Add fixtures for common test data
- [ ] Add performance testing
- [ ] Add accessibility testing (axe-core)
- [ ] Parallel test execution
