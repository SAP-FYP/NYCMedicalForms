window.addEventListener("DOMContentLoaded", function () {
  // Check if URL contains encrypted StudentID
  const urlParams = new URLSearchParams(window.location.search);
  const encrypted = urlParams.get("encrypted");
  const baseURL = window.location.origin;

  // Student
  const studentName = document.getElementById("student-name");
  const studentNRIC = document.getElementById("student-nric");
  const studentDOB = document.getElementById("student-dob");
  const studentClass = document.getElementById("student-class");
  const studentSchool = document.getElementById("school-name");
  const studentDateOfVaccination = document.getElementById("date-of-vaccine");
  const studentCourseDate = document.getElementById("course-date");

  // Form
  const studentEligiblity = document.querySelectorAll(".student-eligibility");
  const studentComments = document.getElementById("medical-comment");
  const dateOfExamination = document.getElementById("date-of-examination");

  // Physician
  const physicianName = document.getElementById("physician-name");
  const physicianMCR = document.getElementById("doctor-mcr");
  const physicianClinicName = document.getElementById("clinic-name");
  const physicianClinicAddress = document.getElementById("clinic-address");
  const physicianContactNo = document.getElementById("doctor-contact");
  const physicianSignature = document.getElementById("doctor-signature-image");

  // Parent
  const parentName = document.getElementById("parent-name");
  const parentNRIC = document.getElementById("parent-nric");
  const parentContactNo = document.getElementById("parent-contact");
  const parentEmail = document.getElementById("parent-email");

  // Acknowledge Button
  const acknowledgeBtn = document.getElementById("acknowledge-button");

  const alertContainer = document.getElementById('alertbox');
  function alertBox(message, type) {
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
    } else if (type === 'rejected') {
      alertIcon.setAttribute('xlink:href', '#exclamation-triangle-fill');
      alertColor = 'alert-success';
    }

    alertMessage.textContent = message;
    alertContainer.classList.add(alertColor)
    alertContainer.classList.add('alert-visible');
    alertContainer.classList.remove('alert-hidden');
    alertContainer.style.zIndex = 99999;

    setTimeout(() => {
      alertContainer.classList.add('alert-hidden');
      alertContainer.classList.remove('alert-visible');
      alertContainer.classList.remove(alertColor);
    }, 4000);
  };

  // Retrieving of form details
  let retrieveForm = axios
    .get("/form/" + encrypted)
    .then((response) => {
      const configURL = baseURL + response.config.url;
      const requestURL = response.request.responseURL;
      if (configURL !== requestURL) {
        window.location.href = requestURL;
        throw new Error("redirected");
      }
      const data = response.data.form;
      // Student
      studentName.value = data.nameOfStudent;
      studentNRIC.value = "****" + data.studentNRIC;
      studentDOB.value = new Date(data.dateOfBirth)
        .toLocaleDateString("en-SG")
        .split("/")
        .join("-");
      studentClass.value = data.class;
      studentSchool.value = data.school;
      studentCourseDate.value = new Date(data.courseDate)
        .toLocaleDateString("en-SG")
        .split("/")
        .join("-");
      studentDateOfVaccination.value = new Date(data.dateOfVaccination)
        .toLocaleDateString("en-SG")
        .split("/")
        .join("-");
      // Form
      studentEligiblity.forEach((element) => {
        if (element.value === data.eligibility) {
          element.checked = true;
        }
      });
      studentComments.value = data.comments;
      // Physician
      physicianName.value = data.nameOfDoctor;
      physicianMCR.value = data.doctorMCR;
      physicianClinicName.value = data.nameOfClinic;
      physicianClinicAddress.value = data.clinicAddress;
      physicianContactNo.value = data.contactNo;
      // Format the date and TimeZone
      dateOfExamination.value = new Date(data.examinationDate)
        .toLocaleDateString("en-SG")
        .split("/")
        .join("-");

      // Physician Signature
      physicianSignature.src = data.signature;

      parentContactNo.value = data.parentContactNo;
      parentEmail.value = data.parentEmail;
    })
    .catch((error) => {
      alertBox('You have an invalid URL.', 'danger');
    });

  let verifyIfAcknowledged = axios.post('/parent/login-verify', {
    encrypted: encrypted
  }).then((response) => {
    const acknowledged = response.data.statusOfAcknowledgement;
    if (acknowledged === 'Acknowledged') {
      alreadyAcknowledged();
    }
    if (acknowledged === 'Pending Parent') {
      requireAcknowledgement();
    }
    if (acknowledged === undefined) {
      throw new Error('You have an invalid URL.');
    }
  }).catch((error) => {
    window.location.href = '/acknowledgement/';
  });



  const requireAcknowledgement = function () {

    const validities = {
      isParentNameValid: false,
      isParentNRICValid: false,
    }

    const parentNameFeedback = document.getElementById("parent-name-feedback");
    const parentNRICFeedback = document.getElementById("parent-nric-feedback");


    // Signature Pad
    const canvas = document.getElementById("parent-signature-canvas");
    const signaturePad = new SignaturePad(canvas);

    // Signature Pad clear button
    const clearBtn = document.getElementById("clear-parent-signature");
    clearBtn.addEventListener("click", function (e) {
      e.preventDefault();
      signaturePad.clear();
    });

    //   Change to UTC
    const date = new Date().toISOString().split("T")[0];

    // Inline validation
    parentName.addEventListener("input", function (e) {
      e.preventDefault();
      if (parentName.value.length < 1) {
        parentName.classList.add("is-invalid");
        validities.isParentNameValid = false;
        parentNameFeedback.textContent = "Please enter a valid name";
      } else {
        parentName.classList.remove("is-invalid");
        validities.isParentNameValid = true;
        parentNameFeedback.textContent = "";
      }
    });

    parentNRIC.addEventListener("input", function (e) {
      e.preventDefault();

      // NRIC VALIDATION
  
      // Check if the NRIC/FIN length is valid
      if (parentNRIC.value.length !== 9) {
        parentNRIC.classList.add("is-invalid");
        validities.isParentNRICValid = false;
        parentNRICFeedback.textContent = "Please enter a valid NRIC/FIN";
      } else {
        parentNRIC.classList.remove("is-invalid");
        validities.isParentNRICValid = true;
        parentNRICFeedback.textContent = "";
      }

      // Weights for NRIC/FIN
      const weights = [2, 7, 6, 5, 4, 3, 2];

      // Extract the first character and determine the offset value
      const firstChar = parentNRIC.value.charAt(0).toUpperCase();
      let offset = 0;
      if (firstChar === 'G' || firstChar === 'T') {
        offset = 4;
      } else if (firstChar === 'F') {
        offset = 5;
      } else if (firstChar === 'S' || firstChar === 'T') {
        offset = 0;
      } else if (firstChar === 'M') {
        offset = 3;
      } else {
        parentNRIC.classList.add("is-invalid");
        validities.isParentNRICValid = false;
        parentNRICFeedback.textContent = "Please enter a valid NRIC/FIN";
      }

      // Multiply each digit by its weight and sum the products
      let sum = offset;
      for (let i = 1; i < parentNRIC.value.length - 1; i++) {
        const digit = parseInt(parentNRIC.value.charAt(i));
        if (isNaN(digit)) {
          parentNRIC.classList.add("is-invalid");
          validities.isParentNRICValid = false;
          parentNRICFeedback.textContent = "Please enter a valid NRIC/FIN";
        }
        sum += digit * weights[i - 1];
      }

      // Divide the sum by 11 to obtain the remainder
      const remainder = sum % 11;

      // Subtract (remainder + 1) from 11 to obtain the check digit
      const checkDigit = 11 - remainder - 1;

      // Check the check digit against the table to obtain the last letter
      const lastLetter = parentNRIC.value.charAt(parentNRIC.value.length - 1).toUpperCase();
      const checkTable = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'Z', 'J'];
      if (lastLetter !== checkTable[checkDigit]) {
        parentNRIC.classList.add("is-invalid");
        validities.isParentNRICValid = false;
        parentNRICFeedback.textContent = "Please enter a valid NRIC/FIN";
      }
    });




    // When acknowledgement form is submitted
    acknowledgeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      // Check if fields are filled in
      if (validities.isParentNameValid === false) {
        parentName.classList.add("is-invalid");
        parentNameFeedback.textContent = "Please enter a valid name";
        return;
      }

      if (validities.isParentNRICValid === false) {
        parentNRIC.classList.add("is-invalid");
        parentNRICFeedback.textContent = "Please enter a valid NRIC/FIN";
        return;
      }

      // Check if signature is empty
      if (signaturePad.isEmpty()) {
        alertBox("Please sign the form", "danger");
        return;
      }

      // Verification if signature is empty
      if (signaturePad.isEmpty()) {
        alertBox("Please sign the form before submitting.", "danger");
        return;
      }

      function handleSuccess(responses) {
        responses.forEach((res) => {
          const configURL = baseURL + res.config.url;
          const requestURL = res.request.responseURL;

          if (configURL !== requestURL) {
            window.location.href = requestURL;
            throw new Error("redirected");
          }
        });

        alertBox("You have successfully acknowledged the form. Thank you!", "success");
      }

      function handleError(error) {
        alertBox("There seems to be an error. Please try again later.", "danger");
        console.log(error);
      }

      axios.post("/parent-sign-upload", {
        parentSignature: signaturePad.toDataURL(),
      })
        .then((response) => {
          const configURL = baseURL + response.config.url;
          const requestURL = response.request.responseURL;

          if (configURL !== requestURL) {
            window.location.href = requestURL;
            throw new Error("redirected");
          }

          parentSignature = `${response.data.url}`;

          const updateParentAcknowledgement = axios.put("/parent/acknowledge", {
            encrypted: encrypted,
            parentNRIC: parentNRIC.value.slice(-4),
            nameOfParent: parentName.value,
            dateOfAcknowledgement: date,
            parentSignature: parentSignature
          });

          const updateFormStatus = axios.put("/parent/status", {
            encrypted: encrypted,
          });


          return Promise.all([updateParentAcknowledgement, updateFormStatus]);
        })
        .then(handleSuccess)
        .then(() => {
          acknowledgeBtn.remove();
          const parentAcknowledgement = document.getElementById("acknowledgement");
          const p = document.createElement("p");
          const newDate = date.split("-").reverse().join("/");
          p.textContent = `You have acknowledged the form on ${newDate}`;
          parentAcknowledgement.appendChild(p);

          // Disable all fields
          parentName.disabled = true;
          parentNRIC.disabled = true;
          signaturePad.off();
          clearBtn.remove();
          canvas.style.backgroundColor = "#d0d0d0";

          // Remove feedback
          parentNameFeedback.remove();
          parentNRICFeedback.remove();


        })
        .catch(handleError);
    });
  };

  const alreadyAcknowledged = function () {
    axios.post("/parent/acknowledged", {
      encrypted: encrypted,
    })
      .then((response) => {
        const configURL = baseURL + response.config.url;
        const requestURL = response.request.responseURL;
        if (configURL !== requestURL) {
          window.location.href = requestURL;
          throw new Error("redirected");
        }

        const data = response.data.user;

        parentName.value = data.nameOfParent;
        parentNRIC.value = "****" + data.parentNRIC;
        // Convert date to local time
        const parsedDate = new Date(data.dateOfAcknowledgement).toLocaleDateString();

        parentName.disabled = true;
        parentNRIC.disabled = true;

        // Remove acknowledge button and add text with the date of acknowledgement
        acknowledgeBtn.remove();
        const parentAcknowledgement = document.getElementById("acknowledgement");
        const p = document.createElement("p");
        p.textContent = `You have acknowledged the form on ${parsedDate}`;
        parentAcknowledgement.appendChild(p);


        // Remove clear button
        const clearBtn = document.getElementById("clear-parent-signature");
        clearBtn.remove();

        // Replace canvas with image
        const canvas = document.getElementById("parent-signature-canvas");
        const img = document.createElement("img");
        img.src = data.parentSignature;
        img.style.border = "1px solid #485EAB";
        img.style.backgroundColor = "rgb(208, 208, 208)";
        img.style.width = "100%";
        img.alt = "Parent Signature";
        img.className = "img-fluid";
        img.height = "210";
        img.id = "parent-signature-img";
        canvas.replaceWith(img);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  Promise.all([retrieveForm, verifyIfAcknowledged])
    .catch((error) => {
      console.log(error);
    });
})

