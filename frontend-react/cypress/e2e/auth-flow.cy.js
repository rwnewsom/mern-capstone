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
      cy.get('#email').type(testEmail);
      cy.get('#username').type('newuser');
      cy.get('#password').type(testPassword);
      cy.get('#confirmPassword').type(testPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/register');
    });

    it('should show error for invalid username', () => {
      cy.visit('/register');
      cy.get('#email').type('new@example.com');
      cy.get('#username').type('ab');
      cy.get('#password').type(testPassword);
      cy.get('#confirmPassword').type(testPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/register');
    });

    it('should show error for password mismatch', () => {
      cy.visit('/register');
      cy.get('#email').type('another@example.com');
      cy.get('#username').type('validuser');
      cy.get('#password').type(testPassword);
      cy.get('#confirmPassword').type('differentpass');
      cy.get('button[type="submit"]').click();
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
      cy.get('#email').type('wrong@example.com');
      cy.get('#password').type('wrongpass');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Logout', () => {
    it('should logout and redirect to login', () => {
      cy.login(testEmail, testPassword);
      cy.verifyLoggedIn(testUsername);

      cy.get('button').contains('Logout').click();
      cy.url({ timeout: 8000 }).should('eq', 'http://localhost:5173/login');
      cy.verifyLoggedOut();
    });

    it('should clear localStorage on logout', () => {
      cy.login(testEmail, testPassword);
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.exist;
      });

      cy.get('button').contains('Logout').click();
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

      cy.get('#email').type(testEmail);
      cy.get('#password').type(testPassword);
      cy.get('button[type="submit"]').click();

      cy.url({ timeout: 8000 }).should('eq', 'http://localhost:5173/');
      cy.verifyLoggedIn(testUsername);
    });

    it('should update Navigation immediately after logout', () => {
      cy.login(testEmail, testPassword);
      cy.verifyLoggedIn(testUsername);

      cy.get('button').contains('Logout').click();
      cy.url({ timeout: 8000 }).should('eq', 'http://localhost:5173/login');
      cy.verifyLoggedOut();
    });
  });
});
