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

    // Mock internships API
    cy.intercept('GET', '/api/internships*', {
      statusCode: 200,
      body: [
        {
          id: 1,
          title: 'Software Engineering Intern',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          description: 'Great opportunity for aspiring developers',
          requirements: 'JavaScript, React, Node.js',
          type: 'Full-time',
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Data Science Intern',
          company: 'Data Inc',
          location: 'Remote',
          description: 'Work with big data and ML models',
          requirements: 'Python, SQL, Machine Learning',
          type: 'Part-time',
          created_at: new Date().toISOString(),
        },
      ],
    }).as('getInternships');

    cy.visit('/student/find-opportunities');
  });

  it('should display the find opportunities page', () => {
    cy.url().should('include', '/student/find-opportunities');
  });

  it('should show internship listings', () => {
    cy.wait('@getInternships');
    cy.contains('Software Engineering Intern').should('be.visible');
    cy.contains('Data Science Intern').should('be.visible');
  });

  it('should show company names', () => {
    cy.wait('@getInternships');
    cy.contains('Tech Corp').should('be.visible');
    cy.contains('Data Inc').should('be.visible');
  });

  it('should show location information', () => {
    cy.wait('@getInternships');
    cy.contains('San Francisco, CA').should('be.visible');
    cy.contains('Remote').should('be.visible');
  });
});
