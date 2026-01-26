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
});
