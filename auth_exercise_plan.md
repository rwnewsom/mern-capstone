# Phase 6.2: Exercise Authentication & User Isolation

## Overview
Integrate authentication into exercise operations. Users can only see/modify their own exercises. All exercise endpoints require valid JWT token and enforce user isolation.

## Backend Changes

### 1. Exercise Controller Updates
**File:** `backend-rest/exercise_controller.mjs`

Protect all exercise routes with `verifyToken` middleware:
- POST /exercises → `verifyToken` (create exercise for authenticated user)
- GET /exercises → `verifyToken` (retrieve user's exercises only)
- GET /exercises/:id → `verifyToken` (verify ownership before returning)
- PUT /exercises/:id → `verifyToken` (verify ownership before updating)
- DELETE /exercises/:id → `verifyToken` (verify ownership before deleting)

**Implementation:**
- Import `verifyToken` from auth_middleware
- Add middleware to each route: `app.post('/exercises', verifyToken, ...)`
- Extract userId from `req.userId` (set by middleware)
- Pass userId to model methods

### 2. Exercise Model Updates
**File:** `backend-rest/exercise_model.mjs`

Update CRUD functions to handle userId:

**createExercise(name, reps, weight, unit, date, userId)**
- Accept userId parameter
- Save userId with exercise document
- Return created exercise with userId

**retrieveExercises(userId)**
- Accept userId parameter
- Query: `Exercise.find({ userId }).exec()`
- Return only user's exercises

**retrieveExerciseById(exerciseId, userId)**
- Accept userId parameter
- Query: `Exercise.findOne({ _id: exerciseId, userId }).exec()`
- Return null if not found or userId mismatch
- Prevents access to other users' exercises

**updateExerciseById(exerciseId, userId, updates)**
- Accept userId parameter
- Query: `Exercise.updateOne({ _id: exerciseId, userId }, updates).exec()`
- Returns result with matchedCount
- Silently fails (matchedCount = 0) if not owner

**deleteExerciseById(exerciseId, userId)**
- Accept userId parameter
- Query: `Exercise.deleteOne({ _id: exerciseId, userId }).exec()`
- Returns result with deletedCount
- Silently fails (deletedCount = 0) if not owner

### 3. Test Updates
**File:** `backend-rest/test/auth_exercise_integration.test.mjs` (new)

**Authentication Tests:**
- POST /exercises without token → 401
- GET /exercises without token → 401
- GET /exercises/:id without token → 401
- PUT /exercises/:id without token → 401
- DELETE /exercises/:id without token → 401

**Authorization Tests (User Isolation):**
- User A creates exercise, User B cannot read it
- User A creates exercise, User B cannot update it
- User A creates exercise, User B cannot delete it
- User A can read/update/delete only their own exercises

**Happy Path Tests:**
- Authenticated user can create exercise (userId saved)
- Authenticated user can read own exercises
- Authenticated user can read specific own exercise
- Authenticated user can update own exercise
- Authenticated user can delete own exercise

**Edge Cases:**
- GET /exercises/:id with valid token but invalid exerciseId → 404
- PUT /exercises/:id with valid token but invalid exerciseId → 404
- DELETE /exercises/:id with valid token but invalid exerciseId → 404
- Expired token → 401
- Invalid token format → 401

## Frontend Changes

### 1. Login/Register Page
**File:** `frontend-react/src/pages/AuthPage.jsx` (new)

**Features:**
- Toggle between login and register forms
- Form fields: email, password
- Password confirmation for register
- Submit error display via Toast
- Redirect to dashboard on success
- Save JWT token to localStorage

**Implementation:**
- Use useState for form data and error state
- Use useNavigate for redirect after auth
- Call POST /api/auth/register or /api/auth/login
- Store token: `localStorage.setItem('token', response.token)`

### 2. API Utility Updates
**File:** `frontend-react/src/utils/api.js`

**Add token to requests:**
- Helper function: `getAuthHeader()`
  - Return `{ Authorization: 'Bearer ' + localStorage.getItem('token') }`
  - Return {} if no token
- Update `fetchWithTimeout()` to merge auth header:
  ```javascript
  const headers = { ...options.headers, ...getAuthHeader() }
  ```
- Error handling: Check for 401 (token expired/invalid)
  - Clear localStorage token
  - Redirect to login page

### 3. Protected Routes
**File:** `frontend-react/src/App.jsx`

**Add ProtectedRoute component:**
- Check localStorage for token
- If no token → redirect to login
- If token exists → render page component
- If 401 from API → clear token, redirect to login

**Route structure:**
- /login (public) → AuthPage
- /register (public) → AuthPage in register mode
- / (protected) → RetrieveExercises
- /create (protected) → CreateExercise
- /edit/:id (protected) → EditExercise

### 4. Exercise Pages Updates
**File:** `frontend-react/src/pages/*.jsx`

**CreateExercise:**
- Add token to request headers
- Show 401 error → redirect to login
- Clear token on 401 response

**EditExercise:**
- Add token to request headers
- Show 401 error → redirect to login
- Add ownership check: 404 if not owner

**RetrieveExercises:**
- Add token to request headers
- Show 401 error → redirect to login
- Display only user's exercises (backend filters)

### 5. Navigation Updates
**File:** `frontend-react/src/App.jsx`

**Add navigation elements:**
- Show "Logout" button if logged in (clear token, redirect to login)
- Show login/register links if not logged in
- Show user email if logged in

## Implementation Order

### Step 1: Backend Middleware Integration
- [ ] Add `verifyToken` to all exercise routes
- [ ] Test: 401 without token for all endpoints

### Step 2: Backend Model Updates
- [ ] Update `createExercise()` to accept and save userId
- [ ] Update `retrieveExercises()` to filter by userId
- [ ] Update `retrieveExerciseById()` to check userId
- [ ] Update `updateExerciseById()` to check userId
- [ ] Update `deleteExerciseById()` to check userId
- [ ] Test: All exercise operations respect userId

### Step 3: Backend Integration Tests
- [ ] Create auth_exercise_integration.test.mjs
- [ ] Write 15+ tests covering auth + isolation
- [ ] Verify all tests pass

### Step 4: Frontend Auth Pages
- [ ] Create AuthPage component with login/register
- [ ] Add token storage to localStorage
- [ ] Add password validation
- [ ] Add error display via Toast

### Step 5: Frontend Route Protection
- [ ] Create ProtectedRoute component
- [ ] Update route definitions with protection
- [ ] Add redirect logic for 401 responses

### Step 6: Frontend API Integration
- [ ] Update api.js to send JWT in headers
- [ ] Handle 401 errors (clear token, redirect)
- [ ] Update all exercise operations to use auth headers

### Step 7: Frontend Navigation
- [ ] Add logout button
- [ ] Add user email display
- [ ] Add login/register links for unauthenticated users
- [ ] Test login/logout flow

### Step 8: Full Integration Testing
- [ ] Test complete user journey: register → login → create → read → update → delete
- [ ] Test user isolation: create as user A, verify user B cannot access
- [ ] Test token expiry handling
- [ ] Test 401 redirects to login

### Step 9: Docker & CI/CD
- [ ] Verify docker-compose runs with auth
- [ ] Verify all GitHub Actions pass
- [ ] Test with docker-compose up

## Acceptance Criteria

### Backend
- [ ] All exercise routes require valid JWT token (401 without token)
- [ ] Exercises are created with userId from token
- [ ] GET /exercises returns only logged-in user's exercises
- [ ] GET /exercises/:id returns 404 if not owner
- [ ] PUT /exercises/:id updates only if owner
- [ ] DELETE /exercises/:id deletes only if owner
- [ ] User isolation tests all passing
- [ ] 401 responses when token missing/invalid
- [ ] 404 responses when exercise not found or not owner
- [ ] No cross-user access possible

### Frontend
- [ ] Login page appears for unauthenticated users
- [ ] Register creates new user and logs in
- [ ] Login endpoint works
- [ ] Token stored in localStorage
- [ ] Exercise pages protected (redirect to login if not authenticated)
- [ ] JWT sent in Authorization header for all API calls
- [ ] 401 response clears token and redirects to login
- [ ] Logout clears token and redirects to login
- [ ] User email displayed when logged in
- [ ] Navigation shows appropriate links based on auth state
- [ ] Error messages shown via Toast

### Integration
- [ ] User can register with email/password
- [ ] User can login with email/password
- [ ] User can create exercises (userId saved)
- [ ] User can read own exercises
- [ ] User can update own exercises
- [ ] User can delete own exercises
- [ ] User B cannot read User A's exercises
- [ ] User B cannot update User A's exercises
- [ ] User B cannot delete User A's exercises
- [ ] Invalid token prevents all operations
- [ ] Expired token requires login again
- [ ] Full flow tested with docker-compose

## Security Considerations

**User Isolation:**
- Every exercise operation checks userId in query
- No way to access other user's exercises via API
- Backend enforces isolation, not frontend

**Token Security:**
- Tokens stored in localStorage (not httpOnly - frontend needs access)
- Token sent in Authorization header
- 7-day expiry configured in auth_controller
- Expired tokens trigger 401 → redirect to login

**Password Security:**
- Passwords never sent to frontend
- Passwords hashed on backend with bcryptjs
- No password reset yet (Phase 7 future work)

**CORS:**
- Frontend and backend same-origin in production (Nginx proxy)
- CORS already configured in express app

## Notes

- This phase builds on Phase 6.1 (User model, JWT, auth middleware already exist)
- Database migration: Old exercises have no userId (optional Phase 6.3 work)
- Session management: Simple JWT-based (no refresh tokens yet)
- Two-factor auth: Not implemented (Phase 8+ future work)

---

**Last Updated:** 2026-08-13  
**Estimated Effort:** 8-10 hours  
**Complexity:** Medium (auth + model updates + frontend routing)
