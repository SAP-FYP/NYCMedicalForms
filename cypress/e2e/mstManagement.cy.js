/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

let authToken;

before(() => {
    const emailLogin = 'cypressMST@gmail.com';
    const passLogin = 'Password1!';
    cy.managementLogin(emailLogin, passLogin);
    cy.getCookie('jwt').then((cookie) => {
        authToken = cookie.value;
    })
})

beforeEach(() => {
    cy.viewport(1669, 937);
    cy.wait(500)
    cy.setCookie('jwt', authToken);
    cy.visit('http://localhost:3000/obs-admin/obs-management/');
})


describe('Reviewing forms', () => {
    it('should submit a review', () => {
        cy.wait(1300)
        cy.get('td[id=modalBtn-studentId-1]').eq(0).click();
        cy.get('textarea[id=mst-review]').click().type('change review hello');
        cy.wait(500)
        cy.get('div[class="btn btn-primary btn-sm submitReviewBtn"]').contains('Submit Review').click()
        cy.wait(1000);
        cy.get('.alert-success').should('be.visible');
    }) 

    it('should delete a review', () => {
        cy.wait(1500)
        cy.get('td[id=modalBtn-studentId-1]').eq(0).click();
        cy.get('textarea[id=mst-review]').click().type('{selectall}{backspace}');
        cy.wait(500)
        cy.get('div[class="btn btn-primary btn-sm submitReviewBtn"]').contains('Submit Review').click()
        cy.wait(1000);
        cy.get('.alert-warning').should('be.visible');
    }) 
})

