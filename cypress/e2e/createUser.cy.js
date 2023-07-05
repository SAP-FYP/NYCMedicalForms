/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

describe('Creation of valid user', () => {
    const email = chance.email({ domain: 'nycobs.com' });
    const name = chance.name();
    const number = chance.integer({ min: 8, max: 9 }) + chance.string({ length: 7, pool: '0123456789' });
    let authToken;

    before(() => {
        const emailLogin = 'admin@gmail.com';
        const passLogin = 'password';
        cy.adminlogin(emailLogin, passLogin);
        cy.getCookie('jwt').then((cookie) => {
            authToken = cookie.value;
        })
    })

    beforeEach(() => {
        cy.setCookie('jwt', authToken);
        cy.visit('http://localhost:3000/obs-admin/admin');
    })

    // it('should submit the form with valid input', () => {
    //     cy.get('button[id=open-modal-button]').click();

    //     cy.get('select[id=role-input]').select('1').should('have.value', '1')
    //     cy.get('select[id=permission-input]').should('be.disabled');
    //     cy.get('input[id=password-input]').should('exist');

    //     cy.get('input[id=name-input]').type(name);
    //     cy.get('input[id=email-input]').type(email);
    //     cy.get('input[id=number-input]').type(number);

    //     cy.get('input[id=confirm-user-icon]').click();
    //     cy.get('.alert-success').should('be.visible');
    // })

    // it('should search the created user', () => {
    //     cy.get('input[id=search-input]').type(name);
    //     cy.get('button[id=search-button]').wait(500).click();
    //     cy.get('div[id=insert-user-template]').contains(name);
    // })

    // it('should show error messages and prevent submission of form', () => {
    //     cy.get('button[id=open-modal-button]').click();
    //     cy.get('input[id=confirm-user-icon]').click();
    //     cy.get('input[id=name-input]').next('.invalid-tooltip').should('be.visible');
    //     cy.get('select[id=role-input]').next('.invalid-tooltip').should('be.visible');
    //     cy.get('select[id=permission-input]').next('.invalid-tooltip').should('be.visible');
    //     cy.get('input[id=email-input]').next('.invalid-tooltip').should('be.visible');
    //     cy.get('input[id=number-input]').next('.invalid-tooltip').should('be.visible');
    // })

    it('should show not allow duplication of email', () => {
        let existingEmail;

        cy.get('#insert-user-template')
            .find('.item-container')
            .first()
            .find('.user-info')
            .find('#user-email')
            .invoke('text')
            .then((text) => {
                existingEmail = text;
                console.log(existingEmail)
            });
    })
})  