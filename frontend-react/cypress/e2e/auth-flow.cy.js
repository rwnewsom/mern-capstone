describe('Authentication Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testUsername = `testuser${Date.now()}`;
  const testPassword = 'password123';

  describe('Registration', () => {
    it('should register a new user and auto-login', () => {
      cy.register(testEmail, testUsername, testPassword);
      cy.verifyLoggedIn(testUsername);
    });

    it('should show error for duplicate email', () => {
      cy.visit('/register');
      cy.get('input[placeholder="your@email.com"]').type(testEmail);
      cy.get('input[placeholder="3-30 characters (letters, numbers, -, _)"]').type('newuser');
      cy.get('input[placeholder="At least 6 characters"]').first().type(testPassword);
      cy.get('input[placeholder="Confirm your password"]').type(testPassword);
      cy.get('button[type="submit"]').click();
      // Should show error toast and stay on page
      cy.url().should('include', '/register');
    });

    it('should show error for invalid username', () => {
      cy.visit('/register');
      cy.get('input[placeholder="your@email.com"]').type('new@example.com');
      cy.get('input[placeholder="3-30 characters (letters, numbers, -, _)"]').type('ab'); // Too short
      cy.get('input[placeholder="At least 6 characters"]').first().type(testPassword);
      cy.get('input[placeholder="Confirm your password"]').type(testPassword);
      cy.get('button[type="submit"]').click();
      // Should show error and not submit
      cy.url().should('include', '/register');
    });

    it('should show error for password mismatch', () => {
      cy.visit('/register');
      cy.get('input[placeholder="your@email.com"]').type('another@example.com');
      cy.get('input[placeholder="3-30 characters (letters, numbers, -, _)"]').type('validuser');
      cy.get('input[placeholder="At least 6 characters"]').first().type(testPassword);
      cy.get('input[placeholder="Confirm your password"]').type('differentpass');
      cy.get('button[type="submit"]').click();
      // Should show error and not submit
      cy.url().should('include', '/register');
    });
  });

  describe('Login', () => {
    it('should login with existing account', () => {
      cy.login(testEmail, testPassword);
      cy.verifyLoggedIn(testUsername);
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      cy.get('input[placeholder="your@email.com"]').type('wrong@example.com');
      cy.get('input[placeholder="At least 6 characters"]').type('wrongpass');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Logout', () => {
    it('should logout and redirect to login', () => {
      cy.login(testEmail, testPassword);
      cy.verifyLoggedIn(testUsername);

      cy.get('.btn-logout').click();
      cy.url().should('eq', 'http://localhost:5173/login');
      cy.verifyLoggedOut();
    });

    it('should clear localStorage on logout', () => {
      cy.login(testEmail, testPassword);
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.exist;
      });

      cy.get('.btn-logout').click();
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
      });
    });
  });

  describe('Auth Persistence', () => {
    it('should persist auth on page refresh', () => {
      cy.login(testEmail, testPassword);
      cy.verifyLoggedIn(testUsername);

      cy.reload();
      cy.verifyLoggedIn(testUsername);
    });

    it('should redirect to login if not authenticated', () => {
      cy.visit('/');
      cy.url().should('include', '/login');
    });
  });

  describe('Navigation Updates', () => {
    it('should show login buttons when not authenticated', () => {
      cy.visit('/login');
      cy.verifyLoggedOut();
    });

    it('should update Navigation immediately after login without refresh', () => {
      cy.visit('/login');
      cy.verifyLoggedOut();

      cy.get('input[placeholder="your@email.com"]').type(testEmail);
      cy.get('input[placeholder="At least 6 characters"]').type(testPassword);
      cy.get('button[type="submit"]').click();

      // Should update Navigation without page refresh (url already changed to /)
      cy.url().should('eq', 'http://localhost:5173/');
      cy.verifyLoggedIn(testUsername);
    });

    it('should update Navigation immediately after logout', () => {
      cy.login(testEmail, testPassword);
      cy.verifyLoggedIn(testUsername);

      cy.get('.btn-logout').click();
      cy.url().should('eq', 'http://localhost:5173/login');
      cy.verifyLoggedOut();
    });
  });
});
