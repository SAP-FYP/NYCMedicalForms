/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();
const randomName = chance.name()
const minDate = new Date('2005-01-01'); // Define the minimum date
const maxDate = new Date('2022-12-31'); // Define the maximum date

const randomDate = chance.date({ min: minDate, max: maxDate });
const formattedDate = randomDate.toISOString().substring(0, 10);
const randomNumber = chance.integer({ min: 1, max: 147 });
const nricPattern = /^[STFG]\d{7}[A-Z]$/i;
let randomNRIC;
do {
  randomNRIC = chance.string({ length: 9, alpha: true, numeric: true }).toUpperCase();
} while (!nricPattern.test(randomNRIC));

let authToken;

before(() => {
  const emailLogin = 'rltk4545@gomail.com';
  const passLogin = 'PASSword1*';
  cy.doctorlogin(emailLogin, passLogin);
  cy.getCookie('jwt').then((cookie) => {
    authToken = cookie.value;
  })
});

beforeEach(() => {
  cy.setCookie('jwt', authToken);
  cy.visit('http://localhost:3000/obs-form');
});

describe('fill in the form', () => {
  // it('fill in the form information', () => {
  //   const doctorMCR = 'MCR Value1111';
  //   cy.checkMCR(doctorMCR);
  // })

  it('should retrieve the correct doctor information', () => {
    cy.fillInForm(randomName, formattedDate, randomNumber, randomNRIC);
  })
});
