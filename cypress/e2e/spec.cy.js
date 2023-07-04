/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

describe('Login (Doctor)', () => {

  it('should login with the correct credentials', () => {
    const email = 'testing1@gmail.com';
    const pass = "Password1!"
    cy.login(email, pass);
  })

  it('should show error message with the wrong credentials', () => {

    const email = chance.email();
    const pass = "wrongpassword"

    // Visit login page
    cy.visit('http://localhost:3000/login');

    // Fill out the form
    cy.get('input[id=login-email]').type(email);
    cy.get('input[id=login-password]').type(pass);
    cy.get('button[id=login-button]').click();

    // Check for login failure
    cy.get('#err-message-container').should('be.visible');
  })
})

describe('Login (Admin)', () => {

})
