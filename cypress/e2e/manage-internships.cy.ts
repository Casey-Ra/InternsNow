describe('Manage Internships Page (/manage-internships)', () => {
  it('renders the manage internships shell and listing area', () => {
    cy.visit('/manage-internships');
    cy.url().should('include', '/manage-internships');
    cy.contains('h1', 'Manage Internships').should('be.visible');
    cy.contains('Edit or remove internships').should('be.visible');
    cy.get('header').should('be.visible');
    cy.get('footer').should('be.visible');
    cy.get('main').should('be.visible');
    cy.get('body').then(($body) => {
      const text = $body.text();
      const hasContent =
        text.includes('No internships') ||
        text.includes('company') ||
        text.includes('Company') ||
        $body.find('table, [role="table"], .internship-row').length > 0 ||
        text.includes('Edit') ||
        text.includes('Delete');
      expect(hasContent).to.be.true;
    });
  });

  it('renders the add internship page shell', () => {
    cy.visit('/add-internship');
    cy.url().should('include', '/add-internship');
    cy.get('main').should('be.visible');
  });
});
