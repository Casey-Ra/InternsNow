/// <reference types="cypress" />
import React from 'react';
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import Header from '../../components/Header';

type AuthUser = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};

/**
 * Header derives its nav variant from usePathname(). In component tests the
 * pathname resolves to '/', so resolvedVariant stays "default".
 */
const mountHeader = (user?: AuthUser) =>
  cy.mount(
    <Auth0Provider user={user}>
      <Header variant="default" />
    </Auth0Provider>
  );

const mountDarkHeader = (user?: AuthUser) =>
  cy.mount(
    <Auth0Provider user={user}>
      <Header variant="default" tone="dark" />
    </Auth0Provider>
  );

describe('Header Component', () => {
  describe('default variant - unauthenticated', () => {
    beforeEach(() => {
      mountHeader();
    });

    it('renders the InternsNow brand name', () => {
      cy.get('header').contains('InternsNow').should('be.visible');
    });

    it('renders the IN logo badge', () => {
      cy.get('header').contains('IN').should('be.visible');
    });

    it('shows default nav links', () => {
      cy.get('header').contains('Quick Match').should('be.visible');
      cy.get('header').contains('Events').should('be.visible');
      cy.get('header').contains('About').should('be.visible');
      cy.get('header').contains('Features').should('be.visible');
      cy.get('header').contains('Contact').should('be.visible');
    });

    it('does not show student-only nav links for the default variant', () => {
      cy.get('header').contains('Find Opportunities').should('not.exist');
    });

    it('shows Sign In and Get Started buttons', () => {
      cy.get('header').contains('Sign In').should('be.visible');
      cy.get('header').contains('Get Started').should('be.visible');
    });

    it('Sign In link points to Auth0 login', () => {
      cy.get('header')
        .contains('Sign In')
        .should('have.attr', 'href', '/auth/login?returnTo=%2F');
    });

    it('Get Started link carries signup hint', () => {
      cy.get('header')
        .contains('Get Started')
        .should('have.attr', 'href', '/auth/login?screen_hint=signup&returnTo=%2F');
    });

    it('logo link points to /', () => {
      cy.get('header').find('a[href="/"]').first().should('be.visible');
    });

    it('does not show the loading placeholder', () => {
      cy.get('header').should('not.contain.text', '...');
    });
  });

  describe('authenticated user', () => {
    beforeEach(() => {
      mountHeader({
        sub: 'auth0|test123',
        email: 'student@test.edu',
        name: 'Test Student',
        picture: 'https://example.com/avatar.png',
      });
    });

    it('does not show the loading placeholder after auth resolves', () => {
      cy.get('header').should('not.contain.text', '...');
    });
  });

  describe('navigation link href values', () => {
    beforeEach(() => {
      mountHeader();
    });

    it('Quick Match links to /intake', () => {
      cy.get('header')
        .contains('Quick Match')
        .should('have.attr', 'href', '/intake');
    });

    it('Events links to /events', () => {
      cy.get('header')
        .contains('Events')
        .should('have.attr', 'href', '/events');
    });

    it('About links to /about', () => {
      cy.get('header').contains('About').should('have.attr', 'href', '/about');
    });

    it('Features links to /features', () => {
      cy.get('header')
        .contains('Features')
        .should('have.attr', 'href', '/features');
    });

    it('Contact links to /contact', () => {
      cy.get('header')
        .contains('Contact')
        .should('have.attr', 'href', '/contact');
    });
  });

  describe('dark tone', () => {
    beforeEach(() => {
      mountDarkHeader();
    });

    it('uses high-contrast text classes for dark surfaces', () => {
      cy.get('header span').contains('InternsNow').should('have.class', 'text-slate-100');
      cy.get('header').contains('Quick Match').should('have.class', 'text-slate-300');
      cy.get('header').contains('Sign In').should('have.class', 'text-sky-200');
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      mountHeader();
    });

    it('all header links have non-empty href attributes', () => {
      cy.get('header a').each(($link) => {
        cy.wrap($link).should('have.attr', 'href').and('not.be.empty');
      });
    });

    it('all header links have visible text or aria-label', () => {
      cy.get('header a').each(($link) => {
        const text = $link.text().trim();
        const hasAriaLabel = !!$link.attr('aria-label');
        expect(text.length > 0 || hasAriaLabel).to.be.true;
      });
    });
  });
});
