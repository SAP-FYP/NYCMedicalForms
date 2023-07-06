/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

describe('Login (Doctor)', () => {

  it('should login with the correct credentials', () => {
    const email = 'testing1@gmail.com';
    const pass = 'Password1!'
    cy.doctorlogin(email, pass);
  })

  it('should show error message with the wrong credentials', () => {
    const email = chance.email();
    const pass = 'wrongpassword'
    cy.visit('http://localhost:3000/login');
    cy.get('input[id=login-email]').type(email);
    cy.get('input[id=login-password]').type(pass);
    cy.get('button[id=login-button]').click();
    cy.get('#err-message-container').should('be.visible');
  })
})

describe('Login (Admin)', () => {

  it('should login with the correct credentials', () => {
    const email = 'admin@gmail.com';
    const pass = 'password'
    cy.adminlogin(email, pass);
  })

  it('should show error message with the wrong credentials', () => {
    const email = chance.email();
    const pass = "wrongpassword"
    cy.visit('http://localhost:3000/obs-admin/login');
    cy.get('input[id=login-email]').type(email);
    cy.get('input[id=login-password]').type(pass);
    cy.get('button[id=login-button]').click();
    cy.get('#err-message-container').should('be.visible');
  })
})

describe('Login (Doctor on Admin - Admin on Doctor)', () => {

  it('should not login admin on the doctor page', () => {
    const email = 'admin@gmail.com';
    const pass = 'password';
    cy.visit('http://localhost:3000/login');
    cy.get('input[id=login-email]').type(email);
    cy.get('input[id=login-password]').type(pass);
    cy.get('button[id=login-button]').click();
    cy.get('#err-message-container').should('be.visible');
  })

  it('should not login doctor on the admin page', () => {
    const email = 'testing1@gmail.com';
    const pass = 'Password1!';
    cy.visit('http://localhost:3000/obs-admin/login');
    cy.get('input[id=login-email]').type(email);
    cy.get('input[id=login-password]').type(pass);
    cy.get('button[id=login-button]').click();
    cy.get('#err-message-container').should('be.visible');
  })
})