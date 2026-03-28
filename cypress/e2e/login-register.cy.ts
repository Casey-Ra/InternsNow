describe('Login & Register Pages', () => {
  it('renders the login page shell and links', () => {
    cy.visit('/login');
    cy.url().should('include', '/login');
    cy.contains('Student Login').should('be.visible');
    cy.contains('button', 'Continue with Auth0').should('be.visible');
    cy.contains('Start with the quick intake survey')
      .should('have.attr', 'href', '/intake');
    cy.get('a[href="/register"]').should('be.visible');
    cy.get('header').should('be.visible');
    cy.get('footer').should('be.visible');
  });

  it('renders the register page shell and links', () => {
    cy.visit('/register');
    cy.url().should('include', '/register');
    cy.contains('Student Sign Up').should('be.visible');
    cy.contains('button', 'Sign Up with Auth0').should('be.visible');
    cy.contains('Try the quick intake survey')
      .should('have.attr', 'href', '/intake');
    cy.get('a[href="/login"]').should('be.visible');
    cy.get('header').should('be.visible');
    cy.get('footer').should('be.visible');
  });

  it('exposes valid Auth0 entry points', () => {
    cy.request({
      method: 'GET',
      url: '/auth/login',
      failOnStatusCode: false,
      followRedirect: false,
    }).then((response) => {
      expect([302, 307]).to.include(response.status);
      expect(response.headers.location).to.match(/^\/login(\?auth0=unavailable)?/);
    });

    cy.request({
      method: 'GET',
      url: '/auth/login?screen_hint=signup',
      failOnStatusCode: false,
      followRedirect: false,
    }).then((response) => {
      expect([302, 307]).to.include(response.status);
      expect(response.headers.location).to.match(/^\/login(\?auth0=unavailable)?/);
    });
  });

  it('supports switching between login and register', () => {
    cy.visit('/login');
    cy.contains("Don't have an account").parent().contains('Sign Up').click();
    cy.url().should('include', '/register');

    cy.contains('Already have an account')
      .parent()
      .find('a[href="/login"]')
      .click();
    cy.url().should('include', '/login');
  });

  it('redirects unauthenticated student access to Auth0 login', () => {
    cy.request({
      url: '/student',
      failOnStatusCode: false,
      followRedirect: false,
    }).then((response) => {
      expect([302, 307]).to.include(response.status);
      expect(response.headers.location).to.include('/auth/login');
    });
  });
});
