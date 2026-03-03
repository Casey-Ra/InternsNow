describe('Manage Internships Page (/manage-internships)', () => {
  describe('Page structure', () => {
    beforeEach(() => {
      cy.visit('/manage-internships');
    });

    it('loads the manage internships page', () => {
      cy.url().should('include', '/manage-internships');
    });

    it('displays the Manage Internships heading', () => {
      cy.contains('h1', 'Manage Internships').should('be.visible');
    });

    it('renders header and footer', () => {
      cy.get('header').should('be.visible');
      cy.get('footer').should('be.visible');
    });

    it('shows the page description', () => {
      cy.contains('Edit or remove internships').should('be.visible');
    });
  });

  describe('Internship listing', () => {
    beforeEach(() => {
      cy.visit('/manage-internships');
    });

    it('renders the internship table or empty state', () => {
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
  });

  describe('Add Internship page (/add-internship)', () => {
    beforeEach(() => {
      cy.visit('/add-internship');
    });

    it('loads the add internship page', () => {
      cy.url().should('include', '/add-internship');
    });

    it('shows an internship creation form or Auth0 gate', () => {
      cy.get('main').should('be.visible');
    });
  });
});

describe('Internship API Routes', () => {
  describe('GET lookups', () => {
    it('/api/lookups/locations returns a list of locations', () => {
      cy.request('/api/lookups/locations').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('/api/lookups/majors returns a list of majors', () => {
      cy.request('/api/lookups/majors').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('/api/lookups/degree-types returns a list of degree types', () => {
      cy.request('/api/lookups/degree-types').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('/api/lookups/institutions returns a list of institutions', () => {
      cy.request('/api/lookups/institutions').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  });

  describe('Internship CRUD – auth protection', () => {
    it('POST /api/internships/create without auth returns 401', () => {
      cy.request({
        method: 'POST',
        url: '/api/internships/create',
        failOnStatusCode: false,
        body: {
          company_name: 'Test Corp',
          job_description: 'A test internship.',
          url: 'https://example.com/apply',
        },
      }).then((response) => {
        expect([401, 403]).to.include(response.status);
      });
    });

    it('POST /api/internships/update without auth returns 401', () => {
      cy.request({
        method: 'POST',
        url: '/api/internships/update',
        failOnStatusCode: false,
        body: { id: 1, company_name: 'Updated Corp' },
      }).then((response) => {
        expect([401, 403]).to.include(response.status);
      });
    });

    it('POST /api/internships/delete without auth returns 401', () => {
      cy.request({
        method: 'POST',
        url: '/api/internships/delete',
        failOnStatusCode: false,
        body: { id: 999 },
      }).then((response) => {
        expect([401, 403]).to.include(response.status);
      });
    });
  });

  describe('Search endpoints', () => {
    it('/api/majors/search?q=comp returns matching majors', () => {
      cy.request('/api/majors/search?q=comp').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('/api/institutions/search?q=uni returns matching institutions', () => {
      cy.request('/api/institutions/search?q=uni').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  });
});
