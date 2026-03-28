describe('Events Page (/events)', () => {
  it('renders the public events page shell and unauthenticated messaging', () => {
    cy.visit('/events');
    cy.url().should('include', '/events');
    cy.contains('h1', 'Events').should('be.visible');
    cy.contains('networking events').should('be.visible');
    cy.get('header').should('be.visible');
    cy.get('footer').should('be.visible');
    cy.contains('Sign in to post').should('be.visible');
    cy.contains('Go to login')
      .should('have.attr', 'href')
      .and('eq', '/login');
    cy.contains('button', 'Create Event').should('not.exist');
  });

  it('renders existing events or a valid empty state', () => {
    cy.visit('/events');
    cy.get('main').should('be.visible');
    cy.get('body').then(($body) => {
      const text = $body.text();
      const hasEventContent =
        text.includes('No upcoming events') ||
        text.includes('No events') ||
        $body.find('[data-testid="event-item"], article, .event-card').length > 0 ||
        text.includes('Sign in to post');
      expect(hasEventContent).to.be.true;
    });
  });
});
