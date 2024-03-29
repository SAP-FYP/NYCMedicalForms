/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

const name = chance.string({ length: 10 });

beforeEach(() => {
    const emailLogin = 'admin@gmail.com';
    const passLogin = 'password';
    cy.adminlogin(emailLogin, passLogin);
    cy.visit('http://localhost:3000/obs-admin/admin/permissions');
})

after(() => {
    cy.then(Cypress.session.clearAllSavedSessions);
})

describe('Permission Creation', () => {

    it('should create a new permission with valid data', () => {
        cy.get('button[id=open-modal-button]').click();
        cy.get('input[id=name-input]').clear().wait(200).type(name);
        cy.get('input[id=checkbox_1]').should('be.disabled');

        cy.get('input[id=confirm-permission-icon]').click();
        cy.get('.alert-success').should('be.visible').wait(1000);
    })

    it('should not allow creation of permission with duplicated name', () => {
        cy.get('button[id=open-modal-button]').click();
        cy.get('input[id=name-input]').clear().wait(200).type(name);
        cy.get('input[id=checkbox_1]').should('be.disabled');

        cy.get('input[id=confirm-permission-icon]').click();
        cy.get('.alert-danger').should('be.visible').contains("Permission group already exists.").wait(1000);;
    })

    it('should show error messages and prevent submission of form', () => {
        cy.get('button[id=open-modal-button]').click();
        cy.get('input[id=confirm-permission-icon]').click();
        cy.get('.alert-danger').should('be.visible').contains("Please fill in all fields and select at least 1 permission.").wait(1000);;
    })
})

describe('Permission Group Filtering', () => {

    it('should filter and display the searched permission group', () => {
        cy.get('input[id=search-input]').type(name);
        cy.get('button[id=search-button]').wait(1000).click();
        cy.get('div[id=insert-permission-group-template]').should('contain', name);
    })
})

describe('Permission Group Editing', () => {

    it('should edit the permisison group successfully', () => {
        cy.get('input[id=search-input]').type(name);
        cy.get('button[id=search-button]').wait(1000).click();
        cy.get('div[id=insert-permission-group-template]').should('contain', name);
        cy.get('.more-button-icon').first().click();
        cy.get('.dropdown-edit').click({ force: true });

        cy.get('input[id=name-input]').click().type(' test');
        cy.get('input[id=checkbox_2]').click();
        cy.get('input[id=checkbox_3]').click();
        cy.get('input[id=checkbox_7]').click();
        cy.get('input[id=edit-permission-icon]').click();
        cy.get('.alert-success').should('be.visible').contains('Permission group updated successfully.');
    })
})

describe('Permission Group Deletion', () => {

    it('should delete the permisison group successfully', () => {
        cy.get('input[id=search-input]').type(name);
        cy.get('button[id=search-button]').wait(1000).click();
        cy.get('div[id=insert-permission-group-template]').should('contain', name);
        cy.get('.more-button-icon').first().click();
        cy.get('.dropdown-delete').click({ force: true });

        cy.get('button[id=confirmation-delete-button]').click();
        cy.get('.alert-success').should('be.visible').contains('Permission group deleted successfully.');
    })
})