/**
 * API Route Tests
 * Tests all public and auth-protected API endpoints.
 * Auth-protected routes are tested for correct 401/403 rejection when
 * called without a valid session.
 */
describe('API Route Tests', () => {
  // ─── Profile & Session ───────────────────────────────────────────────────
  describe('/api/profile', () => {
    it('returns 401 or 403 when not authenticated', () => {
      cy.request({
        method: 'GET',
        url: '/api/profile',
        failOnStatusCode: false,
      }).then((response) => {
        expect([401, 403]).to.include(response.status);
      });
    });
  });

  describe('/api/protected', () => {
    it('returns 401 when accessed without a token', () => {
      cy.request({
        method: 'GET',
        url: '/api/protected',
        failOnStatusCode: false,
      }).then((response) => {
        expect([401, 403]).to.include(response.status);
      });
    });
  });

  // ─── Lookup Endpoints (public) ───────────────────────────────────────────
  describe('Lookup endpoints – public', () => {
    it('GET /api/lookups/locations → 200 array', () => {
      cy.request('/api/lookups/locations').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('GET /api/lookups/majors → 200 array', () => {
      cy.request('/api/lookups/majors').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('GET /api/lookups/degree-types → 200 array', () => {
      cy.request('/api/lookups/degree-types').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('GET /api/lookups/institutions → 200 array', () => {
      cy.request('/api/lookups/institutions').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  });

  // ─── Search Endpoints (public) ───────────────────────────────────────────
  describe('Search endpoints – public', () => {
    it('GET /api/majors/search returns 200 with query', () => {
      cy.request('/api/majors/search?q=computer').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('GET /api/majors/search returns 200 with empty query', () => {
      cy.request('/api/majors/search?q=').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('GET /api/institutions/search returns 200 with query', () => {
      cy.request('/api/institutions/search?q=university').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  });

  // ─── Internship CRUD ─────────────────────────────────────────────────────
  describe('Internship CRUD endpoints – auth-protected', () => {
    it('POST /api/internships/create requires authentication (401/403)', () => {
      cy.request({
        method: 'POST',
        url: '/api/internships/create',
        failOnStatusCode: false,
        body: {
          company_name: 'Cypress Test Co',
          job_description: 'Testing internship creation.',
          url: 'https://example.com/jobs/1',
        },
      }).then((response) => {
        expect([401, 403]).to.include(response.status);
      });
    });

    it('POST /api/internships/update requires authentication', () => {
      cy.request({
        method: 'POST',
        url: '/api/internships/update',
        failOnStatusCode: false,
        body: {
          id: 1,
          company_name: 'Updated Corp',
          job_description: 'Updated description.',
          url: 'https://example.com/jobs/updated',
        },
      }).then((response) => {
        expect([401, 403]).to.include(response.status);
      });
    });

    it('POST /api/internships/delete requires authentication', () => {
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

  // ─── Events CRUD ─────────────────────────────────────────────────────────
  describe('Events CRUD endpoints – auth-protected', () => {
    it('POST /api/events/create requires authentication', () => {
      cy.request({
        method: 'POST',
        url: '/api/events/create',
        failOnStatusCode: false,
        body: {
          title: 'Test Event',
          description: 'A test networking event.',
          event_date: '2026-07-01T18:00:00Z',
          location: 'Austin, TX',
        },
      }).then((response) => {
        expect([401, 403]).to.include(response.status);
      });
    });

    it('POST /api/events/update requires authentication', () => {
      cy.request({
        method: 'POST',
        url: '/api/events/update',
        failOnStatusCode: false,
        body: {
          id: 'non-existent',
          title: 'Updated Event',
        },
      }).then((response) => {
        expect([401, 403]).to.include(response.status);
      });
    });

    it('POST /api/events/delete requires authentication', () => {
      cy.request({
        method: 'POST',
        url: '/api/events/delete',
        failOnStatusCode: false,
        body: { id: 'non-existent' },
      }).then((response) => {
        expect([401, 403]).to.include(response.status);
      });
    });
  });

  // ─── Auth routes (no crash) ───────────────────────────────────────────────
  describe('Auth routes', () => {
    it('/login renders the auth login button', () => {
      cy.visit('/login');
      cy.contains('button', 'Continue with Auth0').should('be.visible');
    });
  });
});
