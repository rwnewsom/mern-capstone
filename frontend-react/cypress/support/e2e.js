// Cypress support file for e2e tests
// This file is loaded before each test file

beforeEach(() => {
  // Clear localStorage before each test to ensure clean auth state
  cy.clearLocalStorage();
});

// Helper command to log in (used across multiple tests)
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
  // Wait for redirect to home page
  cy.url({ timeout: 8000 }).should('eq', 'http://localhost:5173/');
});

// Helper command to register a new user
Cypress.Commands.add('register', (email, username, password) => {
  cy.visit('/register');
  cy.get('#email').type(email);
  cy.get('#username').type(username);
  cy.get('#password').type(password);
  cy.get('#confirmPassword').type(password);
  cy.get('button[type="submit"]').click();
  // Wait for redirect to home page
  cy.url({ timeout: 8000 }).should('eq', 'http://localhost:5173/');
});

// Helper to verify user is logged in
Cypress.Commands.add('verifyLoggedIn', (username) => {
  cy.contains(username, { timeout: 5000 }).should('be.visible');
  cy.get('button').contains('Logout').should('be.visible');
});

// Helper to verify user is logged out
Cypress.Commands.add('verifyLoggedOut', () => {
  cy.contains('a', 'Login').should('be.visible');
  cy.contains('a', 'Sign Up').should('be.visible');
  cy.get('button').contains('Logout').should('not.exist');
});
