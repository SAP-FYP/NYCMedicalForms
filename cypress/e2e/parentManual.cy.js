/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();
const today = new Date();
const minDate = new Date('2005-01-01');
const maxDate = new Date('2022-12-31');
// form input values
const studentName = chance.name();
const doctorName = chance.name();
const clinicAddress = chance.address();
const comment = chance.sentence();
const className = `Class ${chance.integer({ min: 1, max: 10 })}`
const schoolNumber = chance.integer({ min: 1, max: 147 });
const clinicName = `Clinic ${chance.word()}`
const doctorMCR = `CYPRESSMCR${chance.integer({ min: 1, max: 200 })}`

let studentNRIC = 'T0323657E';
let doctorContact;

const dateOfBirth = '2003-07-29';
const courseDate = chance.date({ min: minDate, max: maxDate }).toISOString().substring(0, 10);
const newCourseDate = chance.date({ min: minDate, max: maxDate }).toISOString().substring(0, 10);
const vaccineDate = chance.date({ min: minDate, max: maxDate }).toISOString().substring(0, 10);
const todayDate = today.toISOString().substring(0, 10);

let authToken;

before(() => {
  cy.generateRandomContact().then((generatedContact) => {
    doctorContact = generatedContact; // Assign the generated NRIC to the global variable
  });
});

beforeEach(() => {
  const emailLogin = 'rltk4545@gomail.com';
  const passLogin = 'PASSword1*';
  cy.doctorlogin(emailLogin, passLogin);
});

describe('Filling in all the form details', () => {
  it('should submit the form successfully', () => {
    const parentEmail = 'leebarry008@gmail.com';
    const parentContact = '89490850';
    cy.get('input[id=studentName]').type(studentName);
    cy.get('input[id=dateOfBirth]').type(dateOfBirth);
    cy.get('button[id=schoolName]').click();
    cy.get(`li[id=school${schoolNumber}]`).click();
    cy.get('input[id=studentNRIC]').type(studentNRIC);
    cy.get('input[id=studentClass]').type(className);
    cy.get('input[id=courseDate]').type(courseDate);
    cy.get('input[id=dateOfVaccine]').type(vaccineDate);
    cy.get('input[name="eligibility"][value="Fit With Condition"]').check();
    cy.get('textarea[id=comment]').type(comment);
    cy.get('#acknowledgeCheckBox').check();
    cy.get('input[id=parentEmail]').type(parentEmail);
    cy.get('input[id=parentContact]').type(parentContact);
    cy.get('input[id=doctorMCR]').type(doctorMCR);
    cy.get('button[id=availabilityBtn]').click();
    cy.get('input[id=physicianName]').type(doctorName);
    cy.get('input[id=clinicName]').type(clinicName);
    cy.get('input[id=date]').type(todayDate);
    cy.get('input[id=doctorContact]').type(doctorContact);
    cy.get('input[id=clinicAddress]').type(clinicAddress);

    cy.get("canvas[id=signatureCanvas]").trigger('mousedown', 'center')
      .click({ release: false })
      .trigger('mousemove', { clientX: 200, clientY: 300 })
      .trigger('mouseup', 5, 5)
      .trigger('mouseleave');

    cy.get('button[id=submitBtn]').click().wait(3000);
    cy.get('.alert-success').should('be.visible').contains('Submit Succesful');
    cy.wait(1000);
  })
});