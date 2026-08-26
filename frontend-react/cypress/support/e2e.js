// Cypress support file for e2e tests
// This file is loaded before each test file

beforeEach(() => {
  // Clear localStorage before each test to ensure clean auth state
  cy.clearLocalStorage();
});

// Helper command to log in (used across multiple tests)
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[placeholder="your@email.com"]').type(email);
  cy.get('input[placeholder="At least 6 characters"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('eq', 'http://localhost:5173/');
});

// Helper command to register a new user
Cypress.Commands.add('register', (email, username, password) => {
  cy.visit('/register');
  cy.get('input[placeholder="your@email.com"]').type(email);
  cy.get('input[placeholder="3-30 characters (letters, numbers, -, _)"]').type(username);
  cy.get('input[placeholder="At least 6 characters"]').first().type(password);
  cy.get('input[placeholder="Confirm your password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('eq', 'http://localhost:5173/');
});

// Helper to verify user is logged in
Cypress.Commands.add('verifyLoggedIn', (username) => {
  cy.get('.username').should('contain', username);
  cy.get('.btn-logout').should('be.visible');
});

// Helper to verify user is logged out
Cypress.Commands.add('verifyLoggedOut', () => {
  cy.get('.btn-login').should('be.visible');
  cy.get('.btn-signup').should('be.visible');
  cy.get('.btn-logout').should('not.exist');
});
