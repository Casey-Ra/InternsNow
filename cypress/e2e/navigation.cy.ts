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

  it('should navigate to Events page', () => {
    cy.contains('Events').click();
    cy.url().should('include', '/events');
  });

  it('should navigate to Quick Match page', () => {
    cy.contains('Quick Match').click();
    cy.url().should('include', '/intake');
  });

  it('should navigate back to home via logo/brand', () => {
    cy.visit('/about');
    cy.get('header').find('a').first().click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('footer About Us link navigates to /about', () => {
    cy.get('footer').contains('About Us').click();
    cy.url().should('include', '/about');
  });

  it('footer Privacy Policy link navigates to /privacy-policy', () => {
    cy.get('footer').contains('Privacy Policy').click();
    cy.url().should('include', '/privacy-policy');
  });

  it('footer Help Center link navigates to /help-center', () => {
    cy.get('footer').contains('Help Center').click();
    cy.url().should('include', '/help-center');
  });

  it('footer FAQs link navigates to /faqs', () => {
    cy.get('footer').contains('FAQs').click();
    cy.url().should('include', '/faqs');
  });

  it('all nav links are keyboard-accessible', () => {
    cy.get('header nav a').each(($link) => {
      cy.wrap($link)
        .should('be.visible')
        .and('have.attr', 'href')
        .and('not.be.empty');
    });
  });
});
