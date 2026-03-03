describe('Login & Register Pages', () => {
  // ─── Login Page ───────────────────────────────────────────────────────────
  describe('Login Page (/login)', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('loads the login page', () => {
      cy.url().should('include', '/login');
    });

    it('displays the Student Login heading', () => {
      cy.contains('Student Login').should('be.visible');
    });

    it('shows the Continue with Auth0 button', () => {
      cy.contains('button', 'Continue with Auth0').should('be.visible');
    });

    it('shows the just browsing / intake link', () => {
      cy.contains('Start with the quick intake survey')
        .should('have.attr', 'href')
        .and('eq', '/intake');
    });

    it('shows a Sign Up link pointing to /register', () => {
      cy.get('a[href="/register"]').should('be.visible');
    });

    it('renders header and footer', () => {
      cy.get('header').should('be.visible');
      cy.get('footer').should('be.visible');
    });

    it('clicking Continue with Auth0 redirects to Auth0', () => {
      // Intercept the redirect so we don't actually leave the test suite
      cy.intercept('GET', '**/authorize**').as('auth0Redirect');
      cy.contains('button', 'Continue with Auth0').click();
      // Should navigate away from /login toward auth flow
      cy.url().should('not.eq', Cypress.config().baseUrl + '/login');
    });
  });

  // ─── Register Page ────────────────────────────────────────────────────────
  describe('Register Page (/register)', () => {
    beforeEach(() => {
      cy.visit('/register');
    });

    it('loads the register page', () => {
      cy.url().should('include', '/register');
    });

    it('displays the Student Sign Up heading', () => {
      cy.contains('Student Sign Up').should('be.visible');
    });

    it('shows the Sign Up with Auth0 button', () => {
      cy.contains('button', 'Sign Up with Auth0').should('be.visible');
    });

    it('shows the try quick intake survey link', () => {
      cy.contains('Try the quick intake survey')
        .should('have.attr', 'href')
        .and('eq', '/intake');
    });

    it('shows a Login link pointing to /login', () => {
      cy.get('a[href="/login"]').should('be.visible');
    });

    it('renders header and footer', () => {
      cy.get('header').should('be.visible');
      cy.get('footer').should('be.visible');
    });
  });

  // ─── Cross-page links ─────────────────────────────────────────────────────
  describe('Cross-page navigation', () => {
    it('login page Login link navigates to register page', () => {
      cy.visit('/login');
      cy.contains("Don't have an account").parent().contains('Sign Up').click();
      cy.url().should('include', '/register');
    });

    it('register page Already have an account link navigates to login page', () => {
      cy.visit('/register');
      cy.contains('Already have an account')
        .parent()
        .find('a[href="/login"]')
        .click();
      cy.url().should('include', '/login');
    });
  });

  // ─── Auth-guarded student route ───────────────────────────────────────────
  describe('Auth0-guarded routes', () => {
    it('visiting /student while unauthenticated redirects to Auth0 login', () => {
      cy.request({
        url: '/student',
        failOnStatusCode: false,
        followRedirect: false,
      }).then((response) => {
        expect([302, 307]).to.include(response.status);
        expect(response.headers.location).to.satisfy(
          (loc: string) =>
            loc.includes('/auth/login') || loc.includes('auth0.com')
        );
      });
    });
  });
});
