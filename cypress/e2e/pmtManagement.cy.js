/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

let authToken;

before(() => {
    const emailLogin = 'cypressPmt@gmail.com';
    const passLogin = 'Password1!';
    cy.managementLogin(emailLogin, passLogin);
    cy.getCookie('jwt').then((cookie) => {
        authToken = cookie.value;
    })
})

beforeEach(() => {
    cy.viewport(1669, 937);
    cy.setCookie('jwt', authToken);
    cy.visit('http://localhost:3000/obs-admin/obs-management/');
    cy.request({
        method: 'PUT',
        url: '/obs-admin/pmt/4',
        body: {
            formStatus: 'Pending'
        }
    })
    cy.request({
        method: 'PUT',
        url: '/obs-admin/pmt/3',
        body: {
            formStatus: 'Pending'
        }
    })
})

describe('Forms Bulk Export', () => {
    it('should export all forms when selected top checkbox', () => {
        cy.wait(1500);
        cy.get('input[id=checkBoxTop]').click();
        cy.get('img[id=export-icon]').click()
        cy.wait(1000);
        cy.get('.alert-success').should('be.visible');
        cy.wait(1000);
    }) 

    it('should still export all forms when deselected one of the checkboxes', () => {
        cy.get('input[id=checkBoxTop]').click();
        cy.get('input[class=checkBox-formid-1]').click();
        cy.get('img[id=export-icon]').click()
        cy.wait(1000);
        cy.get('.alert-success').should('be.visible');
        cy.wait(1000);
    }) 

    it('should export selected forms only', () => {
        cy.get('input[class=checkBox-formid-1]').click();
        cy.get('input[class=checkBox-formid-2]').click();
        cy.get('input[class=checkBox-formid-3]').click();
        cy.get('img[id=export-icon]').click()
        cy.wait(1000);
        cy.get('.alert-success').should('be.visible');
        cy.wait(1000);
    }) 

    it('should export selected forms only when viewing a form', () => {
        cy.get('td[id=modalBtn-studentId-3]').eq(0).click();;
        cy.get('button[id=closeBtn-studentid-3]').click()
        cy.get('td[id=modalBtn-studentId-2]').eq(0).click({force: true});;
        cy.get('button[id=exportBtn-studentid-2]').eq(0).click({force: true});
        cy.wait(1000);
        cy.get('.alert-success').should('be.visible');
        cy.wait(1000);
    }) 
})


describe('Export by search bar', () => {
    it('should export the searched selections', () => {
        cy.get('input[id=searchInput]').type('cha');
        cy.get('input[id=searchInput]').type('{enter}');
        cy.wait(1000);
        cy.get('button[id=clear-button]').click();
        cy.wait(1000);
        cy.get('input[id=searchInput]').type('bar');
        cy.get('button[id=search-button]').click();
        cy.wait(1000);
        cy.get('input[id=checkBoxTop]').click();
        cy.get('img[id=export-icon]').click()
        cy.wait(1000);
        cy.get('.alert-success').should('be.visible');
        cy.wait(1000);
    }) 
})

describe('Export by filtering', () => {
    it('should export the searched selections', () => {
        cy.wait(1300);
        cy.get('button[id=filter-icon-container]').click();
        cy.get('div[id=schoolMenuButton]').click();
        cy.get('input[type="checkbox"][value="Ahmad Ibrahim Secondary School"]').click();
        cy.get('div[id=classMenuButton]').click();
        cy.get('input[type="checkbox"][value="Class A"]').click();
        cy.get('div[id=courseDateMenuButton]').click();
        cy.get('input[type="checkbox"][value="2023-03-02"]').click();
        cy.get('div[id=eligibilityMenuButton]').click();
        cy.get('input[type="checkbox"][value="Fit"]').click();
        cy.wait(1000);
        cy.get('input[id=checkBoxTop]').click();
        cy.get('img[id=export-icon]').click()
        cy.wait(500);
        cy.get('.alert-success').should('be.visible');
        cy.wait(1000);
    }) 
})

// use cy.intercept to intercept the request and return a response
describe('Approving and rejecting of forms', () => {
    //use cy.intercept
    it('should approve the selected form', () => {
        cy.wait(500);
        cy.get('td[id=modalBtn-studentId-3]').eq(0).click({force: true});
        cy.get('button[id=approveBtn-studentid-3]').eq(0).contains('Approve').click({force: true})
        cy.get('.alert-success').should('be.visible');
        cy.get('td[id=modalBtn-studentId-3]').eq(0).click({force: true});
        cy.wait(500);
        cy.get('.alert-success').should('be.visible');

        // Put form status back to pending
        cy.request({
            method: 'PUT',
            url: '/obs-admin/pmt/3',
            body: {
                formStatus: 'Pending'
            }
        })
    })

    it('should reject the selected form', () => {
        cy.wait(500);
        cy.get('td[id=modalBtn-studentId-4]').eq(0).click({force: true});
        cy.get('button[id=rejectBtn-studentid-4]').eq(0).contains('Reject').click({force: true})
        cy.get('.alert-success').should('be.visible');
        cy.get('td[id=modalBtn-studentId-4]').eq(0).click({force: true});
        cy.wait(500);
        cy.get('.alert-success').should('be.visible');
        cy.wait(1000);
        cy.get('button[id=closeBtn-studentid-4]').click({force: true})

        // Put form status back to pending
        cy.request({
            method: 'PUT',
            url: '/obs-admin/pmt/4',
            body: {
                formStatus: 'Pending'
            }
        })

    })
})


