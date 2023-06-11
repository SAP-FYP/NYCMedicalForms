document.addEventListener('DOMContentLoaded', function () {
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
    const dateOfBirth = document.getElementById('studentDateOfBirth');
    const studentNRICInput = document.getElementById('studentNRIC');
    const studentClassInput = document.getElementById('studentClass');
    const courseDateInput = document.getElementById('courseDate');
    const dateOfVaccineInput = document.getElementById('dateOfVaccine');

    // physician sector
    const eligibilityRadios = document.getElementsByName('eligibility');
    const commentsTextarea = document.getElementById('medical_text');    
    const physicianNameInput = document.getElementById('physicianName');
    const clinicNameInput = document.getElementById('clinicName');
    const dateInput = document.getElementById('date');  
    const contactNoInput = document.getElementById('contactNo');
    const clinicAddressInput = document.getElementById('clinicAddress');
    const doctorMCRInput = document.getElementById('doctorMCR');
    
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
    document.getElementById("studentDateOfBirth").setAttribute("max", today);
    document.getElementById("courseDate").setAttribute("max", today);
    document.getElementById("date").setAttribute("max", today);

    // functions to carry out fetch requests
    const postDoctorInfo = (doctorEntry) => {
        return fetch('/postDoctorInfo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctorEntry)
        }).then(response => response.json());
    }
    
    const postStudentInfo = (studentEntry) => {
        return fetch('/postStudentInfo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentEntry)
        }).then(response => response.json());
    }

    clearSignatureBtn.addEventListener('click', function (event) {
        event.preventDefault();
        signaturePad.clear();
    });

    //still need to handle autofill for signature
    availabilityBtn.addEventListener('click', function (event) {
        event.preventDefault();
        // using POST method since doctorMCR is sensitive information so that it can be protected
        fetch('/checkDoctorMCR', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ doctorMCR: doctorMCRInput.value })
        })
            .then(response => {
                if(response.status === 404) {
                    // Doctor was not found
                    alert('No doctor found with the provided MCR.');
                    throw new Error('DoctorNotFound');
                }
                else if(response.status >= 500) {
                    // Server error
                    alert('An error occurred. Please try again later.');
                    throw new Error('ServerError');
                }
                return response.json();
            })
            .then(data => {
                const { doctorMCR, nameOfDoctor, signature, nameOfClinic, clinicAddress, contactNo } = data[0];
                //signature info extract
                const signInfoArr = signature.split(';');
                const signURL = signInfoArr[0];
                const existingDoctor = doctorMCR;

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
                availabilityBtn.textContent = "Welcome Back"
                document.getElementById("clearSignatureBtn").style.display = "none";
                //To make sure user checked doctorMCR availability before submitting form
                isAvailabilityBtn = true;
                // Doctor already exists
                isDoctorNew = false;
                currentDoctor = doctorMCR;
            })
            .catch(err => {
                if(err.message !=='DoctorNotFound'){
                    console.error(err);
                    alert('Internal Server Error');
                }
                else{
                    isAvailabilityBtn = true;
                    isDoctorNew = true;
                }
            });
    });
    
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const signatureData = signaturePad.toDataURL();
        const studentEntry = {
            studentName: studentNameInput.value,
            schoolName: schoolNameInput.value,
            dateOfBirth : dateOfBirth.value,
            studentNRIC: studentNRICInput.value,
            studentClass: studentClassInput.value,
            dateOfVaccine: dateOfVaccineInput.value,
        }
        const formEntry = {
            courseDate: courseDateInput.value,
            eligibility: Array.from(eligibilityRadios).find(radio => radio.checked)?.value || '',
            date: dateInput.value
        }
        const doctorEntry = {
            doctorMCR: doctorMCRInput.value,
            physicianName: physicianNameInput.value,
            signatureData : signatureData,
            clinicName: clinicNameInput.value,
            clinicAddress: clinicAddressInput.value,
            contactNo: contactNoInput.value
        }
        if(isAvailabilityBtn === false){
            // alert user to click the availability button first
            alert("Please click availability button first before submitting")
            }
        else{
            if(isDoctorNew === true){
                const allEntry = {...studentEntry,...formEntry, ...doctorEntry};
                for (let [key, value] of Object.entries(allEntry)) {
                    if (!value) {  // Check if value is missing or falsy (like an empty string)
                        alert(`Please fill out the ${key} field`);
                        return;  // Exit the function early
                    }
                }

                const data = {
                    signature: signatureData
                };

                fetch('/uploadSign',{
                    method : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(data => {
                    const year = today.getFullYear();
                    const month = today.getMonth() + 1;
                    const day = today.getDate();
                    const hours = today.getHours();
                    const minutes = today.getMinutes();
                    const seconds = today.getSeconds();
                    const fullDate = year + "/" + month + "/" + day + "/" + hours + ":" + minutes + ":" + seconds;
                    const signatureCredentials = `${data.url};${fullDate};${physicianNameInput.value}`
                    doctorEntry.signatureData = signatureCredentials;

                    Promise.all([postDoctorInfo(doctorEntry),postStudentInfo(studentEntry)])
                    .then((responses) => Promise.all(responses.map(response => response.json())))
                    .then(([doctorResponse, studentResponse]) => {
                        formEntry.studentId = studentResponse[0].insertId;
                        formEntry.doctorMCR = doctorMCRInput.value;
                        formEntry.comments = commentsTextarea.value;
                        return fetch('/postFormInfo',{
                            method : 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(formEntry)
                        })
                        .then(response=> response.json())
                        .then(data => {
                            alert(data)
                        })
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                })
            }
            else if(isDoctorNew === false){
                postStudentInfo(studentEntry)
                .then(data => {
                    console.log(data)
                    formEntry.studentId = data[0].insertId;
                    formEntry.doctorMCR = currentDoctor;
                    formEntry.comments = commentsTextarea.value;
                    return fetch('/postFormInfo',{
                        method : 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formEntry)
                    })
                    .then(response=> response.json())
                    .then(data => {
                        studentNameInput.value = '';
                        schoolNameInput.value = '';
                        dateOfBirth.value = '';
                        studentNRICInput.value = '';
                        studentClassInput.value = '';
                        courseDateInput.value = '';
                        dateOfVaccineInput.value = '';

                        for(let i = 0; i < eligibilityRadios.length; i++){
                            eligibilityRadios[i].checked = false;
                        }
                        commentsTextarea.value = '';

                        let scrollableDiv = document.getElementById("doctorForm");
                        scrollableDiv.scrollTop = 0;
                    })
                })
            }
        }
    });
});
