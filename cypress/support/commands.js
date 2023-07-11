// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (email, pass) => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[id=login-email]').type(email);
    cy.get('input[id=login-password]').type(pass);
    cy.get('button[id=login-button]').click();
    cy.url().should('include', '/obs-form');
    cy.contains('Student Section');
})

Cypress.Commands.add('managementLogin', (email, pass) => {
    cy.visit('http://localhost:3000/obs-admin/login');
    cy.get('input[id=login-email]').type(email);
    cy.get('input[id=login-password]').type(pass);
    cy.get('button[id=login-button]').click();
    cy.url().should('include', '/obs-management');
    cy.contains('Overview');
})

Cypress.Commands.add('checkMCR', (doctorMCR) => {
    cy.visit('http://localhost:3000/obs-form');
    cy.get('input[id=doctorMCR]').type(doctorMCR);
    cy.get('button[id=availabilityBtn]').click();
    cy.url().should('include', '/obs-form');
    cy.contains('Student Section');
})

let LOCAL_STORAGE_MEMORY = {};

Cypress.Commands.add("saveLocalStorage", () => {
  Object.keys(localStorage).forEach(key => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key];
  });
});

Cypress.Commands.add("restoreLocalStorage", () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
  });
});