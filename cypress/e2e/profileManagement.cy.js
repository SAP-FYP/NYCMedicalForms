/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

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