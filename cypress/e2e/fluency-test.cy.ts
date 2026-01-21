describe('Fluency Test', () => {
  beforeEach(() => {
    // Mock authenticated user
    cy.intercept('/api/auth/me', {
      statusCode: 200,
      body: {
        user: {
          sub: 'auth0|test123',
          email: 'student@test.edu',
          name: 'Test Student',
        },
      },
    }).as('authMe');

    cy.visit('/student/fluency-test');
  });

  it('should display the fluency test page', () => {
    cy.url().should('include', '/student/fluency-test');
  });

  it('should show test instructions or start button', () => {
    cy.get('body').should('be.visible');
    // Look for common test UI elements
    cy.get('button, [role="button"]').should('exist');
  });

  it('should have accessible form controls', () => {
    // Verify accessibility of interactive elements
    cy.get('button, input, select, textarea').each(($el) => {
      if ($el.is(':visible')) {
        cy.wrap($el).should('not.have.attr', 'aria-hidden', 'true');
      }
    });
  });
});
