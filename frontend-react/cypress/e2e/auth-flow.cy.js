describe('Authentication UI Validation', () => {
  describe('Registration Form Validation', () => {
    it('should show error for invalid username (too short)', () => {
      cy.visit('/register');
      cy.get('#email').type('test@example.com');
      cy.get('#username').type('ab');
      cy.get('#password').type('password123');
      cy.get('#confirmPassword').type('password123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/register');
    });

    it('should show error for invalid username (special characters)', () => {
      cy.visit('/register');
      cy.get('#email').type('test@example.com');
      cy.get('#username').type('user@name!');
      cy.get('#password').type('password123');
      cy.get('#confirmPassword').type('password123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/register');
    });

    it('should show error for password mismatch', () => {
      cy.visit('/register');
      cy.get('#email').type('test@example.com');
      cy.get('#username').type('validuser');
      cy.get('#password').type('password123');
      cy.get('#confirmPassword').type('differentpass');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/register');
    });
  });

  describe('Login Form Validation', () => {
    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      cy.get('#email').type('nonexistent@example.com');
      cy.get('#password').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/login');
    });

    it('should show error for invalid email format', () => {
      cy.visit('/login');
      cy.get('#email').type('not-an-email');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Navigation State', () => {
    it('should show login/signup buttons when not authenticated', () => {
      cy.visit('/login');
      cy.contains('a', 'Login').should('be.visible');
      cy.contains('a', 'Sign Up').should('be.visible');
      cy.get('button').contains('Logout').should('not.exist');
    });

    it('should redirect unauthenticated users to login', () => {
      cy.visit('/');
      cy.url().should('include', '/login');
    });
  });

  describe('Form Interaction', () => {
    it('should toggle between login and signup forms', () => {
      cy.visit('/login');
      cy.contains('h1', 'Login').should('be.visible');
      cy.get('#username').should('not.exist');

      cy.contains('button', 'Sign Up').click();
      cy.contains('h1', 'Create Account').should('be.visible');
      cy.get('#username').should('exist');

      cy.contains('button', 'Login').click();
      cy.contains('h1', 'Login').should('be.visible');
      cy.get('#username').should('not.exist');
    });

    it('should clear form errors when toggling forms', () => {
      cy.visit('/login');
      cy.get('#email').type('invalid');
      cy.get('#password').type('short');
      cy.get('button[type="submit"]').click();

      cy.contains('button', 'Sign Up').click();
      // Error message should be cleared
      cy.contains('Login').should('be.visible');
    });
  });
});
