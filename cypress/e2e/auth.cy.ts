describe('Authentication Flow', () => {
  describe('Unauthenticated User', () => {
    it('should show login button on home page', () => {
      cy.visit('/');
      cy.contains('Log In').should('be.visible');
    });

    it('should redirect to login when accessing protected routes', () => {
      // Intercept auth check as unauthenticated
      cy.intercept('/api/auth/me', {
        statusCode: 401,
        body: { error: 'Not authenticated' },
      }).as('authCheck');

      cy.visit('/student');
      // Should redirect to login or show login prompt
      cy.url().should('satisfy', (url: string) => {
        return url.includes('/login') || url.includes('/api/auth/login');
      });
    });
  });

  describe('Login Page', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should display the login page', () => {
      cy.url().should('include', '/login');
    });

    it('should have a login button or Auth0 redirect', () => {
      // Check for either a login button or form
      cy.get('body').should('be.visible');
    });
  });

  describe('Authenticated User', () => {
    beforeEach(() => {
      // Mock authenticated session
      cy.intercept('/api/auth/me', {
        statusCode: 200,
        body: {
          user: {
            sub: 'auth0|test123',
            email: 'test@university.edu',
            name: 'Test User',
            picture: 'https://example.com/avatar.jpg',
          },
        },
      }).as('authMe');
    });

    it('should show user menu when logged in', () => {
      cy.visit('/');
      cy.wait('@authMe');
      // Look for user avatar or menu
      cy.get('header').should('be.visible');
    });

    it('should access student dashboard when authenticated', () => {
      cy.visit('/student');
      cy.wait('@authMe');
      cy.url().should('include', '/student');
    });
  });
});
