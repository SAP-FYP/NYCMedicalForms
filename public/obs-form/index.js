/*
Author: CHA HAJIN
Date: 2023-06-16
File: docForm/index.js

Description:
This file includes validation of form values and send data to APIs to save data in our database
*/

document.addEventListener('DOMContentLoaded', function () {
    let schools = [];
    let currentSchool;
    let currentDoctor;
    let isDoctorNew = true;
    let studentNRIC = '';
    let regFormId;
    const validities = {
        isStudentNameValid: false,
        isStudentNRICValid: false,
        isDateOfBirthValid: false,
        isClassValid: false,
        isSchoolValid: false,
        isCourseDateValid: false,
        isVaccineValid: false,
        isParentEmailValid: false,
        isParentContactValid: false,
        isEligibilityValid: false,
        isCommentValid: false,
        isDoctorMCRValid: false,
        isDoctorNameValid: false,
        isDoctorContactValid: false,
        isClinicNameValid: false,
        isClinicAddressValid: false,
        isDateValid: false,
        isSignatureValid: false
    }
    let isAvailabilityBtn = false;
    let isRetreiveBtnClicked = false;
    let form = document.querySelector('form');
    let canvas = document.getElementById('signatureCanvas');
    let signaturePad = new SignaturePad(canvas);
    const availabilityBtn = document.getElementById('availabilityBtn');
    const clearSignatureBtn = document.getElementById('clearSignatureBtn');
    // modals
    const loadingModal = new bootstrap.Modal('#loadingModal', {
        keyboard: false
    });
    const deleteStudentModal = new bootstrap.Modal('#deleteStudentModal', {
        keyboard: false
    });
    const seeDetailModal = new bootstrap.Modal('#seeDetailModal', {
        keyboard: false
    });
    const seeDetailModalElement = document.getElementById('seeDetailModal')
    // alertBox
    const alertContainer = document.getElementById('alertbox');
    // Section divs
    const sectionOneContainer = document.getElementById('sectionOneContainer');
    const sectionTwoContainer = document.getElementById('sectionTwoContainer');

    //student section
    const studentNameInput = document.getElementById('studentName');
    const schoolDropDownMenu = document.getElementById('schoolDropDownMenu');
    const schoolDropDown = document.getElementById('schoolDropDown');
    const schoolName = document.getElementById('schoolName');
    const dateOfBirth = document.getElementById('dateOfBirth');
    const studentNRICInput = document.getElementById('studentNRIC');
    const studentClassInput = document.getElementById('studentClass');
    const courseDateInput = document.getElementById('courseDate');
    const dateOfVaccineInput = document.getElementById('dateOfVaccine');
    const parentEmail = document.getElementById('parentEmail');
    const parentContact = document.getElementById('parentContact');
    const parentsInfoDiv = document.getElementById('parentsInfoDiv');
    const retreiveStudentBtn = document.getElementById('retreiveStudentBtn');

    // physician sector
    const acknowledgeCheckBox = document.getElementById('acknowledgeCheckBox');
    const eligibilityRadios = document.getElementsByName('eligibility');
    const commentsTextarea = document.getElementById('comment');
    const doctorNameInput = document.getElementById('physicianName');
    const clinicNameInput = document.getElementById('clinicName');
    const dateInput = document.getElementById('date');
    const doctorcontactNoInput = document.getElementById('doctorContact');
    const clinicAddressInput = document.getElementById('clinicAddress');
    const doctorMCRInput = document.getElementById('doctorMCR');

    // Feedback elements
    const studentNameFeedback = document.getElementById('studentNameFeedback');
    const studentNRICFeedback = document.getElementById('studentNRICFeedback');
    const dateOfBirthFeedback = document.getElementById('dateOfBirthFeedback');
    const studentClassFeedback = document.getElementById('studentClassFeedback');
    const courseDateFeedback = document.getElementById('courseDateFeedback');
    const dateOfVaccineFeedback = document.getElementById('dateOfVaccineFeedback');
    const parentEmailFeedback = document.getElementById('parentEmailFeedback');
    const parentContactFeedback = document.getElementById('parentContactFeedback');
    const doctorMCRFeedback = document.getElementById('doctorMCRFeedback');
    const physicianNameFeedback = document.getElementById('physicianNameFeedback');
    const doctorContactFeedback = document.getElementById('doctorContactFeedback');
    const clinicNameFeedback = document.getElementById('clinicNameFeedback');
    const clinicAddressFeedback = document.getElementById('clinicAddressFeedback');
    const dateFeedback = document.getElementById('dateFeedback');

    //date object
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;

    //prevent users from submitting future date
    document.getElementById("dateOfBirth").setAttribute("max", today);
    document.getElementById("courseDate").setAttribute("min", today);
    document.getElementById("date").setAttribute("max", today);

    // <img> to display the signature
    let signatureImg = document.createElement('img');
    signatureImg.id = 'signatureImg';
    signatureImg.style.border = '1px dotted black'

    // Disable comment section
    for (let i = 0; i < eligibilityRadios.length; i++) {
        eligibilityRadios[i].addEventListener('change', function () {
            validities.isEligibilityValid = true;
            parentEmail.value = '';
            parentContact.value = '';
            if (parentEmail.classList.contains('is-valid') || parentContact.classList.contains('is-valid')) {
                parentEmail.classList.remove('is-valid');
                parentContact.classList.remove('is-valid');
            }

            const checkContainer = document.getElementById('checkContainer');
            if (checkContainer.classList.contains('is-invalid')) {
                checkContainer.classList.remove('is-invalid');
            }

            if (this.value === 'Fit' || this.value === 'Fit With Condition') {
                validities.isCommentValid = true;

                if (commentsTextarea.classList.contains('is-invalid')) {
                    commentsTextarea.classList.remove('is-invalid');
                }

                if (acknowledgeCheckBox.checked) {
                    acknowledgeCheckBox.checked = false;
                    if (parentsInfoDiv.style.display == 'block') {
                        parentsInfoDiv.style.display = 'none'
                        if (!document.getElementById('checkBoxContainer').classList.contains('mb-5')) {
                            document.getElementById('checkBoxContainer').classList.add('mb-5')
                        }
                    }
                }

                if (this.value === 'Fit') {
                    commentsTextarea.value = '';
                    commentsTextarea.disabled = true;
                    acknowledgeCheckBox.disabled = true;
                }
                else if (this.value === 'Fit With Condition') {
                    commentsTextarea.disabled = false;
                    acknowledgeCheckBox.disabled = false;
                }
            }
            else if (this.value === 'Unfit') {
                if (commentsTextarea.value === '') {
                    commentsTextarea.classList.add('is-invalid');
                    validities.isCommentValid = false;
                }

                if (parentsInfoDiv.disabled) {
                    parentsInfoDiv.disabled = false;
                }

                commentsTextarea.disabled = false;
                acknowledgeCheckBox.disabled = false;
            }
        });
    };

    // === ALERT BOX ===
    const alertBox = (message, type) => {
        const alertIcon = document.getElementById('alert-icon');
        const alertMessage = document.getElementById('alert-message');
        let alertColor;

        if (type === 'danger') {
            alertIcon.setAttribute('xlink:href', '#exclamation-triangle-fill');
            alertColor = 'alert-danger';
        } else if (type === 'success') {
            alertIcon.setAttribute('xlink:href', '#check-circle-fill');
            alertColor = 'alert-success';
        } else if (type === 'warn') {
            alertIcon.setAttribute('xlink:href', '#exclamation-triangle-fill');
            alertColor = 'alert-warning';
        } else if (type === 'info') {
            alertIcon.setAttribute('xlink:href', '#info-fill');
            alertColor = 'alert-primary';
        }

        alertMessage.textContent = message;
        alertContainer.classList.add(alertColor)
        alertContainer.classList.add('alert-visible');
        alertContainer.classList.remove('alert-hidden');

        setTimeout(() => {
            alertContainer.classList.add('alert-hidden');
            alertContainer.classList.remove('alert-visible');
            alertContainer.classList.remove(alertColor);
        }, 5000);
    };

    // Fetch functions
    const validateAuth = () => {
        return fetch('/obs-form/auth')
            .then(response => {
                if (response.redirected) {
                    window.location.href = response.url;
                    throw new Error('redirected');
                }

                if (response.status !== 200 && response.status !== 404) {
                    const error = new Error('An unknown error occured.');
                    error.status = 500;
                    throw error;
                }

                return response.json();
            })
            .catch(error => { })
    };
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
    };
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
    };
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
    };
    const postAcknowledge = (formEntry) => {
        return fetch('/postAcknowledge', {
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
    };
    const updateFormStatus = (studentId) => {
        return fetch(`/updateFormStatus?studentId=${studentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
    };
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
    };
    const getSchools = () => {
        return fetch(`/getSchools`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Fetching school failed')
                }
                return response.json();
            })
    };
    const uploadSignature = (data) => {
        return fetch('/uploadSign', {
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
    };
    const checkStudentDuplication = (studentNRIC) => {
        return fetch('/checkStudentNRIC', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentNRIC: studentNRIC })
        })
        .then(response => {
            if (response.status === 404) {
                // student was not found
                return { studentInfo: false, deleteStudent: false };
            }
            else if (response.status === 500) {
                // Server error
                throw new Error('ServerError');
            }
            return response.json().then(data => ({ studentInfo: data, deleteStudent: true }));
        });
    };
    const getStudentRegistrationInfo = (registrationEntry) => {
        return fetch('/getStudentRegistrationInfo',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationEntry)
        })
        .then(response => {
            if (response.status === 404) {
                // Doctor was not found
                throw new Error('StudentNotRegistered');
            }
            else if (response.status === 500) {
                throw new Error('ServerError');
            }
            return response.json();
        })
        
    };
    const getConditionDetails = (conditionType,regFormId) => {
        const apiUrl = `/get${conditionType}/${regFormId}`;
        console.log(apiUrl)
        return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            return response.json();
        })
    };

    // Validation functions
    const validatePhone = (inputElement, feedbackElement, value) => {
        const phonePattern = /^[89]\d{7}$/;
        if (!phonePattern.test(value)) {
            inputElement.classList.add('is-invalid');
            feedbackElement.textContent = 'Please enter 8 digits starting with 8/9';
            return false;
        }
        else {
            inputElement.classList.remove('is-invalid');
            inputElement.classList.add('is-valid');
            return true;
        }
    }
    const validateName = (inputElement, feedbackElement, value) => {
        const namePattern = /^[a-zA-Z\s]+$/;
        if (!namePattern.test(value)) {
            inputElement.classList.add('is-invalid');
            feedbackElement.textContent = 'Please enter valid name';
            return false;
        }
        else {
            inputElement.classList.remove('is-invalid');
            inputElement.classList.add('is-valid');
            return true;
        }
    };
    const validateEmail = (inputElement, value) => {
        const emailRegEx = /\S+@\S+\.\S+/;
        if (!emailRegEx.test(value)) {
            inputElement.classList.add('is-invalid');
            parentEmailFeedback.textContent = 'Please enter a valid email address';
            return false;
        }
        else {
            inputElement.classList.remove('is-invalid');
            inputElement.classList.add('is-valid');
            return true;
        }
    };
    const validateNRIC = (inputElement, value) => {
        const nricPattern = /^[STFG]\d{7}[A-Z]$/i;
        if (!nricPattern.test(value)) {
            inputElement.classList.add('is-invalid');
            studentNRICFeedback.textContent = 'Please enter a valid NRIC';
            return false;
        }
        else {
            inputElement.classList.remove('is-invalid');
            inputElement.classList.add('is-valid');
            return true;
        }
    };
    const validateDate = (inputElement, feedbackElement, value) => {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        const date = new Date(value);

        if (!datePattern.test(value)) {
            inputElement.classList.add('is-invalid');
            feedbackElement.textContent = 'Please enter a valid date';
            return false;
        }
        else if (isNaN(date.getTime())) {
            inputElement.classList.add('is-invalid');
            feedbackElement.textContent = 'Please enter a valid date';
            return false;
        }
        else {
            inputElement.classList.remove('is-invalid');
            inputElement.classList.add('is-valid');
            return true;
        }

    };
    const validateMCR = (inputElement, value) => {
        const mcrPattern = /^[a-zA-Z0-9]+$/;
        if (!mcrPattern.test(value)) {
            inputElement.classList.add('is-invalid');
            doctorMCRFeedback.textContent = 'Please enter a valid MCR';
            return false;
        }
        else {
            inputElement.classList.remove('is-invalid');
            inputElement.classList.add('is-valid');
            return true;
        }
    };
    const validateEmptyValue = (allEntry) => {
        for (const key in allEntry) {
            // double check if the entry have the key
            if (allEntry.hasOwnProperty(key)) {
                const value = allEntry[key];
                // check signature
                if (key === "signatureData") {
                    if (signaturePad.isEmpty()) {
                        const signatureMsg = document.getElementById('signatureMsg');
                        signatureMsg.textContent = 'Please provide your signature';
                        signatureMsg.className = 'text-danger';
                        validities.isSignatureValid = false;
                        if (document.getElementById('signatureImg')) {
                            validities.isSignatureValid = true;
                            signatureMsg.textContent = '';
                        }
                    }
                }
                else if (key === "schoolName") {
                    if (value === "" || key === undefined || key === null) {
                        validities.isSchoolValid = false;
                    }
                }
                // show error message
                if (value === "" || value === undefined || value === null) {
                    if (key === "eligibility") {
                        document.getElementById("checkContainer").classList.add('is-invalid');
                        validities.isCommentValid = false;
                    }
                    else if (key === "comment") {
                        if (allEntry.eligibility.value === "Fit" || allEntry.eligibility.value === "Fit With Condition") {
                            if (document.getElementById(key).classList.contains('is-invalid')) {
                                document.getElementById(key).classList.remove('is-invalid');
                            }
                            validities.isCommentValid = false;
                        }
                    }
                    else {
                        document.getElementById(key).classList.add('is-invalid');
                    }
                }
            }
        }
    };
    const validateValidities = (validities) => {
        let foundFalse = false;
        for (const key in validities) {
            const value = validities[key];
            if (!value) {
                foundFalse = true;
                break;
            }
        }
        if (isAvailabilityBtn === false) {
            availabilityBtn.classList.add('is-invalid');
            foundFalse = false
        }
        // if (isRetreiveBtnClicked === false) {
        //     retreiveStudentBtn.classList.add('is-invalid');
        //     foundFalse = false
        // }
        if (foundFalse) {
            return false;
        }
        else {
            return true;
        }
    };

    // Other functions
    const doctorAutoFill = (doctorMCR, nameOfDoctor, signature, nameOfClinic, clinicAddress, contactNo) => {
        //signature info extract
        const signInfoArr = signature.split(';');
        const signURL = signInfoArr[0];

        // Set the src of the image to the signature URL
        signatureImg.src = signURL;

        // Replace the canvas with the image
        let canvas = document.getElementById('signatureCanvas');
        canvas.parentNode.replaceChild(signatureImg, canvas);

        doctorNameInput.value = nameOfDoctor;
        clinicNameInput.value = nameOfClinic;
        doctorcontactNoInput.value = contactNo;

        today = yyyy + '-' + mm + '-' + dd;
        dateInput.value = today;
        clinicAddressInput.value = clinicAddress;

        doctorMCRInput.disabled = true;
        doctorNameInput.disabled = true;
        clinicNameInput.disabled = true;
        doctorcontactNoInput.disabled = true;
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
    };
    const createListElement = (school, index) => {
        const li = document.createElement('li');
        li.textContent = school;
        li.className = "p-3";
        if (index) {
            li.setAttribute('id', `school${index}`)
        }

        li.addEventListener('mouseover', (event) => {
            event.target.style.backgroundColor = "#f3f3f3";
        });

        li.addEventListener('mouseout', (event) => {
            event.target.style.backgroundColor = "";
        });

        // Add click event listener
        li.addEventListener('click', (event) => {
            schoolName.textContent = event.target.textContent;
            currentSchool = schools[index];
            if (schoolName.classList.contains('is-invalid')) {
                schoolName.classList.remove('is-invalid');
                schoolName.classList.add('is-valid');
            }
            if (!schoolName.classList.contains('is-valid')) {
                schoolName.classList.add('is-valid');
            }
            validities.isSchoolValid = true;
        });

        return li;
    };
    const emptyOutStudentInputs = () => {
        studentNameInput.value = '';
        schoolName.textContent = 'Select School';
        dateOfBirth.value = '';
        studentNRICInput.value = '';
        studentClassInput.value = '';
        courseDateInput.value = '';
        dateOfVaccineInput.value = '';
        parentContact.value = '';
        parentEmail.value = '';
        commentsTextarea.value = '';
        studentNRIC = '';
        currentSchool = '';
        acknowledgeCheckBox.checked = false;
        parentsInfoDiv.style.display = 'none'
        if (!document.getElementById('checkBoxContainer').classList.contains('mb-5')) {
            document.getElementById('checkBoxContainer').classList.add('mb-5')
        }

        validities.isStudentNameValid = false;
        validities.isStudentNRICValid = false;
        validities.isDateOfBirthValid = false;
        validities.isClassValid = false;
        validities.isSchoolValid = false;
        validities.isCourseDateValid = false;
        validities.isVaccineValid = false;
        validities.isParentEmailValid = false;
        validities.isParentContactValid = false;
        validities.isEligibilityValid = false;

        let elements = form.elements;
        
        document.getElementById('studentRegDiv').innerHTML = '';
        studentNameInput.disabled = false;
        studentNRICInput.disabled = false;
        dateOfBirth.disabled = false;
        schoolDropDown.disabled = false;
        studentClassInput.disabled = false;
        dateOfVaccineInput.disabled = false;


        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];

            if (element.classList.contains('is-valid')) {
                element.classList.remove('is-valid');
            }
        }
    };
    const removeInvalidTooltips = () => {
        doctorNameInput.classList.remove('is-invalid')
        doctorcontactNoInput.classList.remove('is-invalid')
        clinicNameInput.classList.remove('is-invalid')
        clinicAddressInput.classList.remove('is-invalid')
        dateInput.classList.remove('is-invalid')

        const signatureMsg = document.getElementById('signatureMsg');
        signatureMsg.textContent = '';
        signatureMsg.className = '';
        validities.isSignatureValid = true;
    };
    const isCheckBoxClicked = () => {
        if (!acknowledgeCheckBox.checked) {
            validities.isParentContactValid = true;
            validities.isParentEmailValid = true;
            return false;
        }
        else {
            return true;
        }
    };
    const waitModalResponse = (deletionStudentEntry) => {
        return new Promise((resolve, reject) => {
            // Attach an event listener to the button
            const updateBtn = document.getElementById('updateStudentBtn');
            const cancelBtn = document.getElementById('cancelBtn');
            updateBtn.addEventListener('click', () => {
                loadingModal.show();
                deleteStudentModal.hide();
                fetch('/deleteStudentForm', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(deletionStudentEntry)
                })
                    .then(response => {
                        if (!response.ok) {
                            const error = new Error("Unable to delete students and forms")
                            error.status = 500;
                            reject(error);
                        }
                        resolve();
                    })
            });
            cancelBtn.addEventListener('click', () => {
                reject(new Error('User Canceled updating student'));
            });
        });
    };
    const relocateToErrorPage = (errCode) => {
        window.location.href += `/error?code=${errCode}`;
    };

    // sections div click event
    sectionOneContainer.addEventListener('click', (event) => {
        form.style.display = 'none';
        document.getElementById('infoDiv').style.display = 'block';
    });

    sectionTwoContainer.addEventListener('click', (event) => {
        form.style.display = 'block';
        document.getElementById('infoDiv').style.display = 'none';
    });

    // checkbox onclick
    acknowledgeCheckBox.addEventListener('change', (event) => {
        if (acknowledgeCheckBox.checked) {
            parentsInfoDiv.style.display = 'block';
            if (document.getElementById('checkBoxContainer').classList.contains('mb-5')) {
                document.getElementById('checkBoxContainer').classList.remove('mb-5')
            }
        }
        else {
            parentsInfoDiv.style.display = 'none';
            if (!document.getElementById('checkBoxContainer').classList.contains('mb-5')) {
                document.getElementById('checkBoxContainer').classList.add('mb-5')
            }
        }
    });

    // Input listners:
    studentNameInput.addEventListener('input', (event) => {
        if (validateName(studentNameInput, studentNameFeedback, event.target.value)) {
            validities.isStudentNameValid = true;
        }
        else {
            validities.isStudentNameValid = false;
        }
    });
    studentNRICInput.addEventListener('input', (event) => {
        const nric = event.target.value;
        if (studentNRIC.length < nric.length) {
            studentNRIC += nric[nric.length - 1];
        }
        else if (studentNRIC.length > nric.length) {
            const difference = studentNRIC.length - nric.length;
            studentNRIC = studentNRIC.substring(0, studentNRIC.length - difference);
        }
        if (nric.length > 4) {
            event.target.value = '*'.repeat(5) + nric.slice(5);
        } else {
            event.target.value = '*'.repeat(nric.length);
        }
        if (validateNRIC(studentNRICInput, studentNRIC)) {
            validities.isStudentNRICValid = true;
        }
        else {
            validities.isStudentNRICValid = false;
        }
    });
    dateOfBirth.addEventListener('input', (event) => {
        if (validateDate(dateOfBirth, dateOfBirthFeedback, event.target.value)) {
            validities.isDateOfBirthValid = true;
        }
        else {
            validities.isDateOfBirthValid = false;
        }
    });
    studentClassInput.addEventListener('input', (event) => {
        if (event.target.value == '' || event.target.value == undefined) {
            studentClassInput.classList.add('is-invalid');
            studentClassFeedback.textContent = 'Please enter value';
            validities.isClassValid = false;
        }
        else {
            studentClassInput.classList.remove('is-invalid');
            studentClassInput.classList.add('is-valid');
            validities.isClassValid = true;
        }
    });
    courseDateInput.addEventListener('input', (event) => {
        if (validateDate(courseDateInput, courseDateFeedback, event.target.value)) {
            validities.isCourseDateValid = true;
        }
        else {
            validities.isCourseDateValid = false;
        }
    });
    dateOfVaccineInput.addEventListener('input', (event) => {
        if (validateDate(dateOfVaccineInput, dateOfVaccineFeedback, event.target.value)) {
            validities.isVaccineValid = true;
        }
        else {
            validities.isVaccineValid = false;
        }
    });
    parentEmail.addEventListener('input', (event) => {
        if (validateEmail(parentEmail, event.target.value)) {
            validities.isParentEmailValid = true;
        }
        else {
            validities.isParentEmailValid = false;
        }
    });
    parentContact.addEventListener('input', (event) => {
        if (validatePhone(parentContact, parentContactFeedback, event.target.value)) {
            validities.isParentContactValid = true;
        }
        else {
            validities.isParentContactValid = false;
        }
    });
    doctorMCRInput.addEventListener('input', (event) => {
        if (validateMCR(doctorMCRInput, event.target.value)) {
            validities.isDoctorMCRValid = true;
        }
        else {
            validities.isDoctorMCRValid = false;
        }
    });
    doctorNameInput.addEventListener('input', (event) => {
        if (validateName(doctorNameInput, physicianNameFeedback, event.target.value)) {
            validities.isDoctorNameValid = true;
        }
        else {
            validities.isDoctorNameValid = false;
        }
    });
    doctorcontactNoInput.addEventListener('input', (event) => {
        if (validatePhone(doctorcontactNoInput, doctorContactFeedback, event.target.value)) {
            validities.isDoctorContactValid = true;
        }
        else {
            validities.isDoctorContactValid = false;
        }
    });
    clinicNameInput.addEventListener('input', (event) => {
        if (event.target.value == '' || event.target.value == undefined) {
            clinicNameInput.classList.add('is-invalid');
            clinicNameFeedback.textContent = 'Please enter value';
            validities.isClinicNameValid = false;
        }
        else {
            clinicNameInput.classList.remove('is-invalid');
            clinicNameInput.classList.add('is-valid');
            validities.isClinicNameValid = true;
        }
    });
    clinicAddressInput.addEventListener('input', (event) => {
        if (event.target.value == '' || event.target.value == undefined) {
            clinicAddressInput.classList.add('is-invalid');
            clinicAddressFeedback.textContent = 'Please enter value';
            validities.isClinicAddressValid = false;
        }
        else {
            clinicAddressInput.classList.remove('is-invalid');
            clinicAddressInput.classList.add('is-valid');
            validities.isClinicAddressValid = true;
        }
    });
    dateInput.addEventListener('input', (event) => {
        if (validateDate(dateInput, dateFeedback, event.target.value)) {
            validities.isDateValid = true;
        }
        else {
            validities.isDateValid = false;
        }
    });
    commentsTextarea.addEventListener('input', (event) => {
        if (commentsTextarea.classList.contains('is-invalid')) {
            commentsTextarea.classList.remove('is-invalid');
            commentsTextarea.classList.add('is-valid');
            validities.isCommentValid = true;
        }
    });
    signaturePad.onBegin = () => {
        const signatureMsg = document.getElementById('signatureMsg');
        signatureMsg.textContent = '';
        signatureMsg.className = '';
        validities.isSignatureValid = true;
    };

    // student retrieval
    retreiveStudentBtn.addEventListener('click', (event) => {8
        event.preventDefault();
        validities.isRetreiveBtnClicked = true;
        if(validities.isStudentNameValid && validities.isStudentNRICValid){
            loadingModal.show();
            const registrationEntry = {
                studentName : studentNameInput.value,
                studentNRIC : studentNRIC.substring(studentNRIC.length - 4)
            };
            getStudentRegistrationInfo(registrationEntry)
            .then(data => {
                loadingModal.hide();
                alertBox('Student is registered', 'success');
                
                validities.isClassValid = true;
                validities.isDateOfBirthValid = true;
                validities.isSchoolValid = true;
                validities.isVaccineValid = true;

                studentNameInput.disabled = true;
                studentNRICInput.disabled = true;
                const jsonData = data[0];
                regFormId = jsonData.regFormId;
    
                const studentRegTemp = document.getElementById('studentRegTemp');
                const clone = studentRegTemp.content.cloneNode(true);
                const parentDiv = document.getElementById('studentRegDiv');
                parentDiv.appendChild(clone);
    
                for(const key in jsonData){
                    const currentValue = jsonData[key]
                    if(parentDiv.querySelector(`#${key}`)){
                        parentDiv.querySelector(`#${key}`).textContent =currentValue;
                        if(currentValue === 'Yes'){
                            if(key != 'isApplicantVaccinationValid'){
                                const currentBtn = document.querySelector(`#${key}Btn`);
                                const currentTitle = document.querySelector(`#${key}Title`).textContent;
                                const modal = document.querySelector(`#seeDetailModal`);
                                currentBtn.style.display = 'block';
    
                                document.querySelector(`#${key}Btn`).addEventListener('click', (event) => {
                                    event.preventDefault();
                                    seeDetailModal.show();
                                    const modalTitle =  modal.querySelector('#conditionName');
                                    const modalBody = modal.querySelector('.modal-body');
                                    modalTitle.textContent = currentTitle;
    
                                    const apiUrl = key + 'Details'
                                    getConditionDetails(apiUrl,regFormId)
                                    .then(data => {
                                        console.log(data);
                                        modalBody.innerHTML = '';
    
                                        for(const key in data){
                                            const modalConditionBodyRow = document.createElement('div');
                                            modalConditionBodyRow.className = 'row mb-3';
    
                                            const title = document.createElement('div');
                                            title.className = 'col-8';
                                            title.textContent = key;
                                            title.style.overflowX = 'auto'
    
                                            const details = document.createElement('div');
                                            details.className = 'col-4';
                                            details.textContent = data[key];
                                            details.style.overflowX = 'auto'
    
                                            modalConditionBodyRow.appendChild(title);
                                            modalConditionBodyRow.appendChild(details);
    
                                            modalBody.appendChild(modalConditionBodyRow);
                                        }
                                        
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    })
                                });
                                
                            }
                        }
                    }
                    else{
                        if(key === 'applicantDOB'){
                            const applicantDOB = currentValue.substring(0, 10);
                            dateOfBirth.value = applicantDOB;
                            dateOfBirth.disabled=  true;
                        }
                        else if( key === 'applicantSchool'){
                            currentSchool = currentValue;
                            schoolName.disabled = true;
                            schoolName.textContent = currentValue;
                        }
                        else if(key === 'applicantClass'){
                            studentClassInput.value = currentValue;
                            studentClassInput.disabled = true;
                        }
                        else if(key === 'applicantVaccinationDate'){
                            const applicantVaccinationDate = currentValue.substring(0, 10);
                            dateOfVaccineInput.value = applicantVaccinationDate;
                            dateOfVaccineInput.disabled=  true;
                        }
                    }
                }
    
    
            })
            .catch( error => {
                if (error.message == 'StudentNotRegistered') {
                    loadingModal.hide();
                    alertBox('Student is not registered', 'danger');
                    // if doctor is new and available
                    studentNameInput.disabled = true;
                    studentNRICInput.disabled = true;
                    retreiveStudentBtn.className = 'btn btn-secondary'
                    isAvailabilityBtn = true;
                }
                else {
                    relocateToErrorPage(500);
                }
            })
        }
    });
    // clear signature
    clearSignatureBtn.addEventListener('click', (event) => {
        event.preventDefault();
        signaturePad.clear();
    });
    //Check MCR Availablability
    availabilityBtn.addEventListener('click', (event) => {
        event.preventDefault();
        if (validities.isDoctorMCRValid) {
            // check if doctorMCR input is empty or not
            if (!doctorMCRInput.value) {
                doctorMCRInput.classList.add('is-invalid');
                doctorMCRFeedback.style.display = 'block';
                doctorMCRFeedback.textContent = 'Please enter a value';
                return; // return early from the event handler if doctorMCR is empty
            } else {
                doctorMCRInput.classList.remove('is-invalid');
                doctorMCRInput.classList.add('is-valid');
                doctorMCRFeedback.style.display = 'none';
            }

            const template = document.getElementById('loadingTemplate');
            const clone = template.content.cloneNode(true);
            availabilityBtn.innerHTML = '';
            availabilityBtn.className = 'btn btn-primary'
            availabilityBtn.appendChild(clone);
         
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
                    throw new Error('ServerError');
                }
                return response.json();
            })
            .then(data => {
                const { doctorMCR, nameOfDoctor, signature, nameOfClinic, clinicAddress, contactNo } = data[0];
                doctorAutoFill(doctorMCR, nameOfDoctor, signature, nameOfClinic, clinicAddress, contactNo);
                removeInvalidTooltips();
                validities.isDoctorMCRValid = true;
                validities.isDoctorNameValid = true;
                validities.isDoctorContactValid = true;
                validities.isClinicNameValid = true;
                validities.isClinicAddressValid = true;
                validities.isDateValid = true;
                validities.isSignatureValid = true;
            })
            .catch(err => {
                if (err.message == 'DoctorNotFound') {
                    // if doctor is new and available
                    doctorMCRInput.disabled = true;
                    availabilityBtn.disabled = true;
                    availabilityBtn.textContent = `You are new!`
                    availabilityBtn.className = 'btn btn-success'
                    isAvailabilityBtn = true;
                }
                else {
                    relocateToErrorPage(500);
                }
            });
        }

    });
    // drop down handlers
    schoolDropDown.addEventListener('show.bs.dropdown', (event) => {
        getSchools()
            .then(data => {
                const loadingMsgDiv = schoolDropDownMenu.querySelector('.loadingMsg');
                if (loadingMsgDiv) {
                    loadingMsgDiv.remove();
                }
                let isFirstIteration = true;
                data.forEach((school, index) => {
                    schools.push(school.schoolName);
                    if (isFirstIteration) {
                        const schoolSearchTemplate = document.getElementById('schoolSearchTemplate');
                        const clone = schoolSearchTemplate.content.cloneNode(true);
                        const schoolSearch = clone.querySelector('#schoolSearch');

                        schoolSearch.addEventListener('input', (event) => {
                            let schoolSearchValue = event.target.value;
                            let matchingSchools = schools.filter(school => school.toLowerCase().includes(schoolSearchValue.toLowerCase()));
                            let lis = schoolDropDownMenu.querySelectorAll('li');
                            lis.forEach(li => {
                                li.remove();
                            });
                            matchingSchools.forEach(school => {
                                schoolDropDownMenu.appendChild(createListElement(school));
                            });
                        });

                        schoolDropDownMenu.appendChild(clone);
                        isFirstIteration = false;
                    }
                    schoolDropDownMenu.appendChild(createListElement(school.schoolName, index));
                });
            })
    });
    schoolDropDown.addEventListener('hide.bs.dropdown', (event) => {
        schoolDropDownMenu.innerHTML = '';
        const loadingTemp = document.getElementById('loadingTemplate');
        const loadingTempClone = loadingTemp.content.cloneNode(true);
        loadingTempClone.querySelector('div').className = 'loadingMsg m-3';
        schoolDropDownMenu.appendChild(loadingTempClone);
        schools = [];
        if (currentSchool === "" || currentSchool === undefined || currentSchool === null) {
            schoolName.classList.add('is-invalid');
        }
    });
    seeDetailModalElement.addEventListener('hidden.bs.modal', (event) => {
        seeDetailModalElement.querySelector('.modal-body').innerHTML = '';
        const loadingTemp = document.getElementById('loadingTemplate');
        const loadingTempClone = loadingTemp.content.cloneNode(true);
        loadingTempClone.querySelector('div').className = 'loadingMsg m-3';
        seeDetailModalElement.querySelector('.modal-body').appendChild(loadingTempClone);
    })

    // handle form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // signature data handling...
        const signatureData = signaturePad.toDataURL();

        // All Entries handling...
        const studentEntry = {
            studentName: studentNameInput.value,
            schoolName: currentSchool,
            dateOfBirth: dateOfBirth.value,
            studentNRIC: studentNRIC,
            studentClass: studentClassInput.value,
            dateOfVaccine: dateOfVaccineInput.value,
            parentContact: parentContact.value,
            parentEmail: parentEmail.value
        }
        const formEntry = {
            courseDate: courseDateInput.value,
            eligibility: Array.from(eligibilityRadios).find(radio => radio.checked)?.value || '',
            date: dateInput.value,
            comment: commentsTextarea.value
        }
        const doctorEntry = {
            doctorMCR: doctorMCRInput.value,
            physicianName: doctorNameInput.value,
            clinicName: clinicNameInput.value,
            clinicAddress: clinicAddressInput.value,
            doctorContact: doctorcontactNoInput.value,
            signatureData: signatureData
        }
        const allEntry = { ...studentEntry, ...formEntry, ...doctorEntry };
        const isChecked = isCheckBoxClicked();
        validateEmptyValue(allEntry);
        // Proceed submission
        if (validateValidities(validities)) {
            // check student duplication
            checkStudentDuplication(allEntry.studentNRIC.substring(studentNRIC.length - 4))
                .then(data => {
                    if (data.deleteStudent) {
                        //modal response
                        deleteStudentModal.show();
                        const deletionStudentEntry = {
                            studentId : data.studentInfo[0].studentId,
                            formStatus : data.studentInfo[0].formStatus
                        }
                        return waitModalResponse(deletionStudentEntry);
                    }
                    else {
                        return Promise.resolve();
                    }
                })
                .then(() => {
                    if (isDoctorNew === true) {
                        const data = {
                            signature: signatureData
                        };
                        let signatureCredentials, studentId;

                        // show loading modal
                        loadingModal.show();

                        uploadSignature(data)
                            .then((data) => {
                                signatureCredentials = `${data.url};${today};${doctorNameInput.value}`;
                                studentEntry.studentNRIC = studentNRIC.substring(studentNRIC.length - 4);
                                doctorEntry.signatureData = signatureCredentials;
                                return Promise.all([postDoctorInfo(doctorEntry), postStudentInfo(studentEntry)]);
                            })
                            .then(([doctorResponse, studentResponse]) => {
                                studentId = studentResponse[0].insertId;
                                formEntry.studentId = studentId;
                                formEntry.doctorMCR = doctorMCRInput.value;
                                return postFormInfo(formEntry);
                            })
                            .then(data => {
                                // if checkbox, send email
                                if (isChecked) {
                                    const emailEntry = {
                                        studentId: studentId,
                                        email: studentEntry.parentEmail
                                    }
                                    const acknowledgeEntry = {
                                        studentId: studentId,
                                        parentContactNo: studentEntry.parentContact,
                                        parentEmail: studentEntry.parentEmail
                                    }
                                    return Promise.all([sendEmail(emailEntry), postAcknowledge(acknowledgeEntry), updateFormStatus(studentId)]);
                                }
                                else {
                                    return;
                                }
                            })
                            .then(data => {
                                loadingModal.hide();
                                emptyOutStudentInputs();
                                alertBox('Submit Succesful', 'success');

                                let scrollableDiv = document.getElementById("formDiv");
                                scrollableDiv.scrollTop = 0;
                                doctorAutoFill(doctorMCRInput.value, doctorNameInput.value, signatureCredentials, clinicNameInput.value, clinicAddressInput.value, doctorcontactNoInput.value);
                            })
                            .catch((error) => {
                                console.log(error)
                            });
                    }
                    else if (isDoctorNew === false) {
                        // show loading modal
                        loadingModal.show();
                        studentEntry.studentNRIC = studentNRIC.substring(studentNRIC.length - 4);
                        postStudentInfo(studentEntry)
                            .then(data => {
                                console.log(data)
                                studentId = data[0].insertId;
                                formEntry.studentId = studentId;
                                formEntry.doctorMCR = currentDoctor;
                                formEntry.comments = commentsTextarea.value;
                                return postFormInfo(formEntry);
                            })
                            .then(data => {
                                // if checkbox, send email
                                if (isChecked) {
                                    const emailEntry = {
                                        studentId: studentId,
                                        email: parentEmail.value
                                    }
                                    const acknowledgeEntry = {
                                        studentId: studentId,
                                        parentContactNo: studentEntry.parentContact,
                                        parentEmail: studentEntry.parentEmail
                                    }
                                    return Promise.all([sendEmail(emailEntry), postAcknowledge(acknowledgeEntry), updateFormStatus(studentId)]);
                                }
                                else {
                                    return;
                                }
                            })
                            .then(data => {
                                // hide loading modal
                                loadingModal.hide();
                                emptyOutStudentInputs();
                                alertBox('Submit Succesful', 'success');

                                for (let i = 0; i < eligibilityRadios.length; i++) {
                                    eligibilityRadios[i].checked = false;
                                }
                                commentsTextarea.value = '';

                                let scrollableDiv = document.getElementById("formDiv");
                                scrollableDiv.scrollTop = 0;
                            });
                    }
                })
                .catch(error => {
                    if (error.status === 409) {
                        alertBox(error.message, 'danger');
                    }
                    else {
                        if (error.status === 500) {
                            relocateToErrorPage(error.status);
                        }

                    }
                });
        }
        else {
            const firstInvalidElement = document.querySelector('.is-invalid');
            if (firstInvalidElement) {
                firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
    //validate user
    validateAuth();
});
