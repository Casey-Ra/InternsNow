/// <reference types="cypress" />
import React from 'react';
import Footer from '../../components/Footer';

describe('Footer Component', () => {
  describe('default variant', () => {
    beforeEach(() => {
      cy.mount(<Footer variant="default" />);
    });

    it('renders the InternsNow brand logo link', () => {
      cy.get('footer').find('a[href="/"]').should('be.visible');
    });

    it('displays the brand name', () => {
      cy.get('footer').contains('InternsNow').should('be.visible');
    });

    it('renders Company section links', () => {
      cy.get('footer').contains('About Us').should('be.visible');
      cy.get('footer').contains('Contact').should('be.visible');
      cy.get('footer').contains('Privacy Policy').should('be.visible');
      cy.get('footer').contains('Terms of Service').should('be.visible');
    });

    it('renders Support section links', () => {
      cy.get('footer').contains('Help Center').should('be.visible');
      cy.get('footer').contains('FAQs').should('be.visible');
      cy.get('footer').contains('Community').should('be.visible');
      cy.get('footer').contains('Feedback').should('be.visible');
    });

    it('does not render student-specific links', () => {
      cy.get('footer').contains('Find Opportunities').should('not.exist');
      cy.get('footer').contains('Resume Builder').should('not.exist');
    });

    it('all internal links have valid href attributes', () => {
      cy.get('footer a[href^="/"]').each(($link) => {
        cy.wrap($link).should('have.attr', 'href').and('not.be.empty');
      });
    });
  });

  describe('student variant', () => {
    beforeEach(() => {
      cy.mount(<Footer variant="student" />);
    });

    it('renders For Students section', () => {
      cy.get('footer').contains('For Students').should('be.visible');
    });

    it('renders student-specific links', () => {
      cy.get('footer').contains('Find Opportunities').should('be.visible');
      cy.get('footer').contains('Career Resources').should('be.visible');
      cy.get('footer').contains('Resume Builder').should('be.visible');
      cy.get('footer').contains('AI Fluency Test').should('be.visible');
    });

    it('still renders common company links', () => {
      cy.get('footer').contains('About Us').should('be.visible');
      cy.get('footer').contains('Contact').should('be.visible');
    });

    it('Find Opportunities link points to correct path', () => {
      cy.get('footer')
        .contains('Find Opportunities')
        .closest('a')
        .should('have.attr', 'href', '/student/find-opportunities');
    });
  });

  describe('employer variant', () => {
    beforeEach(() => {
      cy.mount(<Footer variant="employer" />);
    });

    it('renders For Employers section', () => {
      cy.get('footer').contains('For Employers').should('be.visible');
    });

    it('renders employer-specific links', () => {
      cy.get('footer').contains('Post Jobs').should('be.visible');
      cy.get('footer').contains('Search Candidates').should('be.visible');
    });
  });

  describe('dark tone', () => {
    beforeEach(() => {
      cy.mount(<Footer variant="default" tone="dark" />);
    });

    it('uses high-contrast text classes for dark surfaces', () => {
      cy.get('footer').contains('InternsNow').should('have.class', 'text-slate-100');
      cy.get('footer').contains('About Us').should('have.class', 'hover:text-sky-200');
      cy.get('footer').contains('Connecting students with their dream internships and first jobs.')
        .should('have.class', 'text-slate-300');
    });
  });

  describe('accessibility', () => {
    it('renders accessible links with text content', () => {
      cy.mount(<Footer variant="default" />);
      cy.get('footer a').each(($link) => {
        cy.wrap($link)
          .invoke('text')
          .then((text) => {
            expect(text.trim()).to.not.be.empty;
          });
      });
    });

    it('has no links with empty href', () => {
      cy.mount(<Footer variant="student" />);
      cy.get('footer a[href=""]').should('not.exist');
    });
  });
});
