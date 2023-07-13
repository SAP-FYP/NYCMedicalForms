// /// <reference types="cypress" />

// import Chance from 'chance';
// const chance = new Chance();

// const randomName = chance.name()
// const generateNRIC = () => {
//     const weights = [2, 7, 6, 5, 4, 3, 2];
//     const checkTable = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'Z', 'J'];

//     // Generate a random offset value between 0 and 4
//     const offset = Math.floor(Math.random() * 5);

//     // Generate a random 7-digit number
//     const randomDigits = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');

//     // Calculate the sum of digits multiplied by weights
//     let sum = offset;
//     for (let i = 1; i < 8; i++) {
//         const digit = parseInt(randomDigits.charAt(i - 1));
//         sum += digit * weights[i - 1];
//     }

//     // Calculate the remainder and check digit
//     const remainder = sum % 11;
//     const checkDigit = 11 - remainder - 1;

//     // Get the last letter based on the check digit
//     const lastLetter = checkTable[checkDigit];

//     // Combine the generated values to form the NRIC
//     const generatedNRIC = checkTable[offset] + randomDigits + lastLetter;

//     return generatedNRIC;
// }


// const randomSecondarySchool = chance.pickone([
//     'Anglican High School',
//     'Assumption English School',
//     'Beatty Secondary School',
//     'Bedok Green Secondary School',
//     'Bedok South Secondary School',
//     'Bedok View Secondary School',
//     'Bendemeer Secondary School',
//     'Bishan Park Secondary School',
// ])

// // random Class generator
// const randomNumber = chance.integer({ min: 1, max: 147 });

// // Random birthdate generator
// const minDate = new Date('2005-01-01'); // Define the minimum date
// const maxDate = new Date('2010-12-31'); // Define the maximum date

// const randomDate = chance.date({ min: minDate, max: maxDate });

// // Random vaccination date generator
// const minVaccinationDate = new Date('2011-01-01'); // Define the minimum date
// const maxVaccinationDate = new Date('2012-12-31'); // Define the maximum date

// const randomVaccinationDate = chance.date({ min: minVaccinationDate, max: maxVaccinationDate });
// const formattedDate = randomVaccinationDate.toISOString().substring(0, 10);
// // Random email generator
// const randomEmail = chance.email();

// // Random phone number that starts with 8-9, 8 digits
// const randomPhone = chance.phone({ formatted: false, country: 'sg' });

// after(() => {
//     cy.then(Cypress.session.clearAllSavedSessions);
// })

// // Before test, create a form that requires parent acknowledgement
// before(() => {
//     let studentID;
//     let encrypted;
//     let studentNRIC = generateNRIC();
//     let authToken;

//     const emailLogin = 'rltk4545@gomail.com';
//     const passLogin = 'PASSword1*';

//     cy.doctorLogin(emailLogin, passLogin);
//     cy.getCookie('jwt').then((cookie) => {
//         authToken = cookie.value;
//         cy.setCookie('jwt', authToken);
//     })

//     let studentEntry = {
//         studentName: randomName,
//         school: randomSecondarySchool,
//         dateOfBirth: randomDate,
//         studentNRIC: studentNRIC,
//         studentClass: randomNumber,
//         dateOfVaccine: formattedDate,
//     }

//     cy.request({
//         method: 'POST',
//         url: '/postStudentInfo',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ studentEntry }),
//         followRedirect: false
//     }).then((response) => {
//         studentID = response.body.studentID;
//     });

//     let acknowledgeEntry = {
//         studentId: studentID,
//         parentContactNo: randomPhone,
//     }

//     cy.request({
//         method: 'POST',
//         url: '/postAcknowledge',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ acknowledgeEntry }),
//         followRedirect: false
//     })

//     cy.request('POST', '/parent/cypress/encrypt', {
//         studentid: studentID,
//     }).then((response) => {
//         encrypted = response.body.encrypted;
//     });

//     // Password = DDMMYYYY of student's birthdate + last 4 digits of student's NRIC
//     const password = randomDate.getDate().toString().padStart(2, '0') + (randomDate.getMonth() + 1).toString().padStart(2, '0') + randomDate.getFullYear().toString() + studentNRIC.slice(-4);

//     cy.parentLogin(encrypted, password);
//     cy.getCookie('parentJWT').then((cookie) => {
//         parentToken = cookie.value;
//     })
// });

// beforeEach(() => {
//     cy.setCookie('parentJWT', parentToken);
// })

// describe('parent acknowledge', () => {
//     it('should be able to view the form', () => {
//         cy.visit('http://localhost:3000/acknowledgement/form?encrypted' + encrypted);
//         cy.contains('Parent Section:')
//     }
//     )
// })
