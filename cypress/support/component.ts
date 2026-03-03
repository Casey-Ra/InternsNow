/* eslint-disable @typescript-eslint/no-namespace */

// Component Testing Support File

import './commands'
import '@testing-library/cypress/add-commands'

import { mount } from 'cypress/react'

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)