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
    let schools = [];
    let currentSchool;
    let canvas = document.getElementById('signatureCanvas');
    let signaturePad = new SignaturePad(canvas);
    const clearSignatureBtn = document.getElementById('clearSignatureBtn');
    const availabilityBtn = document.getElementById('availabilityBtn');
    let isAvailabilityBtn = false;
    let isDoctorNew = true;
    let currentDoctor;
    let studentNRIC = '';
    let form = document.querySelector('form');
    const validities = {
        isStudentNameValid : false,
        isStudentNRICValid : false,
        isDateOfBirthValid : false,
        isClassValid : false,
        isSchoolValid : false,
        isCourseDateValid : false,
        isVaccineValid : false,
        isParentEmailValid : false,
        isParentContactValid : false,
        isEligibilityValid : false,
        isCommentValid : false,
        isDoctorMCRValid: false,
        isDoctorNameValid : false,
        isDoctorContactValid : false,
        isClinicNameValid : false,
        isClinicAddressValid : false,
        isDateValid : false,
        isSignatureValid : false
    }

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

    // physician sector
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
    const schoolDropDownFeedback = document.getElementById('schoolDropDownFeedback');
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

    // Disable comment section
    for (let i = 0; i < eligibilityRadios.length; i++) {
        eligibilityRadios[i].addEventListener('change', function () {
            const checkContainer = document.getElementById('checkContainer');
            if(checkContainer.classList.contains('is-invalid')){
                checkContainer.classList.remove('is-invalid');
            }
            if (this.value === 'Fit') {
                if(commentsTextarea.classList.contains('is-invalid')){
                    commentsTextarea.classList.remove('is-invalid');
                }
                commentsTextarea.value = '';
                commentsTextarea.disabled = true;
            } else {
                if(this.value === 'Unfit'){
                    if(commentsTextarea.value === ''){
                        commentsTextarea.classList.add('is-invalid');
                    }
                }
                commentsTextarea.disabled = false;
            }
        });
    }

    // Fetch functions
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
    const getSchools = () => {
        return fetch(`/getSchools`)
        .then((response) => {
            if(!response.ok){
                throw new Error('Fetching school failed')
            }
            return response.json();
        })
    }
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
    }

    // Validation functions
    const validatePhone = (inputElement, feedbackElement, value) => {
        const phonePattern = /^[89]\d{7}$/;
        if (!phonePattern.test(value)) {
            inputElement.classList.add('is-invalid');
            feedbackElement.textContent = 'Please enter 8 digits starting with 8/9';
            return false;
        }
        else{
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
        else{
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
        else{
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
        else{
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
        else{
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
        else{
            inputElement.classList.remove('is-invalid');
            inputElement.classList.add('is-valid');
            return true;
        }
    };
    const validateEmptyValue = (allEntry) => {
        const signatureMsg = document.getElementById('signatureMsg');
        for (const key in allEntry) {
            // double check if the entry have the key
            if (allEntry.hasOwnProperty(key)) {
                const value = allEntry[key];
                // check signature
                if(key === "signatureData"){
                    if (signaturePad.isEmpty()) {
                        if (document.getElementById('signatureImg')) {
                            isValid = true;
                        } else {
                            signatureMsg.textContent = 'Please provide your signature';
                            signatureMsg.className = 'text-danger';
                            isValid = false;
                        }
                    }
                    signaturePad.onBegin = function () {
                        // clear signature
                        signatureMsg.textContent = '';
                        signatureMsg.className = '';
                    };
                }
                // show error message
                if(value === "" || value === undefined || value === null){
                    if(key === "eligibility"){
                        document.getElementById("checkContainer").classList.add('is-invalid');
                        
                    }
                    else{
                        document.getElementById(key).classList.add('is-invalid');
                        isValid = false;
                    }
                }
            }
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
    const createListElement = (school) => {
        const li = document.createElement('li');
        li.textContent = school;
        li.className = "p-3";

        li.addEventListener('mouseover', (event) => {
            event.target.style.backgroundColor = "#f3f3f3"; 
        });

        li.addEventListener('mouseout', (event) => {
            event.target.style.backgroundColor = "";
        });

        // Add click event listener
        li.addEventListener('click', (event) => {
            schoolName.textContent = event.target.textContent;
            currentSchool = event.target.textContent;
            if(schoolName.classList.contains('is-invalid')){
                schoolName.classList.remove('is-invalid');
                schoolName.classList.add('is-valid');
            }
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
    };

    // Input Validation event listners:
    studentNameInput.addEventListener('input',(event)=>{
        validateName(studentNameInput,studentNameFeedback,event.target.value);
    });
    studentNRICInput.addEventListener('input',(event)=>{
        
        const nric = event.target.value;
        if(studentNRIC.length < nric.length){
            studentNRIC += nric[nric.length-1];
        }
        else if(studentNRIC.length > nric.length){
            const difference = studentNRIC.length - nric.length;
            studentNRIC = studentNRIC.substring(0,studentNRIC.length - difference);
        }
        if (nric.length > 4) {
            event.target.value = '*'.repeat(4) + nric.slice(4);
        } else {
            event.target.value = '*'.repeat(nric.length);
        }
        console.log(studentNRIC)
        validateNRIC(studentNRICInput,studentNRIC);
    });
    dateOfBirth.addEventListener('input',(event)=>{
        validateDate(dateOfBirth,dateOfBirthFeedback,event.target.value);
    });
    studentClassInput.addEventListener('input',(event)=>{
        if(event.target.value == '' || event.target.value == undefined){
            studentClassInput.classList.add('is-invalid');
            studentClassFeedback.textContent = 'Please enter value';
        }
        else{
            studentClassInput.classList.remove('is-invalid');
            studentClassInput.classList.add('is-valid');
        }
    });
    courseDateInput.addEventListener('input',(event)=>{
        validateDate(courseDateInput,courseDateFeedback,event.target.value);
    });
    dateOfVaccineInput.addEventListener('input',(event)=>{
        validateDate(dateOfVaccineInput,dateOfVaccineFeedback,event.target.value);
    });
    parentEmail.addEventListener('input',(event)=>{
        validateEmail(parentEmail,event.target.value);
    });
    parentContact.addEventListener('input',(event)=>{
        validatePhone(parentContact,parentContactFeedback,event.target.value);
    });
    doctorMCRInput.addEventListener('input',(event)=>{
        validateMCR(doctorMCRInput,event.target.value);
    });
    doctorNameInput.addEventListener('input',(event)=>{
        validateName(doctorNameInput,physicianNameFeedback,event.target.value);
    });
    doctorcontactNoInput.addEventListener('input',(event)=>{
        validatePhone(doctorcontactNoInput,doctorContactFeedback,event.target.value);
    });
    clinicNameInput.addEventListener('input',(event)=>{
        if(event.target.value == '' || event.target.value == undefined){
            clinicNameInput.classList.add('is-invalid');
            clinicNameFeedback.textContent = 'Please enter value';
        }
        else{
            clinicNameInput.classList.remove('is-invalid');
            clinicNameInput.classList.add('is-valid');
        }
    });
    clinicAddressInput.addEventListener('input',(event)=>{
        if(event.target.value == '' || event.target.value == undefined){
            clinicAddressInput.classList.add('is-invalid');
            clinicAddressFeedback.textContent = 'Please enter value';
        }
        else{
            clinicAddressInput.classList.remove('is-invalid');
            clinicAddressInput.classList.add('is-valid');
        }
    });
    dateInput.addEventListener('input',(event)=>{
        validateDate(dateInput,dateFeedback,event.target.value);
    });
    commentsTextarea.addEventListener('input',(event)=>{
        if(commentsTextarea.classList.contains('is-invalid')){
            commentsTextarea.classList.remove('is-invalid');
            commentsTextarea.classList.add('is-valid');
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
                    availabilityBtn.textContent = `You are new!`
                    availabilityBtn.className = 'btn btn-success'
                    isAvailabilityBtn = true;
                }
                else {
                    // internal server error
                    alert("internal server error" + err.message);
                }
            });
    });
    // drop down handlers
    schoolDropDown.addEventListener('show.bs.dropdown',(event) => {
        getSchools()
        .then(data => {
            const loadingMsgDiv = schoolDropDownMenu.querySelector('.loadingMsg');
            if(loadingMsgDiv){
                loadingMsgDiv.remove();
            }
            let isFirstIteration = true;
            data.forEach(school => {
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
                schoolDropDownMenu.appendChild(createListElement(school.schoolName));
            }); 
        })
    });
    schoolDropDown.addEventListener('hide.bs.dropdown',(event) => {
        schoolDropDownMenu.innerHTML = '';
        const loadingTemp = document.getElementById('loadingTemplate');
        const loadingTempClone = loadingTemp.content.cloneNode(true);
        loadingTempClone.querySelector('div').className = 'loadingMsg m-3';
        schoolDropDownMenu.appendChild(loadingTempClone);
        schools = [];
        if(currentSchool === "Select School"){

        }
    });

    // handle form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        let isValid = true;
        let validities =[];

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
            comment : commentsTextarea.value
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

        // Empty value validation
        validateEmptyValue(allEntry);

        // Proceed submission
        if (isValid) {
            // Availability button validation
            if (isAvailabilityBtn === false) {
                availabilityBtn.classList.add('is-invalid');
            }
            else {
                if (isDoctorNew === true) {
                    const data = {
                        signature: signatureData
                    };
                    let signatureCredentials,studentId;
                    
                    // show loading modal
                    loadingModal.show();
                    uploadSignature(data)
                    .then(data => {
                        signatureCredentials = `${data.url};${today};${doctorNameInput.value}`;
                        doctorEntry.signatureData = signatureCredentials;

                        return Promise.all([postDoctorInfo(doctorEntry), postStudentInfo(studentEntry)]);
                    })
                    .then(([doctorResponse, studentResponse]) => {
                        studentId = studentResponse[0].insertId;
                        formEntry.studentId = studentId;
                        formEntry.doctorMCR = doctorMCRInput.value;
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
                        emptyOutStudentInputs();

                        let scrollableDiv = document.getElementById("formDiv");
                        scrollableDiv.scrollTop = 0;
                        doctorAutoFill(doctorMCRInput.value, doctorNameInput.value, signatureCredentials, clinicNameInput.value, clinicAddressInput.value, doctorcontactNoInput.value);
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
                        emptyOutStudentInputs();

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
