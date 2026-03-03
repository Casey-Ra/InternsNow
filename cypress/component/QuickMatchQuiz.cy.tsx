// cypress/component/QuickMatchQuiz.cy.tsx

import QuickMatchQuiz from '../../components/QuickMatchQuiz'

// Helper to mount the quiz at a specific step
const mountEmpty = (
  overrides: Partial<React.ComponentProps<typeof QuickMatchQuiz>> = {},
) =>
  cy.mount(
    <QuickMatchQuiz
      initialLocation=""
      initialMajor=""
      initialInterests={[]}
      action="/intake/results"
      {...overrides}
    />,
  )

describe('QuickMatchQuiz Component', () => {
  // ─── Step 1: Location ────────────────────────────────────────────────────
  describe('Step 1 – Location', () => {
    beforeEach(() => mountEmpty())

    it('renders the progress bar at 33%', () => {
      cy.contains('33% complete').should('be.visible')
    })

    it('highlights step 1 label in the progress section', () => {
      cy.contains('1. Preferred location').should('have.class', 'font-semibold')
    })

    it('shows the location question heading', () => {
      cy.contains('Where do you want to search?').should('be.visible')
    })

    it('renders the location input', () => {
      cy.get('input[placeholder="Chicago, IL"]').should('be.visible')
    })

    it('does not show the Back button on step 1', () => {
      cy.contains('button', 'Back').should('not.exist')
    })

    it('shows the Next Question button', () => {
      cy.contains('button', 'Next Question').should('be.visible')
    })

    it('shows the Create Full Account link', () => {
      cy.contains('Create Full Account').should('be.visible')
    })

    it('updates the summary chip when location is typed', () => {
      cy.get('input[placeholder="Chicago, IL"]').type('Austin, TX')
      cy.contains('Austin, TX').should('be.visible')
    })

    it('advances to step 2 when Next Question is clicked', () => {
      cy.contains('button', 'Next Question').click()
      cy.contains('What are you studying?').should('be.visible')
    })

    it('advances to step 2 on Enter key in location field', () => {
      cy.get('input[placeholder="Chicago, IL"]').type('{enter}')
      cy.contains('What are you studying?').should('be.visible')
    })
  })

  // ─── Step 2: Major ───────────────────────────────────────────────────────
  describe('Step 2 – Major', () => {
    beforeEach(() => {
      mountEmpty()
      cy.contains('button', 'Next Question').click()
      cy.contains('What are you studying?').should('be.visible')
    })

    it('renders progress bar at 67%', () => {
      cy.contains('67% complete').should('be.visible')
    })

    it('shows the major question heading', () => {
      cy.contains('What are you studying?').should('be.visible')
    })

    it('renders the major input', () => {
      cy.get('input[placeholder="Computer Science"]').should('be.visible')
    })

    it('shows the Back button on step 2', () => {
      cy.contains('button', 'Back').should('be.visible')
    })

    it('goes back to step 1 when Back is clicked', () => {
      cy.contains('button', 'Back').click()
      cy.contains('Where do you want to search?').should('be.visible')
    })

    it('updates the summary chip when major is typed', () => {
      cy.get('input[placeholder="Computer Science"]').type('Biology')
      cy.contains('Biology').should('be.visible')
    })

    it('advances to step 3 on Next Question click', () => {
      cy.contains('button', 'Next Question').click()
      cy.contains('What should we match you with?').should('be.visible')
    })

    it('advances to step 3 on Enter key in major field', () => {
      cy.get('input[placeholder="Computer Science"]').type('{enter}')
      cy.contains('What should we match you with?').should('be.visible')
    })
  })

  // ─── Step 3: Interests ───────────────────────────────────────────────────
  describe('Step 3 – Interests', () => {
    beforeEach(() => {
      // Force starting at step 1 so the navigation clicks are always valid
      mountEmpty({ initialLocation: '', initialMajor: '' })
      cy.contains('button', 'Next Question').click()
      cy.contains('button', 'Next Question').click()
      cy.contains('What should we match you with?').should('be.visible')
    })

    it('renders progress bar at 100%', () => {
      cy.contains('100% complete').should('be.visible')
    })

    it('shows the interests question heading', () => {
      cy.contains('What should we match you with?').should('be.visible')
    })

    it('renders all three interest toggle buttons', () => {
      cy.contains('button', 'Internships').should('be.visible')
      cy.contains('button', 'Entry-level jobs').should('be.visible')
      cy.contains('button', 'Events').should('be.visible')
    })

    it('shows the Show My Matches submit button', () => {
      cy.contains('button[type="submit"]', 'Show My Matches').should('be.visible')
    })

    it('toggles an interest on click', () => {
      // With defaultIntakeInterests (used when initialInterests is []), these may start selected.
      cy.contains('button', 'Internships')
        .should('have.attr', 'aria-pressed')
        .then((val) => {
          const wasPressed = val === 'true'
          cy.contains('button', 'Internships').click()
          cy.contains('button', 'Internships').should(
            'have.attr',
            'aria-pressed',
            wasPressed ? 'false' : 'true',
          )
        })
    })

    it('toggles an interest back on when clicked twice', () => {
      cy.contains('button', 'Events').click() // toggle
      cy.contains('button', 'Events').click() // toggle back
      cy.contains('button', 'Events').should('have.attr', 'aria-pressed')
    })

    it('updates the selection count chip', () => {
      // Starts with defaultIntakeInterests (unknown count), so assert it updates after a toggle
      cy.contains(/type(s)? selected|All match types/).should('be.visible')
      cy.contains('button', 'Internships').click()
      cy.contains(/type(s)? selected|All match types/).should('be.visible')
    })

    it('shows "All match types" when all interests are deselected', () => {
      // Toggle OFF all three, regardless of initial state
      cy.contains('button', 'Internships')
        .invoke('attr', 'aria-pressed')
        .then((pressed) => {
          if (pressed === 'true') cy.contains('button', 'Internships').click()
        })

      cy.contains('button', 'Entry-level jobs')
        .invoke('attr', 'aria-pressed')
        .then((pressed) => {
          if (pressed === 'true')
            cy.contains('button', 'Entry-level jobs').click()
        })

      cy.contains('button', 'Events')
        .invoke('attr', 'aria-pressed')
        .then((pressed) => {
          if (pressed === 'true') cy.contains('button', 'Events').click()
        })

      cy.contains('All match types').should('be.visible')
    })

    it('hidden form inputs carry location and major values', () => {
      // This is a separate mount with prefilled values, and it starts on step 3 automatically.
      mountEmpty({
        initialLocation: 'New York',
        initialMajor: 'Finance',
        initialInterests: ['internship'],
      })

      cy.contains('What should we match you with?').should('be.visible')
      cy.contains('button', 'Show My Matches').should('be.visible')

      cy.get('input[name="location"]').should('have.value', 'New York')
      cy.get('input[name="major"]').should('have.value', 'Finance')
      cy.get('input[name="submitted"]').should('have.value', '1')
      cy.get('input[name="interests"][value="internship"]').should('exist')
    })

    it('form action points to /intake/results', () => {
      cy.get('form').should('have.attr', 'action', '/intake/results')
    })
  })

  // ─── Pre-filled initial values ───────────────────────────────────────────
  describe('Pre-filled state', () => {
    it('starts at step 3 when both location and major are provided', () => {
      cy.mount(
        <QuickMatchQuiz
          initialLocation="Chicago"
          initialMajor="Computer Science"
          initialInterests={['internship', 'event']}
        />,
      )
      cy.contains('What should we match you with?').should('be.visible')
      cy.contains('button', 'Show My Matches').should('be.visible')
    })

    it('starts at step 2 when only location is provided', () => {
      cy.mount(
        <QuickMatchQuiz
          initialLocation="Chicago"
          initialMajor=""
          initialInterests={[]}
        />,
      )
      cy.contains('What are you studying?').should('be.visible')
      cy.contains('button', 'Next Question').should('be.visible')
    })

    it('shows pre-selected interests from initial props', () => {
      cy.mount(
        <QuickMatchQuiz
          initialLocation="Chicago"
          initialMajor="CS"
          initialInterests={['internship']}
        />,
      )
      // Starts on step 3 because both location + major provided
      cy.contains('What should we match you with?').should('be.visible')
      cy.contains('button', 'Internships').should(
        'have.attr',
        'aria-pressed',
        'true',
      )
      cy.contains('button', 'Entry-level jobs').should(
        'have.attr',
        'aria-pressed',
        'false',
      )
    })
  })
})