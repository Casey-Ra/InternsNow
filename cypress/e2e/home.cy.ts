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
    cy.contains('Log In').should('be.visible');
  });

  it('should navigate to login page', () => {
    cy.contains('Log In').click();
    cy.url().should('include', '/login');
  });
});
