describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to About page', () => {
    cy.contains('About').click();
    cy.url().should('include', '/about');
  });

  it('should navigate to Features page', () => {
    cy.contains('Features').click();
    cy.url().should('include', '/features');
  });

  it('should navigate to Contact page', () => {
    cy.contains('Contact').click();
    cy.url().should('include', '/contact');
  });

  it('should navigate back to home via logo/brand', () => {
    cy.visit('/about');
    cy.get('header').find('a').first().click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});
