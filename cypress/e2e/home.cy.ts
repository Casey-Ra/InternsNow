describe('Home Page', () => {
  it('renders the landing page shell and hero content', () => {
    cy.visit('/');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.get('header').should('be.visible');
    cy.get('footer').should('be.visible');
    cy.get('main').should('be.visible');
    cy.get('header').contains('InternsNow').should('be.visible');
    cy.contains('Network Into Your Next Career Move').should('be.visible');
    cy.contains(
      'InternsNow connects students to internships, entry-level roles, and high-value networking events in one focused path.'
    ).should('be.visible');
    cy.contains('Find Your Career Now.').should('be.visible');
    cy.contains("I'm a Student").should('be.visible');
    cy.get('header span').contains('InternsNow').should('have.class', 'text-gray-900');
    cy.get('footer span').contains('InternsNow').should('be.visible');
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.prop', 'naturalWidth').and('be.gt', 0);
    });
  });

  it('exposes login, signup, and student CTA entry points', () => {
    cy.visit('/');
    cy.get('a[href^="/auth/login"]').first()
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', '/auth/login');
    cy.get('a[href*="screen_hint=signup"]').first().should('be.visible');
    cy.contains("I'm a Student")
      .should('have.attr', 'href')
      .and('match', /\/(intake|student)$/);

    cy.contains('Find Your Career Now.')
      .closest('a')
      .should('have.attr', 'href')
      .and('match', /\/(intake|student)$/);
  });
});
