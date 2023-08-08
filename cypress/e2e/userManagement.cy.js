/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

const email = chance.email({ domain: 'nycobs.com' });
const name = chance.name();
const number = chance.integer({ min: 8, max: 9 }) + chance.string({ length: 7, pool: '0123456789' });

beforeEach(() => {
    const emailLogin = 'admin@gmail.com';
    const passLogin = 'password';
    cy.adminlogin(emailLogin, passLogin);
    cy.visit('http://localhost:3000/obs-admin/admin');
})

after(() => {
    cy.then(Cypress.session.clearAllSavedSessions);
})

describe('User Creation', () => {

    it('should create a new user with valid data', () => {
        cy.get('button[id=open-modal-button]').click();

        cy.get('select[id=role-input]').select('1').should('have.value', '1')
        cy.get('select[id=permission-input]').should('be.disabled');
        cy.get('input[id=password-input]').should('exist');

        cy.get('input[id=name-input]').click().type(name);
        cy.get('input[id=email-input]').type(email);
        cy.get('input[id=number-input]').type(number);

        cy.get('input[id=confirm-user-icon]').click({ force: true });
        cy.wait(1000);
        cy.get('.alert-success').should('be.visible');
    })

    it('should not allow creation of user with duplicated email', () => {
        cy.get('#insert-user-template')
            .find('.item-container')
            .first()
            .find('.user-info')
            .find('#user-email')
            .invoke('text')
            .then((text) => {
                cy.get('button[id=open-modal-button]').click();

                cy.get('select[id=role-input]').select('1').should('have.value', '1')
                cy.get('select[id=permission-input]').should('be.disabled');
                cy.get('input[id=password-input]').should('exist');

                cy.get('input[id=name-input]').click().type(name);
                cy.get('input[id=email-input]').type(text);
                cy.get('input[id=number-input]').type(number);

                cy.get('input[id=confirm-user-icon]').click();
                cy.get('.alert-danger').should('be.visible').contains('Account already exists.')
            });
    })

    it('should show error messages and prevent submission of form', () => {
        cy.get('button[id=open-modal-button]').click();
        cy.get('input[id=confirm-user-icon]').click();
        cy.get('input[id=name-input]').next('.invalid-tooltip').should('be.visible');
        cy.get('select[id=role-input]').next('.invalid-tooltip').should('be.visible');
        cy.get('select[id=permission-input]').next('.invalid-tooltip').should('be.visible');
        cy.get('input[id=email-input]').next('.invalid-tooltip').should('be.visible');
        cy.get('input[id=number-input]').next('.invalid-tooltip').should('be.visible');
    })
})

describe('User Filtering', () => {
    it('should filter and display the searched user', () => {
        cy.get('input[id=search-input]').type(name);
        cy.get('button[id=search-button]').wait(1000).click();
        cy.get('div[id=insert-user-template]').should('contain', name);
    })
})

describe('User Editing', () => {

    it('should edit the user successfully', () => {
        cy.get('input[id=search-input]').type(name);
        cy.get('button[id=search-button]').wait(1000).click();
        cy.get('div[id=insert-user-template]').should('contain', name);
        cy.get('.more-button-icon').first().click();
        cy.get(`[value="${email}"]`)
            .siblings('.dropdown-menu')
            .find('.dropdown-edit')
            .click({ force: true });
        cy.get('input[id=email-input]').should('be.disabled');
        cy.get('input[id=name-input]').click().type(' test');
        cy.get('select[id=role-input]').select('2').should('have.value', '2');
        cy.get('select[id=permission-input]').select('155').should('have.value', '155');
        cy.get('input[id=password-input').click();
        cy.get('.alert-success').should('be.visible').contains('The password has been successfully reset.');
        cy.get('input[id=edit-user-icon]').click();
        cy.get('.alert-success').should('be.visible').contains('Successfully edited user.');
    })
})

describe('User Disabling / Enabling (Single)', () => {

    it('should disable the user', () => {
        cy.get('input[id=search-input]').type(name);
        cy.get('button[id=search-button]').wait(1000).click();
        cy.get('div[id=insert-user-template]').should('contain', name);
        cy.get('.more-button-icon').first().click();
        cy.get(`[value="${email}"]`)
            .siblings('.dropdown-menu')
            .find('.dropdown-disable')
            .click({ force: true })
        cy.get('button[id=confirmation-disable-button]').click();
        cy.get('.alert-success').should('be.visible').contains('Successfully disabled user.');
    })

    it('should enable the user', () => {
        cy.get('input[id=search-input]').type(name);
        cy.get('button[id=search-button]').wait(1000).click();
        cy.get('div[id=insert-user-template]').should('contain', name);
        cy.get('.more-button-icon').first().click();
        cy.get(`[value="${email}"]`)
            .siblings('.dropdown-menu')
            .find('.dropdown-disable')
            .click({ force: true })
        cy.get('button[id=confirmation-enable-button]').click();
        cy.get('.alert-success').should('be.visible').contains('Successfully enabled user.');
    })
})

describe('User Deletion (Single)', () => {

    it('should delete the user', () => {
        cy.get('input[id=search-input]').type(name);
        cy.get('button[id=search-button]').wait(1000).click();
        cy.get('div[id=insert-user-template]').should('contain', name);
        cy.get('.more-button-icon').first().click();
        cy.get(`[value="${email}"]`)
            .siblings('.dropdown-menu')
            .find('.dropdown-delete')
            .click({ force: true })
        cy.get('button[id=confirmation-delete-button]').click();
        cy.get('.alert-success').should('be.visible').contains('Successfully deleted user.');
    })
})