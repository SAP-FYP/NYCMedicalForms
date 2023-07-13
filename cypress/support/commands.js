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
Cypress.Commands.add('doctorlogin', (email, pass) => {
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

Cypress.Commands.add('parentlogin', (encrypted, pass) => {
    cy.visit(`http://localhost:3000/acknowledgement?encrypted=${encrypted}`)
    cy.get('input[id=login-password]').type(pass);
    cy.get('button[id=login-button]').click();
    cy.url().should('include', `/form?encrypted=${encrypted}`);
    cy.contains('Parent Section:');
})

Cypress.Commands.add('fillInParentForm', (parentName, parentNRIC, ) => {
    cy.get('input[id=parentName]').type(parentName);
    cy.get('input[id=parentNRIC]').type(parentNRIC);
})

Cypress.Commands.add('checkMCR', (doctorMCR) => {
    cy.get('input[id=doctorMCR]').type(doctorMCR);
    cy.get('button[id=availabilityBtn]').click();
});

Cypress.Commands.add('generateRandomContact', () => {
    const startingNo = ['8', '9'];
    const randomStartingChar = startingNo[Math.floor(Math.random() * startingNo.length)];
    const randomDigits = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');

    return randomStartingChar + randomDigits;
});

Cypress.Commands.add('adminlogin', (email, pass) => {
    cy.session(
        [email, pass],
        () => {
            cy.visit('http://localhost:3000/obs-admin/login');
            cy.get('input[id=login-email]').type(email);
            cy.get('input[id=login-password]').type(pass);
            cy.get('button[id=login-button]').click();
            cy.get('#header-bar').should('have.class', 'col-12');
        },
        {
            validate() {
                cy.getCookie('jwt').should('exist');
            }
        }
    )
})