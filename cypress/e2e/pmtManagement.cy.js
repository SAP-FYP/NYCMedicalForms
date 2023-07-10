/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

let authToken;

before(() => {
    const emailLogin = 'pmt2@gmail.com';
    const passLogin = 'Password1!';
    cy.adminlogin(emailLogin, passLogin);
    cy.getCookie('jwt').then((cookie) => {
        authToken = cookie.value;
    })
})

beforeEach(() => {
    cy.setCookie('jwt', authToken);
    cy.visit('http://localhost:3000/obs-admin/obs-management/');
})

describe('Forms Bulk Export', () => {
    it('should export all forms when selected top checkbox', () => {
        cy.get('checkbox[id=checkBoxTop]').click();
        cy.get('img[id=export-icon-all]').click()
        cy.get('.alert-success').should('be.visible');
    }) 

    it('should still export all forms when deselected one of the checkboxes', () => {
        cy.get('checkbox[id=checkBoxTop]').click();
        cy.get('checkbox[class=checkBox-formid-1]').click();
        cy.get('img[id=export-icon-all]').click()
        cy.get('.alert-success').should('be.visible');
    }) 

    it('should export selected forms only', () => {
        cy.get('checkbox[class=checkBox-formid-1]').click();
        cy.get('checkbox[class=checkBox-formid-2]').click();
        cy.get('checkbox[class=checkBox-formid-3]').click();
        cy.get('img[id=export-icon-all]').click()
        cy.get('.alert-success').should('be.visible');
    }) 

    it('should export selected forms only when viewing a form', () => {
        cy.get('td[id=modalBtn-studentId-3]').click();
        cy.get('button[id=closeBtn-studentid-3]').click()
        cy.get('td[id=modalBtn-studentId-2]').click();
        cy.get('button[id=exportBtn-studentid-2]').click();
        cy.get('button[id=closeBtn-studentid-2]').click()
        cy.get('.alert-success').should('be.visible');
    }) 
})

describe('Approving and rejecting of forms', () => {
    it('should approve the selected form', () => {
        cy.get('td[id=modalBtn-studentId-3]').click();
        cy.get('button[id=approveBtn-studentid-3]').click()
        cy.get('.alert-success').should('be.visible');
        cy.get('td[id=modalBtn-studentId-3]').click();
        cy.get('.alert-success').should('be.visible');
    }) 

    it('should reject the selected form', () => {
        cy.get('td[id=modalBtn-studentId-4]').click();
        cy.get('button[id=approveBtn-studentid-4]').click()
        cy.get('.alert-success').should('be.visible');
        cy.get('td[id=modalBtn-studentId-4]').click();
        cy.get('.alert-success').should('be.visible');
    }) 
})

