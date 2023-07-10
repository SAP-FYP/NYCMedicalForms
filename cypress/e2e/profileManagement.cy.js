/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

const number = chance.integer({ min: 8, max: 9 }) + chance.string({ length: 7, pool: '0123456789' });
let authToken;

before(() => {
    const emailLogin = 'cypresstest@gmail.com';
    const passLogin = 'Password1!';
    cy.adminlogin(emailLogin, passLogin);
    cy.getCookie('jwt').then((cookie) => {
        authToken = cookie.value;
    })
})

beforeEach(() => {
    cy.setCookie('jwt', authToken).wait(1000);
    cy.visit('http://localhost:3000/obs-admin/profile');
})

describe('Update user profile', () => {

    it('should update the user\'s number', () => {
        cy.get('input[id=input-name]').should('have.value', 'Cypress Test Account')
        cy.get('input[id=input-number]').clear();
        cy.get('input[id=input-number]').type(number);
        cy.get('input[id=input-password]').type('Password1!');
        cy.get('button[id=save-changes-button]').click();
        cy.get('.alert-success').should('be.visible').contains('Successfully updated profile.').wait(1000);
        cy.getCookie('jwt').then((cookie) => {
            authToken = cookie.value;
        }).wait(1000);

        cy.setCookie('jwt', authToken).wait(1000);
        cy.visit('http://localhost:3000/obs-admin/profile');
        cy.get('input[id=input-number]').should('have.value', number);
    })
})

describe('Update user password', () => {

    it('should not update the user\'s password with wrong password', () => {
        cy.get('input[id=input-name]').should('have.value', 'Cypress Test Account')
        cy.get('button[id=change-password-button]').click().wait(500);
        cy.get('input[id=current-input]').click().wait(500).type('wrongpassword');
        cy.get('input[id=new-input]').type('Password2!');
        cy.get('input[id=confirm-input]').type('Password2!');
        cy.get('input[id=confirm-password-icon]').click();
        cy.get('.alert-danger').should('be.visible').contains('Invalid email or password.').wait(1000);
    })

    it('should update the user\'s password with correct password', () => {
        cy.get('input[id=input-name]').should('have.value', 'Cypress Test Account')
        cy.get('button[id=change-password-button]').click().wait(500);
        cy.get('input[id=current-input]').click().wait(500).type('Password1!');
        cy.get('input[id=new-input]').type('Password2!');
        cy.get('input[id=confirm-input]').type('Password2!');
        cy.get('input[id=confirm-password-icon]').click();
        cy.get('.alert-success').should('be.visible').contains('Password updated successfully.').wait(1000);
        cy.getCookie('jwt').then((cookie) => {
            authToken = cookie.value;
        }).wait(1000);
    })

    it('should change back the user\'s password', () => {
        cy.get('input[id=input-name]').should('have.value', 'Cypress Test Account')
        cy.get('button[id=change-password-button]').click().wait(500);
        cy.get('input[id=current-input]').click().wait(500).type('Password2!');
        cy.get('input[id=new-input]').type('Password1!');
        cy.get('input[id=confirm-input]').type('Password1!');
        cy.get('input[id=confirm-password-icon]').click();
        cy.get('.alert-success').should('be.visible').contains('Password updated successfully.');
    })
})