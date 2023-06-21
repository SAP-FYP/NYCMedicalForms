window.addEventListener("DOMContentLoaded", function () {
  // Check if URL contains encrypted StudentID
  const urlParams = new URLSearchParams(window.location.search);
  const encrypted = urlParams.get("encrypted");

  if (!encrypted || encrypted.length !== 32) {
    window.location.href = "/acknowledgement";
  }

  // Signature Pad
  const canvas = document.getElementById("parent-signature-canvas");
  const signaturePad = new SignaturePad(canvas);
  // Signature Pad clear button
  const clearBtn = document.getElementById("clear-parent-signature");
  clearBtn.addEventListener("click", function (e) {
    e.preventDefault();
    signaturePad.clear();
  });

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
  const physicianSignature = document.getElementById("doctor-signature");

  // Retrieve form details based on encrypted StudentID
  axios
    .get("/form/" + encrypted)
    .then((response) => {
      const data = response.data.form;
      // Student
      studentName.value = data.nameOfStudent;
      studentNRIC.value = data.studentNRIC;
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
        
        // TODO Pull doctor signature
      //   physicianSignature.src = data.signature;

      // Parent
      const parentContactNo = document.getElementById("parent-contact");
      const parentEmail = document.getElementById("parent-email");

      parentContactNo.value = data.parentContactNo;
      parentEmail.value = data.parentEmail;
    })
    .catch((error) => {
      console.log(error);
    });

  // Get password (DOB + NRIC) from localstorage
  const user = JSON.parse(localStorage.getItem("user"));
  const password = user.dateOfBirth + user.studentNRIC;

  // ! JWT for parents

  // Retrieve all data filled in on Parent Section
  const parentName = document.getElementById("parent-name");
  const parentNRIC = document.getElementById("parent-nric");

//   Change to UTC
  const date = new Date().toLocaleDateString("en-SG").split("/").join("-");

  // On submit
  const submitBtn = document.getElementById("submit-button");
  submitBtn.addEventListener("click", function (e) {
    e.preventDefault();

    // Check if fields are filled in
    if (!parentName.value || !parentNRIC.value) {
        // TODO PROPER ERROR HANDLING
      alert("Please fill in all fields");
      return;
    }

    // NRIC VALIDATION

    // Check if the NRIC/FIN length is valid
if (parentNRIC.value.length !== 9) {
        // TODO PROPER ERROR HANDLING
    alert("Please enter a valid NRIC/FIN");
    return;
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
        // TODO PROPER ERROR HANDLING

    alert("Please enter a valid NRIC/FIN");
    return;
  }
  
  // Multiply each digit by its weight and sum the products
  let sum = offset;
  for (let i = 1; i < parentNRIC.value.length - 1; i++) {
    const digit = parseInt(parentNRIC.value.charAt(i));
    if (isNaN(digit)) {
        // TODO PROPER ERROR HANDLING

      alert("Please enter a valid NRIC/FIN");
      return;
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
        // TODO PROPER ERROR HANDLING

    alert("Please enter a valid NRIC/FIN");
    return;
  }  

    //
    //  Change signaturePad to cloundinary URL(?)
    axios
      .put("/parent/acknowledge", {
        encrypted: encrypted,
        parentNRIC: parentNRIC.value.slice(-4),
        nameOfParent: parentName.value,
        dateOfAcknowledgement: date,
        parentSignature: signaturePad.toDataURL(),
      })
      .then((response) => {
        // window.location.href = "/acknowledgement/success";
      })
      .catch((error) => {
        // TODO Add error handling
        
        console.log(error);
      });
  });
});
