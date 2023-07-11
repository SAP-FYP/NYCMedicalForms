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
    cy.get('input[id=doctorMCR]').type(doctorMCR);
    cy.get('button[id=availabilityBtn]').click();
});

Cypress.Commands.add('fillInForm', (studentName,dateOfBirth,randomNumber,randomNRIC) => {
  console.log(dateOfBirth)
  cy.get('input[id=studentName]').type(studentName);
  cy.get('input[id=dateOfBirth]').type(dateOfBirth);
  cy.get('button[id=schoolName]').click();
  cy.get(`li[id=school${randomNumber}]`).click();
  cy.get('input[id=studentNRIC]').type(randomNRIC);
});