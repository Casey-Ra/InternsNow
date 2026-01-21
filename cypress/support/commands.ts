/// <reference types="cypress" />
// ***********************************************
// Custom Commands for InternsNow
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via Auth0
       * @example cy.login()
       */
      login(): Chainable<void>;

      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>;

      /**
       * Custom command to check if element is in viewport
       * @example cy.get('button').shouldBeVisible()
       */
      shouldBeVisible(): Chainable<Element>;
    }
  }
}

// Login command - handles Auth0 authentication
// For testing, you may want to mock the Auth0 session
Cypress.Commands.add('login', () => {
  // Option 1: Use Auth0's testing approach with a test user
  // This intercepts Auth0 requests and provides a mock session
  cy.intercept('/api/auth/me', {
    statusCode: 200,
    body: {
      user: {
        sub: 'auth0|test123',
        email: 'test@example.edu',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
      },
    },
  }).as('authMe');

  // Visit the app to trigger auth check
  cy.visit('/');
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/api/auth/logout');
});

// Check element visibility in viewport
Cypress.Commands.add('shouldBeVisible', { prevSubject: 'element' }, (subject) => {
  const isVisible = (elem: JQuery<HTMLElement>) => {
    const rect = elem[0].getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };
  expect(isVisible(subject)).to.be.true;
  return subject;
});

export {};
