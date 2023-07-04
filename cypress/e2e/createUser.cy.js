/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

describe('Creation of user (Admin)', () => {

    before(() => {
        const email = 'admin@gmail.com';
        const pass = 'password';
        cy.adminlogin(email, pass);
    })

    it('should open and load the form with populated data', () => {
        const email = chance.email({ domain: 'nycobs.com' });
        const name = chance.name();
        const number = chance.integer({ min: 8, max: 9 }) + chance.string({ length: 7, pool: '0123456789' });

        cy.get('button[id=open-modal-button]').click();
        cy.get('input[id=name-input]').should('exist');
        cy.get('input[id=email-input]').type(email);
        cy.get('input[id=number-input]').type(number);
        cy.get('input[id=password-input]').should('exist');

        cy.get('select[id=role-input]').select('1').should('have.value', '1')
        cy.get('select[id=permission-input]').should('be.disabled');
    })
})