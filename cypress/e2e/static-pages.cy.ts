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
    it(`${path} renders the shared shell and main content`, () => {
      cy.visit(path);
      cy.url().should('include', path);
      cy.get('header').should('be.visible');
      cy.get('footer').should('be.visible');
      cy.get('main').should('be.visible');

      if (heading) {
        cy.contains(heading).should('be.visible');
      }
    });
  });

  it('/about shows the detailed explainer content', () => {
    cy.visit('/about');
    [
      'Our Mission',
      'How It Works',
      'Create Your Profile',
      'Match With Opportunities',
    ].forEach((text) => {
      cy.contains(text).should('be.visible');
    });
  });
});
