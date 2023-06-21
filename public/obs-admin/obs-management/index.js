API_URL = `http://localhost:3000/obs-admin/pmt`;
document.addEventListener("DOMContentLoaded", function () {
  axios.get(`${API_URL}/all`)
    .then(function (response) {
      const configURL = response.config.url;
      const requestURL = response.request.responseURL;
      if (configURL !== requestURL) {
        window.location.href = "/error?code=403";
        throw new Error("redirected");
      }
      const formData = response.data;
      console.log(response);
      const formCounts = formData.reduce(
        (counts, form) => {
          if (form.formStatus === "Pending" ) {
            counts.pending++;
          } else if (form.formStatus === "Approved") {
            counts.approved++;
          } else if (form.formStatus === "Rejected") {
            counts.rejected++;
          } else if (form.formStatus === "Pending Parent") {
            counts.pendingParent++;
          }
          return counts;
        },
        { pendingParent: 0, pending: 0, approved: 0, rejected: 0 }
      );
      console.log(formCounts);
      console.log(formCounts.pending);

      const pendingParentAmtElement = document.querySelector('.pendingParentAmt');
      const pendingAmtElement = document.querySelector('.pendingAmt');
      const apprAmtElement = document.querySelector('.apprAmt');
      const rejAmtElement = document.querySelector('.rejAmt');

      pendingParentAmtElement.textContent = `${formCounts.pendingParent}`;
      pendingAmtElement.textContent = `${formCounts.pending}`;
      apprAmtElement.textContent = `${formCounts.approved}`;
      rejAmtElement.textContent = `${formCounts.rejected}`;

      // Loop through the data and add it to the page
      for (i = 0; i < formData.length; i++) {
        const dateObj = new Date(formData[i].courseDate);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        // Get references to the status container and template
        const getAllForms = document.querySelector('#getAllForms');
        const rowTemplate = document.querySelector('.row-table-template');

        //clear html content in getAllForms once
        if (i === 0) {
          getAllForms.innerHTML = "";
        }
        // Clone the template and append it to the status container
        const templateContent = rowTemplate.content;
        const clonedRowTemplate = document.importNode(templateContent, true);

        const studentNRICCell = clonedRowTemplate.querySelector('.studentNRIC');
        studentNRICCell.textContent = `***${formData[i].studentNRIC}`;

        const nameOfStudentCell = clonedRowTemplate.querySelector('.studentName');
        nameOfStudentCell.textContent = formData[i].nameOfStudent;
        nameOfStudentCell.setAttribute("nameOfStudent", formData[i].nameOfStudent);

        const classCell = clonedRowTemplate.querySelector('.studentClass');
        classCell.textContent = formData[i].class;

        const schoolCell = clonedRowTemplate.querySelector('.studentSch');
        schoolCell.textContent = formData[i].school;

        const eligibilityCell = clonedRowTemplate.querySelector('.studentEligibility');
        eligibilityCell.textContent = formData[i].eligibility;

        const formattedDateCell = clonedRowTemplate.querySelector('.courseDate');
        formattedDateCell.textContent = formattedDate;

        //get all modalBtns and add attribute so that checkbox will not be affected by openModal function
        const modalBtn1 = clonedRowTemplate.querySelector('.modalBtn1');
        const modalBtn2 = clonedRowTemplate.querySelector('.modalBtn2');
        const modalBtn3 = clonedRowTemplate.querySelector('.modalBtn3');
        const modalBtn4 = clonedRowTemplate.querySelector('.modalBtn4');
        const modalBtn5 = clonedRowTemplate.querySelector('.modalBtn5');
        const modalBtn6 = clonedRowTemplate.querySelector('.modalBtn6');
        const modalBtn7 = clonedRowTemplate.querySelector('.modalBtn7');
        const modalBtns = [modalBtn1, modalBtn2, modalBtn3, modalBtn4, modalBtn5, modalBtn6, modalBtn7];

        modalBtns.forEach(function (modalBtn) {
          modalBtn.setAttribute("data-bs-toggle", "modal");
        });

        const formStatusDiv = clonedRowTemplate.querySelector('.pillPending');
        formStatusDiv.textContent = formData[i].formStatus;

        //To change the color of the pill
        if (formData[i].formStatus === "Pending") {
          formStatusDiv.classList.add("pillPending");
        } else if (formData[i].formStatus === "Rejected") {
          formStatusDiv.classList.add("pillRejected");
        } else if (formData[i].formStatus === "Approved") {
          formStatusDiv.classList.add("pillApproved");
        } else if (formData[i].formStatus === "Pending Parent") {
          formStatusDiv.classList.add("pillParent");
        }

        getAllForms.appendChild(clonedRowTemplate);

        function handleFormClick(index) {
          //index = i;
          // Check if the index is within the valid range of the formData array
          if (index >= 0 && index < formData.length) {
            // Retrieve the formStatus of the clicked form at the given index
            const formStatus = formData[index].formStatus;
            //loop to add attribute to all .modalBtn
            // Set the appropriate data-bs-target attribute based on the formStatus
            modalBtns.forEach(function (modalBtn) {
              if (formStatus === "Pending") {
                modalBtn.setAttribute("data-bs-target", "#staticBackdrop");
              } else if (formStatus === "Approved") {
                modalBtn.setAttribute("data-bs-target", "#staticBackdropAppr");
              } else if (formStatus === "Rejected") {
                modalBtn.setAttribute("data-bs-target", "#staticBackdropRej");
              } else if (formStatus === "Pending Parent") {
                modalBtn.setAttribute("data-bs-target", "#staticBackdrop");
              }
            });
          }
        }
        // Call the handleFormClick function with the current value of i
        handleFormClick(i);

        modalBtns.forEach(function (modalBtn) {
          modalBtn.addEventListener("mousedown", function () {
            openModal(nameOfStudentCell.getAttribute("nameOfStudent"));
            modalBtn.classList.add("changePill");
          });
        });
      }
    })
    .catch(function (error) {
      if (error && error.message !=="redirected") {
      console.log(error);
      }
      console.log(error);
    });
});

const searchInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector('#search-button');
const searchClearBtn = document.querySelector('#clear-button');

function searchForms() {
  if (searchInput.value.trim() === '') {
    location.reload();
  } else {
axios.get(`${API_URL}/search/${searchInput.value}`)
  .then(function (response) {
const configURL = response.config.url;
      const requestURL = response.request.responseURL;
      if (configURL !== requestURL) {
        window.location.href = "/error?code=403";
        throw new Error("redirected");
      }
      const formData = response.data;
      console.log(response);
      const formCounts = formData.reduce(
        (counts, form) => {
          if (form.formStatus === "Pending" ) {
            counts.pending++;
          } else if (form.formStatus === "Approved") {
            counts.approved++;
          } else if (form.formStatus === "Rejected") {
            counts.rejected++;
          } else if (form.formStatus === "Pending Parent") {
            counts.pendingParent++;
          }
          return counts;
        },
        { pendingParent: 0, pending: 0, approved: 0, rejected: 0 }
      );
      console.log(formCounts);
      console.log(formCounts.pending);

      const pendingParentAmtElement = document.querySelector('.pendingParentAmt');
      const pendingAmtElement = document.querySelector('.pendingAmt');
      const apprAmtElement = document.querySelector('.apprAmt');
      const rejAmtElement = document.querySelector('.rejAmt');

      pendingParentAmtElement.textContent = `${formCounts.pendingParent}`;
      pendingAmtElement.textContent = `${formCounts.pending}`;
      apprAmtElement.textContent = `${formCounts.approved}`;
      rejAmtElement.textContent = `${formCounts.rejected}`;

      // Loop through the data and add it to the page
      for (i = 0; i < formData.length; i++) {
        const dateObj = new Date(formData[i].courseDate);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        // Get references to the status container and template
        const getAllForms = document.querySelector('#getAllForms');
        const rowTemplate = document.querySelector('.row-table-template');

        //clear html content in getAllForms once
        if (i === 0) {
          getAllForms.innerHTML = "";
        }
        // Clone the template and append it to the status container
        const templateContent = rowTemplate.content;
        const clonedRowTemplate = document.importNode(templateContent, true);

        const studentNRICCell = clonedRowTemplate.querySelector('.studentNRIC');
        studentNRICCell.textContent = `***${formData[i].studentNRIC}`;

        const nameOfStudentCell = clonedRowTemplate.querySelector('.studentName');
        nameOfStudentCell.textContent = formData[i].nameOfStudent;
        nameOfStudentCell.setAttribute("nameOfStudent", formData[i].nameOfStudent);

        const classCell = clonedRowTemplate.querySelector('.studentClass');
        classCell.textContent = formData[i].class;

        const schoolCell = clonedRowTemplate.querySelector('.studentSch');
        schoolCell.textContent = formData[i].school;

        const eligibilityCell = clonedRowTemplate.querySelector('.studentEligibility');
        eligibilityCell.textContent = formData[i].eligibility;

        const formattedDateCell = clonedRowTemplate.querySelector('.courseDate');
        formattedDateCell.textContent = formattedDate;

        //get all modalBtns and add attribute so that checkbox will not be affected by openModal function
        const modalBtn1 = clonedRowTemplate.querySelector('.modalBtn1');
        const modalBtn2 = clonedRowTemplate.querySelector('.modalBtn2');
        const modalBtn3 = clonedRowTemplate.querySelector('.modalBtn3');
        const modalBtn4 = clonedRowTemplate.querySelector('.modalBtn4');
        const modalBtn5 = clonedRowTemplate.querySelector('.modalBtn5');
        const modalBtn6 = clonedRowTemplate.querySelector('.modalBtn6');
        const modalBtn7 = clonedRowTemplate.querySelector('.modalBtn7');
        const modalBtns = [modalBtn1, modalBtn2, modalBtn3, modalBtn4, modalBtn5, modalBtn6, modalBtn7];

        modalBtns.forEach(function (modalBtn) {
          modalBtn.setAttribute("data-bs-toggle", "modal");
        });

        const formStatusDiv = clonedRowTemplate.querySelector('.pillPending');
        formStatusDiv.textContent = formData[i].formStatus;

        //To change the color of the pill
        if (formData[i].formStatus === "Pending") {
          formStatusDiv.classList.add("pillPending");
        } else if (formData[i].formStatus === "Rejected") {
          formStatusDiv.classList.add("pillRejected");
        } else if (formData[i].formStatus === "Approved") {
          formStatusDiv.classList.add("pillApproved");
        } else if (formData[i].formStatus === "Pending Parent") {
          formStatusDiv.classList.add("pillParent");
        }

        getAllForms.appendChild(clonedRowTemplate);

        function handleFormClick(index) {
          //index = i;
          // Check if the index is within the valid range of the formData array
          if (index >= 0 && index < formData.length) {
            // Retrieve the formStatus of the clicked form at the given index
            const formStatus = formData[index].formStatus;
            //loop to add attribute to all .modalBtn
            // Set the appropriate data-bs-target attribute based on the formStatus
            modalBtns.forEach(function (modalBtn) {
              if (formStatus === "Pending") {
                modalBtn.setAttribute("data-bs-target", "#staticBackdrop");
              } else if (formStatus === "Approved") {
                modalBtn.setAttribute("data-bs-target", "#staticBackdropAppr");
              } else if (formStatus === "Rejected") {
                modalBtn.setAttribute("data-bs-target", "#staticBackdropRej");
              } else if (formStatus === "Pending Parent") {
                modalBtn.setAttribute("data-bs-target", "#staticBackdrop");
              }
            });
          }
        }
        // Call the handleFormClick function with the current value of i
        handleFormClick(i);

        modalBtns.forEach(function (modalBtn) {
          modalBtn.addEventListener("mousedown", function () {
            openModal(nameOfStudentCell.getAttribute("nameOfStudent"));
            modalBtn.classList.add("changePill");
          });
        });
      }
    })
    .catch(function (error) {
      if (error && error.message !=="redirected") {
      console.log(error);
      }
      console.log(error);
    });
  }

}
searchBtn.addEventListener('click', () => {
  searchForms();
});

searchInput.addEventListener('keypress', event => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchForms();
  }
});

searchClearBtn.onclick = () => {
  searchInput.value = "";
  searchForms();
}


////////////////////////////
//FUNCTION TO OPEN MODAL VIA CLICKING ON THE TABLE ROW
////////////////////////////
function openModal(studentName) {
  // Perform additional actions or make API requests using the studentName
  axios.get(`${API_URL}/${studentName}`)
    .then(function (response) {
      const formData = response.data[0];
      console.log(formData);

      //Format the courseDate
      // const dateObjCourseDate = new Date(formData.courseDate);
      // const yearCourseDate = dateObjCourseDate.getFullYear();
      // const monthCourseDate = String(dateObjCourseDate.getMonth() + 1).padStart(2, "0");
      // const dayCourseDate = String(dateObjCourseDate.getDate()).padStart(2, "0");
      // const formattedCourseDate = `${yearCourseDate}-${monthCourseDate}-${dayCourseDate}`;
      const dateObjCourseDate = new Date(formData.courseDate);
      const formatToLocal = dateObjCourseDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const datePartsCourseDate = formatToLocal.split("/");
      const formattedCourseDate = `${datePartsCourseDate[2]}-${datePartsCourseDate[0]}-${datePartsCourseDate[1]}`;
    
      //Format the dateOfVaccination
      const dateObjVaccinationDate = new Date(formData.courseDate);
      const formatToLocal2 = dateObjVaccinationDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const datePartsVaccinationDate = formatToLocal2.split("/");
      const formattedVaccinationDate = `${datePartsVaccinationDate[2]}-${datePartsVaccinationDate[0]}-${datePartsVaccinationDate[1]}`;

      //Format the examDate
      const dateObjExamDate = new Date(formData.courseDate);
      const formatToLocal3 = dateObjExamDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const datePartsExamDate = formatToLocal3.split("/");
      const formattedExamDate = `${datePartsExamDate[2]}-${datePartsExamDate[0]}-${datePartsExamDate[1]}`;

      //Format the dateOfBirth
      const dateObjDob = new Date(formData.dateOfBirth);
      const formatToLocal4 = dateObjDob.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const datePartsDob= formatToLocal4.split("/");
      const formattedDateOfBirth = `${datePartsDob[2]}-${datePartsDob[0]}-${datePartsDob[1]}`;

      //Format the dateOfAcknowledgement
      const dateObjAckDate = new Date(formData.dateOfAcknowledgement);
      const formatToLocal5 = dateObjAckDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const datePartsAckDate= formatToLocal5.split("/");
      const formattedAckDate = `${datePartsAckDate[2]}-${datePartsAckDate[0]}-${datePartsAckDate[1]}`;


      

      //call exportToExcel function
      const exportBtns = document.querySelectorAll(".exportBtn");
      exportBtns.forEach((exportBtn) => {
        exportBtn.addEventListener("click", handleExportClick);
      });

      function handleExportClick(e) {
        e.preventDefault(); // prevent the default form submission behavior
        // Get the values of the input fields
        const applicantName = String(formData.nameOfStudent);
        const schoolOrg = String(formData.school);
        const classNo = String(formData.class);
        const courseDate = String(formattedCourseDate);

        exportToExcel(applicantName, schoolOrg, classNo, courseDate);
        console.log(applicantName, schoolOrg, classNo, courseDate);

        // Remove the event listener to avoid repeated downloads
        exportBtns.forEach((exportBtn) => {
          exportBtn.removeEventListener("click", handleExportClick);
        });
      }

      openFormModal(formData, formattedCourseDate, formattedVaccinationDate,formattedExamDate,formattedAckDate );
      
    })
    .catch(function (error) {
      // Handle errors
      console.log(error);
    });
}


////////////////////////////
//FUNCTION TO OPEN FORM MODAL
////////////////////////////
function openFormModal(formData, formattedCourseDate, formattedVaccinationDate,formattedExamDate,formattedAckDate ) {


  const nameInput = document.querySelector('#applicantName');
  const schoolInput = document.querySelector('#schoolOrg');
  const nricInput = document.querySelector('#personalId');
  const classInput = document.querySelector('#designation');
  const courseDateInput = document.querySelector('#courseDate');
  const dateVacInput = document.querySelector('#tetanusVaccine');
  const additonalInput = document.querySelector('#medicalText');
  const doctorNameInput = document.querySelector('#physicianName');
  const doctoMCRInput = document.querySelector('#mcrNo');
  const clinicNameInput = document.querySelector('#clinicName');
  const examDateInput = document.querySelector('#examDate');
  const doctorContactInput = document.querySelector('#contactNo');
  const clinicAddressInput = document.querySelector('#clinicAddress');
  const doctorSignatureInput = document.querySelector('#signatureData');
  const parentName = document.querySelector('#parent-name');
  const parentNRIC = document.querySelector('#parent-nric');
  const parentContact = document.querySelector('#parent-contact');
  const parentDate = document.querySelector('#parent-date');
  const parentSignature = document.querySelector('#parent-signature');

  // Set input field values
  nameInput.value = `${formData.nameOfStudent}`;
  schoolInput.value = `${formData.school}`;
  nricInput.value = `****${formData.studentNRIC}`;
  classInput.value = `${formData.class}`;
  courseDateInput.value = `${formattedCourseDate}`;
  dateVacInput.value = `${formattedVaccinationDate}`;
  additonalInput.value = `${formData.review}`;
  doctorNameInput.value = `${formData.nameOfDoctor}`;
  doctoMCRInput.value = `${formData.doctorMCR}`;
  clinicNameInput.value = `${formData.nameOfClinic}`;
  examDateInput.value = `${formattedExamDate}`;
  doctorContactInput.value = `${formData.contactNo}`;
  clinicAddressInput.value = `${formData.clinicAddress}`;
  doctorSignatureInput.value = `${formData.signature}`;
  parentName.value = `${formData.nameOfParent}`;

  parentNRIC.value = `****${formData.parentNRIC}`;
  parentContact.value = `${formData.parentContactNo}`;
  parentDate.value = `${formattedAckDate}`;
  parentSignature.value = `${formData.parentSignature}`;

  // if (formData.formStatus === "Pending Parent") {
  //   const apprRejContainer = document.querySelector('#apprRejContainer');
  //   apprRejContainer.innerHTML = ''
  //   const pmtHeadingForm = document.querySelector('#pmtHeadingForm');
  //   pmtHeadingForm.innerHTML = ''
  // }
  if (formData.formStatus === "Pending") {
    const pmtHeadingForm = document.querySelector('#pmtHeadingForm');
    // Create the h4 element
    const h4 = document.createElement('h4');
    h4.textContent = 'Partnership Management Team:';
    pmtHeadingForm.appendChild(h4);

    const apprRejContainer = document.querySelector('#apprRejContainer');
    // Create the label element
    const label = document.createElement('label');
    label.setAttribute('for', 'medical_check');
    label.setAttribute('class', 'text-center mx-auto w-75');
    label.textContent = "I, the undersigned, have assessed the Applicant's Registration Form, examined the Applicant & approve him/her to be (please tick):";

    // Create the container div
    const containerDiv = document.createElement('div');
    containerDiv.setAttribute('class', 'col-12 text-center mb-4');
    containerDiv.appendChild(label);

    // Create the Approve button
    const approveBtn = document.createElement('button');
    approveBtn.setAttribute('type', 'button');
    approveBtn.setAttribute('class', 'btn btn-secondary approve-btn');
    approveBtn.setAttribute('id', 'approveBtn');
    approveBtn.setAttribute("data-bs-toggle", "modal");
    approveBtn.setAttribute("data-bs-target", "#staticBackdropAppr");
    approveBtn.textContent = 'Approve';

    // Create the vertical line
    const verticalLine = document.createElement('div');
    verticalLine.setAttribute('class', 'verticalLine mx-3');

    // Create the Reject button
    const rejectBtn = document.createElement('button');
    rejectBtn.setAttribute('type', 'button');
    rejectBtn.setAttribute('class', 'btn btn-secondary reject-btn');
    rejectBtn.setAttribute('id', 'rejectBtn');
    rejectBtn.setAttribute("data-bs-toggle", "modal");
    rejectBtn.setAttribute("data-bs-target", "#staticBackdropRej");
    rejectBtn.textContent = 'Reject';

    // Create the container div for the buttons
    const buttonContainerDiv = document.createElement('div');
    buttonContainerDiv.setAttribute('class', 'col-12 text-center mb-3 d-flex justify-content-center align-items-center mt-3');
    buttonContainerDiv.setAttribute('id', 'appr-rej-container');
    buttonContainerDiv.appendChild(approveBtn);
    buttonContainerDiv.appendChild(verticalLine);
    buttonContainerDiv.appendChild(rejectBtn);



    // Add the elements to the parent element
    apprRejContainer.appendChild(containerDiv);
    apprRejContainer.appendChild(buttonContainerDiv);

  }

  const closeBtn = document.querySelector('.closeBtn');
  closeBtn.addEventListener('click', function () {
    const apprRejContainer = document.querySelector('#apprRejContainer');
    apprRejContainer.innerHTML = ''
    const pmtHeadingForm = document.querySelector('#pmtHeadingForm');
    pmtHeadingForm.innerHTML = ''
  });


  const rejectBtn = document.querySelector('#rejectBtn');
  rejectBtn.addEventListener('click', function () {
    // Update status to "rejected" in the database
    updateStatusReject(formData)
    const pillPending = document.querySelector('.changePill');
    pillPending.classList.add('pillRejected');

    pillPending.textContent = 'Rejected';

    pillPending.setAttribute("data-bs-toggle", "modal");
    pillPending.setAttribute("data-bs-target", "#staticBackdropRej");

    const apprRejContainer = document.querySelector('#apprRejContainer');
    apprRejContainer.innerHTML = ''
    const pmtHeadingForm = document.querySelector('#pmtHeadingForm');
    pmtHeadingForm.innerHTML = ''

    const apprAmt = document.querySelector('.rejAmt');
    apprAmt.textContent = parseInt(apprAmt.textContent) + 1

    const pendingAmt = document.querySelector('.pendingAmt');
    pendingAmt.textContent = parseInt(pendingAmt.textContent) - 1

    pillPending.classList.remove('changePill');

  });

  const approveBtn = document.querySelector('#approveBtn');
  approveBtn.addEventListener('click', function () {
    // Update status to "approved" in the database
    updateStatusApprove(formData)
    const pillPending = document.querySelector('.changePill');
    pillPending.classList.add('pillApproved');

    pillPending.textContent = 'Approved';
    pillPending.setAttribute("data-bs-toggle", "modal");
    pillPending.setAttribute("data-bs-target", "#staticBackdropAppr");

    const apprRejContainer = document.querySelector('#apprRejContainer');
    apprRejContainer.innerHTML = ''
    const pmtHeadingForm = document.querySelector('#pmtHeadingForm');
    pmtHeadingForm.innerHTML = ''

    const apprAmt = document.querySelector('.apprAmt');
    apprAmt.textContent = parseInt(apprAmt.textContent) + 1

    const pendingAmt = document.querySelector('.pendingAmt');
    pendingAmt.textContent = parseInt(pendingAmt.textContent) - 1

    pillPending.classList.remove('changePill');


  });



}

function updateStatusApprove(formData) {
  const studentId = formData.studentId;
  axios
    .put(`${API_URL}/${studentId}`, { formStatus: 'Approved' })
    .then(function (response) {
    })
    .catch(function (error) {
      // Handle error
      console.log(error);
      // Display an error message or handle the error as needed
    });
}

function updateStatusReject(formData) {
  const studentId = formData.studentId;
  axios
    .put(`${API_URL}/${studentId}`, { formStatus: 'Rejected' })
    .then(function (response) {
    })
    .catch(function (error) {
      // Handle error
      console.log(error);
      // Display an error message or handle the error as needed
    });
}







////////////////////////////
//NAVIGATION BAR
////////////////////////////
let navToggle = 0;
const expandButton = document.getElementById("navbar-icons-arrow");
const navbar = document.getElementById("nav-bar");
const expandImg = document.getElementById("navbar-icons-arrow");
const navbarLabels = document.getElementsByClassName("navbar-label");
const headerName = document.getElementById('profile-user-name');
const headerImg = document.getElementById('profile-user-image');

expandButton.addEventListener("click", function () {
  if (!navToggle) {
    navToggle = 1
    navbar.style.width = "250px";
    expandImg.src = "../../assets/images/navbar-collapse-icon.png"
    for (let i = 0; i < navbarLabels.length; i++) {
      navbarLabels[i].style.opacity = "1"
    }

  } else {
    navToggle = 0
    navbar.style.width = "70px";
    expandImg.src = "../../assets/images/navbar-expand-icon.png"
    for (let i = 0; i < navbarLabels.length; i++) {
      navbarLabels[i].style.opacity = "0"
    }
  }
});

function exportToExcel(applicantName, schoolOrg, classNo, courseDate) {
  // create a new workbook
  const workbook = XLSX.utils.book_new();
  // create a new worksheet with the form data
  const worksheet = XLSX.utils.json_to_sheet(
    [
      {
        "Name of Applicant": applicantName,
        "Organization/School": schoolOrg,
        "Designation/Class": classNo,
        "Course Date": courseDate,
      },
    ],
    {
      header: [
        "Name of Applicant",
        "Organization/School",
        "Designation/Class",
        "Course Date",
      ],
    }
  );
  // add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Student Data");
  // save the workbook as an Excel file
  XLSX.writeFile(workbook, applicantName+".xlsx");

}