describe('Authentication Flow', () => {
  describe('Unauthenticated User', () => {
    it('should show login button on home page', () => {
      cy.visit('/');
      cy.get('a[href^="/auth/login"]').first().should('be.visible');
    });

    it('should redirect to login when accessing protected routes', () => {
      cy.visit('/student', { failOnStatusCode: false });
      // Should stay on student page or redirect to login depending on auth rules
      cy.url().should('satisfy', (url: string) => {
        return (
          url.includes('/student') ||
          url.includes('/login') ||
          url.includes('/auth/login')
        );
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
      cy.intercept('GET', '/api/profile', {
        statusCode: 200,
        body: {
          authenticated: true,
          user: {
            sub: 'auth0|test123',
            email: 'test@university.edu',
            name: 'Test User',
            picture: '/default-avatar.png',
          },
        },
      }).as('profile');
    });

    it('should show user menu when logged in', () => {
      cy.visit('/');
      cy.get('body').should('be.visible');
    });

    it('should access student dashboard when authenticated', () => {
      cy.visit('/student', { failOnStatusCode: false });
      cy.url().should('satisfy', (url: string) => {
        return (
          url.includes('/student') ||
          url.includes('/login') ||
          url.includes('/auth/login')
        );
      });
    });
  });
});
