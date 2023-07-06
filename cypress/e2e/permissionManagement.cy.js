/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

const name = chance.string({ length: 10 });
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
    cy.visit('http://localhost:3000/obs-admin/admin/permissions');
})

describe('Permission Creation', () => {

    it('should create a new permission with valid data', () => {
        cy.get('button[id=open-modal-button]').click();
        cy.get('input[id=name-input]').click().type(name);
        cy.get('input[id=checkbox_1]').should('be.disabled');

        cy.get('input[id=confirm-permission-icon]').click();
        cy.get('.alert-success').should('be.visible');
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
