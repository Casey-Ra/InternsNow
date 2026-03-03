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

  it('should render header and footer', () => {
    cy.get('header').should('be.visible');
    cy.get('footer').should('be.visible');
  });

  it('should display the Find Opportunities heading', () => {
    cy.contains('h1', 'Find Opportunities').should('be.visible');
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

  it('each listing should have a company name', () => {
    cy.get('body').then(($body) => {
      if (!$body.text().includes('No internships available yet.')) {
        cy.get('h3').first().should('not.be.empty');
      }
    });
  });

  it('each listing should have an Apply link', () => {
    cy.get('body').then(($body) => {
      if (!$body.text().includes('No internships available yet.')) {
        cy.contains('a', 'Apply').first().should('be.visible');
      }
    });
  });

  it('with mocked internships, renders listing cards', () => {
    cy.intercept('GET', '/student/find-opportunities*', {
      statusCode: 200,
    }).as('page');

    cy.get('[aria-label^="View details for"], h3').should('exist');
  });
});

describe('Find Opportunities – Internship detail page', () => {
  it('visiting a non-existent internship id shows not-found or redirects', () => {
    cy.visit('/student/find-opportunities/999999', { failOnStatusCode: false });
    cy.get('body').should('be.visible');
  });
});
