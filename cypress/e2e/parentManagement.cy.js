/// <reference types="cypress" />

import Chance from 'chance';
const chance = new Chance();

const randomName = chance.name()
function generateNRIC() {
    const weights = [2, 7, 6, 5, 4, 3, 2];
    const checkTable = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'Z', 'J'];
    const firstLetters = ['S', 'M', 'G', 'T', 'F'];

    // Randomly select the first letter from the array of allowed letters
    const firstLetter = firstLetters[Math.floor(Math.random() * firstLetters.length)];

    // Generate a random offset value based on the selected first letter
    let offset = 0;
    if (firstLetter === 'G' || firstLetter === 'T') {
        offset = 4;
    } else if (firstLetter === 'F') {
        offset = 5;
    } else if (firstLetter === 'S' || firstLetter === 'T') {
        offset = 0;
    } else if (firstLetter === 'M') {
        offset = 3;
    }

    // Generate a random 7-digit number
    const randomDigits = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');

    // Calculate the sum of digits multiplied by weights
    let sum = offset;
    for (let i = 1; i < 8; i++) {
        const digit = parseInt(randomDigits.charAt(i - 1));
        sum += digit * weights[i - 1];
    }

    // Calculate the remainder and check digit
    const remainder = sum % 11;
    const checkDigit = 11 - remainder - 1;

    // Get the last letter based on the check digit
    const lastLetter = checkTable[checkDigit];

    // Combine the generated values to form the NRIC
    const generatedNRIC = firstLetter + randomDigits + lastLetter;

    // Return only last 4 character of the NRIC
    return generatedNRIC;
}

// Doctor MCR generator
const randomMCR = chance.integer({ min: 100000, max: 999999 });


const randomSecondarySchool = chance.pickone([
    'Anglican High School',
    'Assumption English School',
    'Beatty Secondary School',
    'Bedok Green Secondary School',
    'Bedok South Secondary School',
    'Bedok View Secondary School',
    'Bendemeer Secondary School',
    'Bishan Park Secondary School',
])

// random Class generator
const randomNumber = chance.integer({ min: 1, max: 147 });

// Random birthdate generator
const minDate = new Date('2005-01-01'); // Define the minimum date
const maxDate = new Date('2010-12-31'); // Define the maximum date

// Generate random Singapore date
const randomDate = chance.date({ min: minDate, max: maxDate });
/// Format Like
let dd = String(randomDate.getDate()).padStart(2, '0');
let mm = String(randomDate.getMonth() + 1).padStart(2, '0'); //January is 0!
let yyyy = randomDate.getFullYear();
const randomSGDate = yyyy + '-' + mm + '-' + dd;

// Random vaccination date generator
const minVaccinationDate = new Date('2011-01-01'); // Define the minimum date
const maxVaccinationDate = new Date('2012-12-31'); // Define the maximum date

const randomVaccinationDate = chance.date({ min: minVaccinationDate, max: maxVaccinationDate });
const formattedDate = randomVaccinationDate.toISOString().substring(0, 10);
// Random email generator
const randomEmail = chance.email();
const phone = "97873648"
after(() => {
    cy.then(Cypress.session.clearAllSavedSessions);
})

// Before test, create a form that requires parent acknowledgement
before(() => {
    const studentNRIC = generateNRIC().slice(-4);
    const emailLogin = 'rltk4545@gomail.com';
    const passLogin = 'PASSword1*';

    cy.doctorlogin(emailLogin, passLogin);
    cy.getCookie('jwt').then((cookie) => {
        const authToken = cookie.value;
        cy.setCookie('jwt', authToken);
    })

    cy.request({
        method: 'POST',
        url: '/postStudentInfo',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            studentName: randomName,
            schoolName: randomSecondarySchool,
            dateOfBirth: randomSGDate,
            studentNRIC: studentNRIC,
            studentClass: randomNumber,
            dateOfVaccine: formattedDate,
        }),
    }).then((response) => {
        const studentID = response.body[0].insertId;
        cy.request({
            method: 'POST',
            url: '/postAcknowledge',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: studentID,
                parentContactNo: phone,
                parentEmail: randomEmail,
            }),
        })

        cy.request({
            method: 'POST',
            url: 'postFormInfo',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: studentID,
                courseDate: formattedDate,
                doctorMCR: randomMCR,
                doctorName: 'Dr. Test',
                eligibility: 'Fit',
                comments: 'Test',
                date: new Date().toISOString().slice(0, 10),
            })
        })

        cy.request({
            method: 'POST',
            url: '/postDoctorInfo',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                doctorMCR: randomMCR,
                physicianName: 'Dr. Test',
                signatureData: 'https://res.cloudinary.com/sp-esde-2100030/image/upload/v1686067397/lgbqfojafyafrzavrcev.png',
                clinicName: 'Test Clinic',
                clinicAddress: 'Test Clinic Address',
                doctorContact: '98275648',
            })
        })

        cy.request({
            method: 'POST',
            url: '/parent/cypress/encrypt',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentID: studentID,
            })
        }).then((response) => {
            const encrypted = response.body.encrypted;
            // Password = DDMMYYYY of student's birthdate + last 4 digits of student's NRIC
            const password = randomDate.getDate().toString().padStart(2, '0') + (randomDate.getMonth() + 1).toString().padStart(2, '0') + randomDate.getFullYear().toString() + studentNRIC.slice(-4);
            cy.parentLogin(encrypted, password);
        })
    })
})

describe('parent acknowledge', () => {
    it('Fill the form', () => {
        const parentName = chance.name();
        const parentNRIC = generateNRIC();
        cy.fillInParentForm(parentName, parentNRIC)
        cy.get("canvas[id=parent-signature-canvas]").trigger('mousedown', 'center')
            .click({ release: false })
            .trigger('mousemove', { clientX: 200, clientY: 300 })
            .trigger('mouseup', 5, 5)
            .trigger('mouseleave');
        // Click acknowledge button
        cy.get('button[id=acknowledge-button]').click();
        cy.get('button[id=acknowledge-button]').should('not.exist');
        cy.get('.alert-success').should('be.visible');

    })
})
