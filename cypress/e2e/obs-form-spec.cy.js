/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

let authToken;

before(() => {
    const emailLogin = 'rltk4545@gomail.com';
    const passLogin = 'PASSword1*';
    cy.login(emailLogin, passLogin);
    cy.getCookie('jwt').then((cookie) => {
        authToken = cookie.value;
    })
})

beforeEach(() => {
    cy.setCookie('jwt', authToken);
    cy.visit('http://localhost:3000/obs-form');
})

describe('Check MCR (Doctor)', () => {
  it('should retrieve the correct doctor information', () => {
    const doctorMCR = 'MCR Value1111';
    cy.checkMCR(doctorMCR);
  })
})
