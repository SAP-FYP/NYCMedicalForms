/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

after(() => {
  cy.then(Cypress.session.clearAllSavedSessions);
})

// Before each test, create a form that requires parent acknowledgement
beforeEach(() => {
    cy.createForm(true);
    
})
