// cypress/e2e/intake.cy.ts

it('opens the quiz again when Refine section is expanded', () => {
  cy.visit(
    '/intake/results?submitted=1&location=Austin%2C+TX&major=Computer+Science&interests=internship&interests=event',
  )

  // The quiz is inside a <details> element on the results page
  cy.contains('Refine your answers').closest('details').as('refine')

  // Expand it (click the actual <summary>)
  cy.get('@refine').should('not.have.attr', 'open')
  cy.get('@refine').find('summary').click()
  cy.get('@refine').should('have.attr', 'open')

  // Because location + major are provided, QuickMatchQuiz starts at step 3
  cy.get('@refine')
    .contains('What should we match you with?')
    .should('be.visible')

  // Sanity check: step 3 submit button exists
  cy.get('@refine').contains('button', 'Show My Matches').should('be.visible')
})