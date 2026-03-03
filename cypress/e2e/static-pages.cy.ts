/**
 * Static & informational page tests
 * Tests for: /about, /features, /contact, /faqs, /help-center,
 *             /privacy-policy, /terms-of-service, /community, /feedback
 */
describe('Static Pages', () => {
  const staticPages = [
    { path: '/about', heading: 'About InternsNow' },
    { path: '/features', heading: null },
    { path: '/contact', heading: null },
    { path: '/faqs', heading: null },
    { path: '/help-center', heading: null },
    { path: '/privacy-policy', heading: null },
    { path: '/terms-of-service', heading: null },
    { path: '/community', heading: null },
    { path: '/feedback', heading: null },
  ];

  staticPages.forEach(({ path, heading }) => {
    describe(`${path}`, () => {
      beforeEach(() => {
        cy.visit(path);
      });

      it('loads without error', () => {
        cy.url().should('include', path);
      });

      it('renders header and footer', () => {
        cy.get('header').should('be.visible');
        cy.get('footer').should('be.visible');
      });

      if (heading) {
        it(`displays the main heading "${heading}"`, () => {
          cy.contains(heading).should('be.visible');
        });
      }

      it('has a visible main element', () => {
        cy.get('main').should('be.visible');
      });
    });
  });

  // ─── About page – detailed content ───────────────────────────────────────
  describe('/about – detailed content', () => {
    beforeEach(() => {
      cy.visit('/about');
    });

    it('shows the mission section', () => {
      cy.contains('Our Mission').should('be.visible');
    });

    it('shows the How It Works section', () => {
      cy.contains('How It Works').should('be.visible');
    });

    it('shows Create Your Profile step', () => {
      cy.contains('Create Your Profile').should('be.visible');
    });

    it('shows Match With Opportunities step', () => {
      cy.contains('Match With Opportunities').should('be.visible');
    });
  });
});
