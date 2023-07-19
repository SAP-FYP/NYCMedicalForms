/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

const number = chance.integer({ min: 8, max: 9 }) + chance.string({ length: 7, pool: '0123456789' });
const emailLogin = 'cypresstest@gmail.com';
const passLogin = 'Password1!';

after(() => {
    cy.then(Cypress.session.clearAllSavedSessions);
})

describe('Update user profile', () => {
    beforeEach(() => {
        cy.adminlogin(emailLogin, passLogin);
        cy.visit('http://localhost:3000/obs-admin/profile');
    })

    it('should update the user\'s number', () => {
        cy.get('input[id=input-name]').should('have.value', 'Cypress Test Account')
        cy.get('input[id=input-number]').clear();
        cy.get('input[id=input-number]').type(number);
        cy.get('button[id=save-changes-button]').click();
        cy.get('input[id=enter-password-input]').should('be.visible').click().wait(500).type('Password1!');
        cy.get('input[id=submit-password-btn]').click();
        cy.get('.alert-success').should('be.visible').contains('Successfully updated profile.');
        cy.then(Cypress.session.clearAllSavedSessions)
    })
})

describe('Update user password', () => {
    before(() => {
        cy.adminlogin(emailLogin, passLogin);
        cy.visit('http://localhost:3000/obs-admin/profile');
    })

    it('should not update the user\'s password with wrong password', () => {
        cy.get('input[id=input-name]').should('have.value', 'Cypress Test Account')
        cy.get('button[id=change-password-button]').click().wait(500);
        cy.get('input[id=current-input]').click().wait(500).type('wrongpassword');
        cy.get('input[id=new-input]').type('Password2!');
        cy.get('input[id=confirm-input]').type('Password2!');
        cy.get('input[id=confirm-password-icon]').click();
        cy.get('.alert-danger').should('be.visible').contains('Invalid email or password.');
    })

    it('should update the user\'s password with correct password', () => {
        cy.adminlogin(emailLogin, passLogin);
        cy.visit('http://localhost:3000/obs-admin/profile');
        cy.get('input[id=input-name]').should('have.value', 'Cypress Test Account')
        cy.get('button[id=change-password-button]').click().wait(500);
        cy.get('input[id=current-input]').click().wait(500).type('Password1!');
        cy.get('input[id=new-input]').type('Password2!');
        cy.get('input[id=confirm-input]').type('Password2!');
        cy.get('input[id=confirm-password-icon]').click();
        cy.get('.alert-success').should('be.visible').contains('Password updated successfully.');
        cy.then(Cypress.session.clearAllSavedSessions)
    })

    it('should change back the user\'s password', () => {
        cy.adminlogin(emailLogin, 'Password2!');
        cy.visit('http://localhost:3000/obs-admin/profile');

        let password = {
            newPassword: passLogin,
            confirmPassword: passLogin,
            currentPassword: 'Password2!'
        }

        cy.request({
            method: 'PUT',
            url: '/user/password',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
            followRedirect: false
        }).then((response) => {
            expect(response.status).to.eq(200);
        })
    })
})