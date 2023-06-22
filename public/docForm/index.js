/*
Author: CHA HAJIN
Date: 2023-06-16
File: docForm/index.js

Description:
This file includes validation of form values and send data to APIs to save data in our database
*/

document.addEventListener('DOMContentLoaded', function () {
    const loadingModal = new bootstrap.Modal('#loadingModal', {
        keyboard: false
    });
    let canvas = document.getElementById('signatureCanvas');
    let signaturePad = new SignaturePad(canvas);
    let clearSignatureBtn = document.getElementById('clearSignatureBtn');
    let availabilityBtn = document.getElementById('availabilityBtn');
    let isAvailabilityBtn = false;
    let isDoctorNew = true;
    let currentDoctor;
    let form = document.querySelector('form');

    //student section
    const studentNameInput = document.getElementById('studentName');
    const schoolNameInput = document.getElementById('schoolName');
    const dateOfBirth = document.getElementById('dateOfBirth');
    const studentNRICInput = document.getElementById('studentNRIC');
    const studentClassInput = document.getElementById('studentClass');
    const courseDateInput = document.getElementById('courseDate');
    const dateOfVaccineInput = document.getElementById('dateOfVaccine');
    const parentEmail = document.getElementById('parentEmail');
    const parentContact = document.getElementById('parentContact');

    // physician sector
    const eligibilityRadios = document.getElementsByName('eligibility');
    const commentsTextarea = document.getElementById('medical_text');
    const physicianNameInput = document.getElementById('physicianName');
    const clinicNameInput = document.getElementById('clinicName');
    const dateInput = document.getElementById('date');
    const contactNoInput = document.getElementById('contactNo');
    const clinicAddressInput = document.getElementById('clinicAddress');
    const doctorMCRInput = document.getElementById('doctorMCR');

    // parent section
    const parentSection = document.getElementById('parent-section');
    const parentYesInput = document.getElementById('parent-yes');
    const parentNoInput = document.getElementById('parent-no');
    const parentRadio = document.querySelectorAll('.parent-acknowledgement');
   
    // event listener for radio buttons
    parentRadio.forEach((element) => {
        element.addEventListener('change', function () {
            if (parentYesInput.checked) {
                let temp = document.getElementById("parent-template")
                let clone = temp.content.cloneNode(true);
                parentSection.appendChild(clone);
            } else {
                parentSection.innerHTML = "";
            }
        });
    });

    // ONLY FOR TESTING PLEASE DELETE LATER-----------------------------------------------
    // document.getElementById('studentName').value = 'John Doe';
    // document.getElementById('schoolName').value = 'Example School2';
    // document.getElementById('dateOfBirth').value = '2005-01-01';
    // document.getElementById('studentNRIC').value = 'G1234567D';
    // document.getElementById('studentClass').value = '5A';
    // document.getElementById('courseDate').value = '2005-01-01';
    // document.getElementById('dateOfVaccine').value = '2005-01-01';
    // document.getElementById('parentEmail').value = 'parent@example.com';
    // document.getElementById('parentContact').value = '82345678';

    // document.getElementById('fit').checked = true;
    // commentsTextarea.disabled = true;

    // physicianNameInput.value = 'Dr. John Doe';
    // clinicNameInput.value = 'Clinic Name';
    // dateInput.value = '2023-06-16';
    // contactNoInput.value = '82345677';
    // clinicAddressInput.value = 'Clinic Address';
    // doctorMCRInput.value = 'MCR Value';
    // ONLY FOR TESTING -----------------------------------------------

    //date object
    let today = new Date();
    // <img> to display the signature
    let signatureImg = document.createElement('img');
    signatureImg.id = 'signatureImg';
    signatureImg.style.border = '1px dotted black'

    //prevent users from submitting future date
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;
    document.getElementById("dateOfBirth").setAttribute("max", today);
    document.getElementById("courseDate").setAttribute("max", today);
    document.getElementById("date").setAttribute("max", today);

    // FUNCTIONS
    const postDoctorInfo = (doctorEntry) => {
        return fetch('/postDoctorInfo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctorEntry)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
    }
    const postStudentInfo = (studentEntry) => {
        return fetch('/postStudentInfo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentEntry)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
    }
    const postFormInfo = (formEntry) => {
        return fetch('/postFormInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formEntry)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        });
    }
    const sendEmail = (emailEntry) => {
        return fetch('/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailEntry)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
    }

    const postParentInfo = (parentEntry) => {
        return fetch('/post-acknowledge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(parentEntry)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
    }
    
    // validation functions
    const validatePhone = (inputElement, value) => {
        const phonePattern = /^[89]\d{7}$/;
        if (!phonePattern.test(value)) {
            inputElement.setCustomValidity('Please enter 8 digits starting with 8/9');
            inputElement.reportValidity();
            return false;
        }
        return true;
    }
    const validateName = (inputElement, value) => {
        const namePattern = /^[a-zA-Z\s]+$/;
        if (!namePattern.test(value)) {
          inputElement.setCustomValidity("Please enter a valid name with alphabets, spaces, hyphens, and apostrophes only.");
          inputElement.reportValidity();
          return false;
        }
        return true;
    };
    const validateEmail = (inputElement, value) => {
        const emailRegEx = /\S+@\S+\.\S+/;
        if (!emailRegEx.test(value)) {
            inputElement.setCustomValidity(`Please enter a valid email address.`);
            inputElement.reportValidity();
            return false;
        }
        return true;
    }
    const validateNRIC = (inputElement, value) => {
        const nricPattern = /^[STFG]\d{7}[A-Z]$/;
        if (!nricPattern.test(value)) {
            inputElement.setCustomValidity('Please enter a valid NRIC (e.g., S1234567D)');
            inputElement.reportValidity();
            return false;
        }
        inputElement.setCustomValidity('');
        return true;
    };
    const validateDate = (inputElement, value) => {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(value)) {
            inputElement.setCustomValidity('Please enter a valid date (e.g., 2023-06-16)');
            inputElement.reportValidity();
            return false;
        }

        // Check if date is valid
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            inputElement.setCustomValidity('Please enter a valid date (e.g., 2023-06-16)');
            inputElement.reportValidity();
            return false;
        }

        inputElement.setCustomValidity('');
        return true;
    };

    // doctorForm autoFill format
    const doctorAutoFill = (doctorMCR, nameOfDoctor, signature, nameOfClinic, clinicAddress, contactNo) => {
        //signature info extract
        const signInfoArr = signature.split(';');
        const signURL = signInfoArr[0];

        // Set the src of the image to the signature URL
        signatureImg.src = signURL;

        // Replace the canvas with the image
        let canvas = document.getElementById('signatureCanvas');
        canvas.parentNode.replaceChild(signatureImg, canvas);

        physicianNameInput.value = nameOfDoctor;
        clinicNameInput.value = nameOfClinic;
        contactNoInput.value = contactNo;

        today = yyyy + '-' + mm + '-' + dd;
        dateInput.value = today;
        clinicAddressInput.value = clinicAddress;

        doctorMCRInput.disabled = true;
        physicianNameInput.disabled = true;
        clinicNameInput.disabled = true;
        contactNoInput.disabled = true;
        dateInput.disabled = true;
        clinicAddressInput.disabled = true;

        availabilityBtn.disabled = true;
        availabilityBtn.textContent = "Welcome Back";
        availabilityBtn.className = "btn btn-primary"
        document.getElementById("clearSignatureBtn").style.display = "none";
        //To make sure user checked doctorMCR availability before submitting form
        isAvailabilityBtn = true;
        // Doctor already exists
        isDoctorNew = false;
        currentDoctor = doctorMCR;
    }

    // Disable comment section
    for (let i = 0; i < eligibilityRadios.length; i++) {
        eligibilityRadios[i].addEventListener('change', function () {
            if (this.value === 'Fit') {
                commentsTextarea.disabled = true;
            } else {
                commentsTextarea.disabled = false;
            }
        });
    }

    // clear signature
    clearSignatureBtn.addEventListener('click', function (event) {
        event.preventDefault();
        signaturePad.clear();
    });

    //still need to handle autofill for signature
    availabilityBtn.addEventListener('click', function (event) {
        event.preventDefault();

        // check if doctorMCR input is empty or not
        if (!doctorMCRInput.value) {
            doctorMCRInput.setCustomValidity('Please enter a value');
            doctorMCRInput.reportValidity();
            return; // return early from the event handler if doctorMCR is empty
        } else {
            doctorMCRInput.setCustomValidity('');
        }

        const template = document.getElementById('loadingTemplate');
        const clone = template.content.cloneNode(true);
        availabilityBtn.innerHTML = '';
        availabilityBtn.className = 'btn btn-primary'
        availabilityBtn.appendChild(clone);

        // using POST method since doctorMCR is sensitive information so that it can be protected
        fetch('/checkDoctorMCR', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ doctorMCR: doctorMCRInput.value })
        })
            .then(response => {
                if (response.status === 404) {
                    // Doctor was not found
                    throw new Error('DoctorNotFound');
                }
                else if (response.status === 500) {
                    // Server error
                    alert('An error occurred. Please try again later.');
                    throw new Error('ServerError');
                }
                return response.json();
            })
            .then(data => {
                const { doctorMCR, nameOfDoctor, signature, nameOfClinic, clinicAddress, contactNo } = data[0];
                doctorAutoFill(doctorMCR, nameOfDoctor, signature, nameOfClinic, clinicAddress, contactNo);
            })
            .catch(err => {
                if (err.message == 'DoctorNotFound') {
                    // if doctor is new and available
                    availabilityBtn.disabled = true;
                    availabilityBtn.textContent = `MCR is available!`
                    availabilityBtn.className = 'btn btn-success'
                    isAvailabilityBtn = true;
                }
                else {
                    // internal server error
                    alert("internal server error" + err.message);
                }
            });
    });

    // handle form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        let isValid = true;

        // signature data handling...
        const signatureData = signaturePad.toDataURL();
        const signatureMsg = document.getElementById('signatureMsg');

        // All Entries handling...
        const studentEntry = {
            studentName: studentNameInput.value,
            schoolName: schoolNameInput.value,
            dateOfBirth: dateOfBirth.value,
            studentNRIC: studentNRICInput.value,
            studentClass: studentClassInput.value,
            dateOfVaccine: dateOfVaccineInput.value,
            parentContact: parentContact.value,
            parentEmail: parentEmail.value
        }
        const formEntry = {
            courseDate: courseDateInput.value,
            eligibility: Array.from(eligibilityRadios).find(radio => radio.checked)?.value || '',
            date: dateInput.value
        }
        const doctorEntry = {
            doctorMCR: doctorMCRInput.value,
            physicianName: physicianNameInput.value,
            clinicName: clinicNameInput.value,
            clinicAddress: clinicAddressInput.value,
            contactNo: contactNoInput.value
        }
        const allEntry = { ...studentEntry, ...formEntry, ...doctorEntry };

        // Validation Logic
        for (let [key, value] of Object.entries(allEntry)) {
            const inputElement = document.getElementById(key);
            if (inputElement && inputElement instanceof HTMLInputElement) {
                // check if any value is empty or not
                if (!value) {
                    inputElement.setCustomValidity(`Please fill out Before submit`);
                    inputElement.reportValidity();
                    isValid = false;
                } else {
                    // If the value exists, clear any previous custom validity message
                    inputElement.setCustomValidity('');

                    // Contact Validation
                    if (['parentContact', 'contactNo'].includes(key)) {
                        isValid = validatePhone(inputElement, value) && isValid;
                    }
                    // Date Validation
                    else if (['dateOfBirth', 'dateOfVaccine', 'courseDate', 'date'].includes(key)) {
                        isValid = validateDate(inputElement, value) && isValid;
                    }
                    // Email Validation
                    else if (key === 'parentEmail') {
                        isValid = validateEmail(inputElement, value) && isValid;
                    }
                    // NRIC Validation
                    else if (key === 'studentNRIC') {
                        isValid = validateNRIC(inputElement, value) && isValid;
                    }
                }
                inputElement.addEventListener('input', function () {
                    inputElement.setCustomValidity('');
                });
            }
        }

        // add back signatureData
        doctorEntry.signatureData = signatureData;
        // signature validation

        if (signaturePad.isEmpty()) {
            if (document.getElementById('signatureImg')) {
                isValid = true;
            } else {
                signatureMsg.textContent = 'Please provide your signature'
                signatureMsg.className = 'text-danger'
                isValid = false;
            }
        }
        signaturePad.onBegin = function () {
            // clear signature
            signatureMsg.textContent = '';
            signatureMsg.className = '';
        };

        // Proceed submission
        if (isValid) {
            // Availability button validation
            if (isAvailabilityBtn === false) {
                availabilityBtn.setCustomValidity('Please check availability');
                availabilityBtn.reportValidity();
            }
            else {
                if (isDoctorNew === true) {
                    const data = {
                        signature: signatureData
                    };
                    let signatureCredentials,studentId;
                    
                    // show loading modal
                    loadingModal.show();
                    fetch('/uploadSign', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Upload failed');
                        }
                        return response.json();
                    })
                    .then(data => {
                        signatureCredentials = `${data.url};${today};${physicianNameInput.value}`;
                        doctorEntry.signatureData = signatureCredentials;

                        return Promise.all([postDoctorInfo(doctorEntry), postStudentInfo(studentEntry)]);
                    })
                    .then(([doctorResponse, studentResponse]) => {
                        studentId = studentResponse[0].insertId;
                        formEntry.studentId = studentId;
                        formEntry.doctorMCR = doctorMCRInput.value;
                        formEntry.comments = commentsTextarea.value;
                        return postFormInfo(formEntry);
                    })
                    // .then(data => {
                    //     // if checkbox, send email
                    //     const emailEntry ={
                    //         studentId : studentId,
                    //         parentEmail : parentEmail
                    //     }
                    //     return sendEmail(emailEntry);
                    // })
                    .then(data => {
                        loadingModal.hide();

                        studentNameInput.value = '';
                        schoolNameInput.value = '';
                        dateOfBirth.value = '';
                        studentNRICInput.value = '';
                        studentClassInput.value = '';
                        courseDateInput.value = '';
                        dateOfVaccineInput.value = '';
                        parentContact.value = '';
                        parentEmail.value = '';

                        let scrollableDiv = document.getElementById("formDiv");
                        scrollableDiv.scrollTop = 0;
                        doctorAutoFill(doctorMCRInput.value, physicianNameInput.value, signatureCredentials, clinicNameInput.value, clinicAddressInput.value, contactNoInput.value);
                    })
                    .catch(error => {
                        if (error.message === 'Upload failed') {
                            alert('Signature Upload Failed');
                        } else if (error.message === 'Doctor Duplicate entry') {
                            alert('Doctor already exists');
                        } else if (error.message === 'Student Duplicate entry') {
                            alert('Student already exists');
                        } else if (error.message === 'Form Duplicate entry') {
                            alert('Form already exists');
                        } else if (error.message === 'Internal server error') {
                            alert('Server error');
                        } else if (error.message === 'Encryption Error') {
                            alert('Encryption Error');
                        } else {
                            console.error('Error:', error);
                        }
                    });

                }
                else if (isDoctorNew === false) {
                    // show loading modal
                    loadingModal.show();
                    postStudentInfo(studentEntry)
                    .then(data => {
                        formEntry.studentId = data[0].insertId;
                        formEntry.doctorMCR = currentDoctor;
                        formEntry.comments = commentsTextarea.value;
                        return postFormInfo(formEntry);
                    })
                    .then(data => {
                        // hide loading modal
                        loadingModal.hide();

                        studentNameInput.value = '';
                        schoolNameInput.value = '';
                        dateOfBirth.value = '';
                        studentNRICInput.value = '';
                        studentClassInput.value = '';
                        courseDateInput.value = '';
                        dateOfVaccineInput.value = '';
                        parentContact.value = '';
                        parentEmail.value = '';
                        for (let i = 0; i < eligibilityRadios.length; i++) {
                            eligibilityRadios[i].checked = false;
                        }
                        commentsTextarea.value = '';
                        
                        let scrollableDiv = document.getElementById("formDiv");
                        scrollableDiv.scrollTop = 0;
                    })
                    .catch(error => {
                        if (error.message === 'Student Duplicate entry') {
                            alert('Student already exists');
                        } else if (error.message === 'Form Duplicate entry') {
                            alert('Form already exists');
                        } else if (error.message === 'Internal server error') {
                            alert('Server error');
                        } else {
                            console.error('Error:', error);
                        }
                    });
                }
            }
        }
    });
});
