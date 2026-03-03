describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the home page successfully', () => {
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should display the header', () => {
    cy.get('header').should('be.visible');
  });

  it('should display the footer', () => {
    cy.get('footer').should('be.visible');
  });

  it('should have a login link', () => {
    cy.get('a[href^="/auth/login"]').first().should('be.visible');
  });

  it('should point to the auth login route', () => {
    cy.get('a[href^="/auth/login"]').first()
      .should('have.attr', 'href')
      .and('include', '/auth/login');
  });

  it('should display the hero heading', () => {
    cy.contains('Connect Students with').should('be.visible');
    cy.contains('Dream Opportunities').should('be.visible');
  });

  it('should display the student CTA card', () => {
    cy.contains("I'm a Student").should('be.visible');
  });

  it('student CTA card links to /intake when unauthenticated', () => {
    // Unauthenticated users get directed to /intake
    cy.contains("I'm a Student")
      .closest('a')
      .should('have.attr', 'href')
      .and('match', /\/(intake|student)/);
  });

  it('should display the InternsNow brand in the header', () => {
    cy.get('header').contains('InternsNow').should('be.visible');
  });

  it('should have a Get Started or Sign Up link pointing to Auth0 signup', () => {
    cy.get('a[href*="screen_hint=signup"]')
      .first()
      .should('be.visible');
  });

  it('should have a main element', () => {
    cy.get('main').should('be.visible');
  });

  it('should not have any broken images', () => {
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.prop', 'naturalWidth').and('be.gt', 0);
    });
  });
});
