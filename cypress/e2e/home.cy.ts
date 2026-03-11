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
    cy.contains('Network Into Your Next Career Move').should('be.visible');
    cy.contains(
      'InternsNow connects students to internships, entry-level roles, and high-value networking events in one focused path.'
    ).should('be.visible');
  });

  it('should display the student CTA links', () => {
    cy.contains('Find Your Career Now.').should('be.visible');
    cy.contains("I'm a Student").should('be.visible');
  });

  it('student CTA links to intake or the student dashboard depending on auth state', () => {
    cy.contains("I'm a Student")
      .should('have.attr', 'href')
      .and('match', /\/(intake|student)$/);

    cy.contains('Find Your Career Now.')
      .closest('a')
      .should('have.attr', 'href')
      .and('match', /\/(intake|student)$/);
  });

  it('should display the InternsNow brand in the header', () => {
    cy.get('header').contains('InternsNow').should('be.visible');
  });

  it('should have a Get Started or Sign Up link pointing to Auth0 signup', () => {
    cy.get('a[href*="screen_hint=signup"]')
      .first()
      .should('be.visible');
  });

  it('should render readable header and footer text on the dark landing page', () => {
    cy.get('header').contains('InternsNow').should('have.class', 'text-slate-100');
    cy.get('footer').contains('InternsNow').should('have.class', 'text-slate-100');
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
