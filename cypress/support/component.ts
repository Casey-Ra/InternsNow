// ***********************************************************
// Component Testing Support File
// https://on.cypress.io/component-testing
// ***********************************************************

import './commands';
import '@testing-library/cypress/add-commands';

// Import global styles for component tests
import '../../app/globals.css';

// Mounting helper for Next.js components
import { mount } from 'cypress/react18';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', mount);
