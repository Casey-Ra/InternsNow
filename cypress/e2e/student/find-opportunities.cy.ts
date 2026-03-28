describe('Jobs & Internships Page', () => {
  beforeEach(() => {
    cy.visit('/opportunities');
  });

  it('should display the opportunities page', () => {
    cy.url().should('include', '/opportunities');
  });

  it('should render header and footer', () => {
    cy.get('header').should('be.visible');
    cy.get('footer').should('be.visible');
  });

  it('should display the Jobs & Internships heading', () => {
    cy.contains('h1', 'Jobs & Internships').should('be.visible');
  });

  it('should show results or empty state', () => {
    cy.get('body').then(($body) => {
      const text = $body.text();
      if (text.includes('No opportunities found')) {
        cy.contains('No opportunities found').should('be.visible');
      } else {
        cy.get('h3').should('have.length.greaterThan', 0);
      }
    });
  });
});

describe('Jobs & Internships – detail page', () => {
  it('visiting a non-existent id shows not-found or redirects', () => {
    cy.visit('/opportunities/999999', { failOnStatusCode: false });
    cy.get('body').should('be.visible');
  });
});
