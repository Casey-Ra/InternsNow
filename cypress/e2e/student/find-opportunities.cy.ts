describe('Find Opportunities Page', () => {
  beforeEach(() => {
    // Mock authenticated user session
    cy.intercept('GET', '/api/profile', {
      statusCode: 200,
      body: {
        authenticated: true,
        user: {
          sub: 'auth0|test123',
          email: 'student@test.edu',
          name: 'Test Student',
        },
      },
    }).as('profile');

    cy.visit('/student/find-opportunities');
  });

  it('should display the find opportunities page', () => {
    cy.url().should('include', '/student/find-opportunities');
  });

  it('should show empty state or listings', () => {
    cy.get('body').then(($body) => {
      const text = $body.text();
      if (text.includes('No internships available yet.')) {
        cy.contains('No internships available yet.').should('be.visible');
      } else {
        cy.get('a[aria-label^="View details for"]').should(
          'have.length.greaterThan',
          0
        );
      }
    });
  });
});
