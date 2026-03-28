describe('Navigation', () => {
  it('exposes the expected header navigation destinations', () => {
    cy.visit('/');
    [
      ['Quick Match', '/intake'],
      ['Events', '/events'],
      ['About', '/about'],
      ['Features', '/features'],
      ['Contact', '/contact'],
    ].forEach(([label, href]) => {
      cy.get('header').contains('a', label).should('have.attr', 'href', href);
    });

    cy.get('header nav a').each(($link) => {
      cy.wrap($link)
        .should('be.visible')
        .and('have.attr', 'href')
        .and('not.be.empty');
    });
  });

  it('exposes the expected footer destinations', () => {
    cy.visit('/');
    [
      ['About Us', '/about'],
      ['Privacy Policy', '/privacy-policy'],
      ['Help Center', '/help-center'],
      ['FAQs', '/faqs'],
    ].forEach(([label, href]) => {
      cy.get('footer').contains('a', label).should('have.attr', 'href', href);
    });
  });

  it('navigates back to home via the brand link', () => {
    cy.visit('/about');
    cy.get('header').find('a').first().click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});
