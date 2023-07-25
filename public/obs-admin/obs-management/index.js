const url = window.location
const domain = url.protocol + "//" + url.host;
API_URL = `${domain}/obs-admin/pmt`;
API_URL_MST = `${domain}/obs-admin/mst`;
// === ALERT BOX ===
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
function handleError(error) {
  if (error && error.message !== 'redirected') {
    if (error.message !== "Failed to fetch") {
      alertBox(error.message, 'danger');
    }
  }
}
//Function for status count
function updateFormCounts(formData) {
  const formCounts = formData.reduce(
    (counts, form) => {
      if (form.formStatus === "Pending") {
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
    { pendingParent: 0, pending: 0, approved: 0, rejected: 0}
  );
  // console.log(formCounts); // Log the formCounts object to the console
  const pendingParentAmtElement = document.querySelector('.pendingParentAmt');
  const pendingAmtElement = document.querySelector('.pendingAmt');
  const apprAmtElement = document.querySelector('.apprAmt');
  const rejAmtElement = document.querySelector('.rejAmt');

  pendingParentAmtElement.textContent = `${formCounts.pendingParent}`;
  pendingAmtElement.textContent = `${formCounts.pending}`;
  apprAmtElement.textContent = `${formCounts.approved}`;
  rejAmtElement.textContent = `${formCounts.rejected}`;
}

function createFormattedDate(date) {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("en-SG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
function createExportButtonAll(id) {
  // Create the export button element for all data
  const exportIcon = document.createElement('img');
  exportIcon.style.cursor = 'pointer';
  exportIcon.src = '../../assets/images/export-to-excel-icon.png';
  exportIcon.id = id;
  exportIcon.alt = 'export-icon';
  exportIcon.addEventListener('click', function() {
    exportIcon.style.transform = 'scale(0.9)';
    exportIcon.style.transition = 'transform 0.2s ease-in-out';
  
    setTimeout(function() {
      exportIcon.style.transform = 'scale(1)';
    }, 200);
  });
  return exportIcon;
}
// Function to populate row data
function populateRowData(clonedRowTemplate, formData, index, formattedDate) {
  const studentNRICCell = clonedRowTemplate.querySelector('.studentNRIC');

  // show last 4digits of NRIC
  const studentNRIC = formData[index].studentNRIC;
  // const extractedNRIC = studentNRIC.substring(studentNRIC.length - 4);
  studentNRICCell.textContent = `*****${studentNRIC}`;

  const nameOfStudentCell = clonedRowTemplate.querySelector('.studentName');
  nameOfStudentCell.textContent = formData[index].nameOfStudent;
  nameOfStudentCell.setAttribute("nameOfStudent", formData[index].nameOfStudent);
  nameOfStudentCell.setAttribute("studentId", formData[index].studentId);
  const studentId = formData[index].studentId;

  const classCell = clonedRowTemplate.querySelector('.studentClass');
  classCell.textContent = formData[index].class;

  const schoolCell = clonedRowTemplate.querySelector('.studentSch');
  schoolCell.textContent = formData[index].school;

  const eligibilityCell = clonedRowTemplate.querySelector('.studentEligibility');
  eligibilityCell.textContent = formData[index].eligibility;

  const formattedDateCell = clonedRowTemplate.querySelector('.courseDate');
  formattedDateCell.textContent = formattedDate;

  const formStatusValue = formData[index].formStatus;
  const mstReviewCell = formData[index].review;
  const docReviewCell = formData[index].comments;


  return {
    studentNRICCell,
    nameOfStudentCell,
    classCell,
    schoolCell,
    eligibilityCell,
    formattedDateCell,
    formStatusValue,
    studentId,
    mstReviewCell,
    docReviewCell,
  };
}

// Function to handle checkboxes
function handleCheckBoxes(clonedRowTemplate, nameOfStudentCell, schoolCell, classCell, formattedDateCell, formStatusValue, mstReviewCell, docReviewCell, exportContainer, exportIcon, targetDataArray, i, formData) {
  const formId = formData[i].formId;
  const checkBoxes = clonedRowTemplate.querySelectorAll('#checkBox');
  const checkBoxTop = document.querySelector('#checkBoxTop');

  function appendExportIcon() {
    if (!exportContainer.contains(exportIcon)) {
      document.getElementById('export-icon') ? document.getElementById('export-icon').remove() : null;
      exportContainer.appendChild(exportIcon);
    }
  }

  function removeExportIcon() {
    if (exportContainer.contains(exportIcon)) {
      exportContainer.removeChild(exportIcon);
    }
  }

  // Add event listener to each checkbox
  checkBoxes.forEach(function (checkbox) {
    checkbox.setAttribute('class', 'checkBox-formid-' + formId)
    checkbox.removeAttribute('disabled'); // Remove the disabled attribute
    checkbox.addEventListener('change', function () {
      const isChecked = this.checked;

      const applicantName = nameOfStudentCell.textContent;
      const schoolOrg = schoolCell.textContent;
      const classNo = classCell.textContent;
      const courseDate = formattedDateCell.textContent;
      const formStatus = formStatusValue;
      const mstReview = mstReviewCell;
      const docReview = docReviewCell;

      const data = {
        "Name of Applicant": applicantName,
        "Organization/School": schoolOrg,
        "Designation/Class": classNo,
        "Course Date": courseDate,
        "Form Status": formStatus,
        "MST Review": mstReview,
        "Doctor Review": docReview
      };

      if (isChecked) {
        targetDataArray.push(data);
        appendExportIcon();
      } else {
        const index = targetDataArray.findIndex((item) => item["Name of Applicant"] === applicantName);
        if (index !== -1) {
          targetDataArray.splice(index, 1);
        }
        if (targetDataArray.length === 0) {
          removeExportIcon();
        }
      }
    });
  });

  // Add event listener to top checkbox
  checkBoxTop.addEventListener('change', function () {
    const isChecked = checkBoxTop.checked;
    checkBoxes.forEach(function (checkbox) {
      // If checkbox is checked, skip to next iteration
      if (checkbox.checked === isChecked) {
        return;
      }
      checkbox.checked = isChecked;
      const applicantName = nameOfStudentCell.textContent;
      const schoolOrg = schoolCell.textContent;
      const classNo = classCell.textContent;
      const courseDate = formattedDateCell.textContent;
      const formStatus = formStatusValue;
      const mstReview = mstReviewCell;
      const docReview = docReviewCell;

      const data = {
        "Name of Applicant": applicantName,
        "Organization/School": schoolOrg,
        "Designation/Class": classNo,
        "Course Date": courseDate,
        "Form Status": formStatus,
        "MST Review": mstReview,
        "Doctor Review": docReview
      };

      if (checkbox.checked) {
        targetDataArray.push(data);
        appendExportIcon();
      } else {
        const index = targetDataArray.findIndex((item) => item["Name of Applicant"] === applicantName);
        if (index !== -1) {
          targetDataArray.splice(index, 1);
        }
        if (targetDataArray.length === 0) {
          removeExportIcon();
        }
      }
    });

  });
}

//FUNCTION TO OPEN MODAL VIA CLICKING ON THE TABLE ROW
function openModal(studentId, modalBtns) {
  // Perform additional actions or make API requests using the studentId
  axios.get(`${API_URL}/${studentId}`)
    .then(function (response) {
      const formData = response.data[0];

      const userPermissions = response.data[1];

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
      const datePartsDob = formatToLocal4.split("/");
      const formattedDateOfBirth = `${datePartsDob[2]}-${datePartsDob[0]}-${datePartsDob[1]}`;

      //Format the dateOfAcknowledgement
      let formattedAckDate;

      if (formData.dateOfAcknowledgement) {
        const dateObjAckDate = new Date(formData.dateOfAcknowledgement);
        const formatToLocal5 = dateObjAckDate.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const datePartsAckDate = formatToLocal5.split("/");
        formattedAckDate = `${datePartsAckDate[2]}-${datePartsAckDate[0]}-${datePartsAckDate[1]}`;
      } else {
        formattedAckDate = null;
      }




      //call exportToExcel function
      const successBtn = document.querySelector(".successBtn");
      const rejectBtn = document.querySelector(".rejectBtn");
      const closeBtn = document.querySelector(".closeBtn");
      const exportBtns = document.querySelectorAll(".exportBtn");
      
      exportBtns.forEach((exportBtn) => {
        //for cypress testing
        exportBtn.setAttribute("id", "exportBtn-studentid-" + studentId);
        if (userPermissions.includes(5)) {
          exportBtn.classList.remove('d-none');
          exportBtn.addEventListener("click", handleExportClick);
          successBtn.addEventListener("click", function (e) {
            exportBtn.removeEventListener("click", handleExportClick);
          });
          rejectBtn.addEventListener("click", function (e) {
            exportBtn.removeEventListener("click", handleExportClick);
          });
          closeBtn.addEventListener("click", function (e) {
            exportBtn.removeEventListener("click", handleExportClick);
          });
        }
      });
      

      function handleExportClick(e) {
        e.preventDefault(); // prevent the default form submission behavior

        // Extract the form data
        const applicantName = formData.nameOfStudent;
        const schoolOrg = formData.school;
        const classNo = formData.class;
        const courseDate = formattedCourseDate;
        const formStatus = formData.formStatus;
        const mstReview = formData.review
        const docReview = formData.comments

        // Call the exportData function with the form data
        exportToExcel(applicantName, schoolOrg, classNo, courseDate, formStatus, mstReview, docReview);

        // Remove the event listener to avoid repeated downloads
        exportBtns.forEach((exportBtn) => {
          exportBtn.removeEventListener("click", handleExportClick);
        });
      }


      displayFormModal(formData, userPermissions, formattedCourseDate, formattedVaccinationDate, formattedExamDate, formattedAckDate, formattedDateOfBirth, modalBtns, studentId);

    })
    .catch(handleError);
}

//FUNCTION TO DSIPLAY FORM MODAL
function displayFormModal(formData, userPermissions, formattedCourseDate, formattedVaccinationDate, formattedExamDate, formattedAckDate, formattedDateOfBirth, modalBtns, studentId) {
  const nameInput = document.querySelector('#applicantName');
  const schoolInput = document.querySelector('#schoolOrg');
  const studentDOBInput = document.querySelector('#dateOfBirth');
  const nricInput = document.querySelector('#personalId');
  const classInput = document.querySelector('#designation');
  const courseDateInput = document.querySelector('#courseDate');
  const dateVacInput = document.querySelector('#tetanusVaccine');
  const doctorComments = document.querySelector('#doctor-comments');
  const doctorNameInput = document.querySelector('#physicianName');
  const doctoMCRInput = document.querySelector('#mcrNo');
  const clinicNameInput = document.querySelector('#clinicName');
  const examDateInput = document.querySelector('#examDate');
  const doctorContactInput = document.querySelector('#contactNo');
  const clinicAddressInput = document.querySelector('#clinicAddress');
  const parentName = document.querySelector('#parent-name');
  const parentNRICInput = document.querySelector('#parent-nric');
  const parentEmailInput = document.querySelector('#parent-email');
  const parentContactInput = document.querySelector('#parent-contact');
  const parentDateInput = document.querySelector('#parent-date');
  const mstReview = document.querySelector('#mst-review');

  //Doctor Signature
  const doctorSignatureInput = document.querySelector('#doctor-signature');
  const doctorSignatureURL = formData.signature
  const doctorSignatureImg = doctorSignatureURL.split(';')[0];

  doctorSignatureInput.setAttribute('src', doctorSignatureImg);

  //Parent Signature
  const parentSignatureInput = document.querySelector('#parent-signature');
  const parentSignatureURL = formData.parentSignature;
  const parentSignatureImg = typeof parentSignatureURL === 'string' ? parentSignatureURL.split(';')[0] : null;

  const parentContainer = document.querySelector('#parent-signature-container');
  const canvas = document.createElement('canvas');
  const formModal = document.querySelector('#staticBackdrop');
  const isFormModalOpen = formModal.classList.contains('show');
  if (parentSignatureImg) {
    parentSignatureInput.setAttribute('src', parentSignatureImg);
    parentSignatureInput.style.display = 'block';
  } else if (isFormModalOpen){
    // Hide the parentSignatureInput element

    parentSignatureInput.style.display = 'none';


    const ctx = canvas.getContext('2d');
    // Style canvas
    canvas.style.backgroundColor = 'white';
    canvas.style.border = '1px solid #485EAB';
    canvas.style.width = '302px';
    canvas.style.height = '152px';

    // Adjust the position as needed
    const textX = canvas.width / 2;
    const textY = canvas.height / 2;

    // Draw the text on the canvas
    ctx.font = '30px Arial';
    ctx.textAlign = 'center'; // Set text alignment to center
    ctx.textBaseline = 'middle'; // Set baseline alignment to middle
    ctx.fillText('N/A', textX, textY);

    // Append the canvas element to the container
    parentContainer.appendChild(canvas);
  }

  // show last 4digits of NRIC
  const studentNRIC = formData.studentNRIC;
  const extractedNRIC = studentNRIC.substring(studentNRIC.length - 4);

  //show last 4digits of parent NRIC
  const parentNRIC = formData.parentNRIC;
  let extractedParentNRIC = 'N/A';
  if (parentNRIC) {
    extractedParentNRIC = parentNRIC.substring(parentNRIC.length - 4);
  }

  // Set input field values
  nameInput.value = `${formData.nameOfStudent || 'N/A'}`;
  schoolInput.value = `${formData.school || 'N/A'}`;
  nricInput.value = `*****${formData.studentNRIC || 'N/A'}`;
  studentDOBInput.value = `${formattedDateOfBirth || 'N/A'}`;
  classInput.value = `${formData.class || 'N/A'}`;
  courseDateInput.value = `${formattedCourseDate || 'N/A'}`;
  dateVacInput.value = `${formattedVaccinationDate || 'N/A'}`;
  doctorComments.value = `${formData.comments || 'N/A'} `;
  doctorNameInput.value = `${formData.nameOfDoctor || 'N/A'}`;
  doctoMCRInput.value = `${formData.doctorMCR || 'N/A'}`;
  clinicNameInput.value = `${formData.nameOfClinic || 'N/A'}`;
  examDateInput.value = `${formattedExamDate || 'N/A'}`;
  doctorContactInput.value = `${formData.contactNo || 'N/A'}`;
  clinicAddressInput.value = `${formData.clinicAddress || 'N/A'}`;
  parentName.value = `${formData.nameOfParent || 'N/A'}`;
  mstReview.value = `${formData.review || ''}`;

  parentNRICInput.value = `${formData.parentNRIC ? '*****'+formData.parentNRIC : 'N/A'}`;
  parentEmailInput.value = `${formData.parentEmail || 'N/A'}`;
  parentContactInput.value = `${formData.parentContactNo || 'N/A'}`;
  parentDateInput.value = `${formattedAckDate}`;

  // if (formData.formStatus === "Pending Parent") {
  //   const apprRejContainer = document.querySelector('#apprRejContainer');
  //   apprRejContainer.innerHTML = ''
  //   const pmtHeadingForm = document.querySelector('#pmtHeadingForm');
  //   pmtHeadingForm.innerHTML = ''
  // }

  const pillPending = document.querySelector('.changePill');
  const undoStatusContainer = document.querySelector('#undoStatusContainer');
  const pmtHeadingForm = document.querySelector('#pmtHeadingForm');
  const apprRejContainer = document.querySelector('#apprRejContainer');

  //if theres permission
  if (userPermissions.includes(2) || userPermissions.includes(3)) {
    //if Pending create heading and approve/reject buttons

    if (isFormModalOpen && formData.formStatus === "Pending") {
      
      // Create the h4 element
      const h4 = document.createElement('h4');
      h4.textContent = 'Partnership Management Team:';
      pmtHeadingForm.appendChild(h4);


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
      //cypress testing id
      approveBtn.setAttribute('id', 'approveBtn');
      approveBtn.setAttribute("data-bs-dismiss", "modal");
      // approveBtn.setAttribute("data-bs-toggle", "modal");
      // approveBtn.setAttribute("data-bs-target", "#staticBackdropAppr");
      approveBtn.textContent = 'Approve';

      // Create the vertical line
      const verticalLine = document.createElement('div');
      verticalLine.setAttribute('class', 'verticalLine mx-3');

      // Create the Reject button
      const rejectBtn = document.createElement('button');
      rejectBtn.setAttribute('type', 'button');
      rejectBtn.setAttribute('class', 'btn btn-secondary reject-btn');
      //cypress testing id
      rejectBtn.setAttribute('id', 'rejectBtn');
      rejectBtn.setAttribute("data-bs-dismiss", "modal");
      // rejectBtn.setAttribute("data-bs-toggle", "modal");
      // rejectBtn.setAttribute("data-bs-target", "#staticBackdropRej");
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
      if (undoStatusContainer) {
      undoStatusContainer.innerHTML = ''
      }
}
    //if Approved create undo button
    if (formData.formStatus === "Approved" || formData.formStatus === "Rejected") {
     undoStatusContainer.innerHTML = `<div class="btn btn-primary btn-sm undoStatusBtn"data-bs-dismiss="modal">Undo
     Back To Pending</div>`
    }
    //check if form is rejected
    if (pillPending.textContent === 'Rejected') {
      modalBtns.forEach(modalBtn => {
        alertBox("Form already rejected!", 'rejected');

      })
    }
    //check if form is approved
    if (pillPending.textContent === 'Approved') {
      modalBtns.forEach(modalBtn => {
        alertBox("Form already approved!", 'rejected');

      })
    }

    //update status to reject
    const rejectBtn = document.querySelector('#rejectBtn');
    if (rejectBtn) {
      rejectBtn.setAttribute('id', 'rejectBtn-studentid-' + studentId);
      rejectBtn.addEventListener('click', function () {
        // Update status to "rejected" in the database
        updateStatusReject(formData)

        pillPending.classList.add('pillRejected');

        pillPending.textContent = 'Rejected';
        alertBox("The form is rejected", 'success');

        const apprRejContainer = document.querySelector('#apprRejContainer');
        apprRejContainer.innerHTML = ''
        const pmtHeadingForm = document.querySelector('#pmtHeadingForm');
        pmtHeadingForm.innerHTML = ''

        const apprAmt = document.querySelector('.rejAmt');
        apprAmt.textContent = parseInt(apprAmt.textContent) + 1

        const pendingAmt = document.querySelector('.pendingAmt');
        pendingAmt.textContent = parseInt(pendingAmt.textContent) - 1

        pillPending.classList.remove('changePill');
        if (canvas.parentElement === parentContainer) {
          parentContainer.removeChild(canvas);
        }
        undoStatusContainer.innerHTML = `<div class="btn btn-primary btn-sm undoStatusBtn">Undo
        Back To Pending</div>`
      });

    }

    //update status to pending
    const undoStatusBtn = document.querySelector('.undoStatusBtn');
    if(formData.formStatus === "Approved"){
      if (undoStatusBtn) {
        undoStatusBtn.addEventListener('click', function () {
          // Update status to "rejected" in the database
          updateStatusPending(formData)

          pillPending.classList.remove('pillApproved');

          pillPending.textContent = 'Pending';
          alertBox("The form has been reverted back to pending.", 'success');

          const rejAmt = document.querySelector('.apprAmt');
          rejAmt.textContent = parseInt(rejAmt.textContent) - 1

          const pendingAmt = document.querySelector('.pendingAmt');
          pendingAmt.textContent = parseInt(pendingAmt.textContent) + 1

          pillPending.classList.remove('changePill');
          if (canvas.parentElement === parentContainer) {
            parentContainer.removeChild(canvas);
          }
          
        });

      }
    }
    if(formData.formStatus === "Rejected"){
      if (undoStatusBtn) {
        undoStatusBtn.addEventListener('click', function () {
          // Update status to "rejected" in the database
          updateStatusPending(formData)

          pillPending.classList.remove('pillRejected');

          pillPending.textContent = 'Pending';
          alertBox("The form has been reverted back to pending.", 'success');

          const rejAmt = document.querySelector('.rejAmt');
          rejAmt.textContent = parseInt(rejAmt.textContent) - 1

          const pendingAmt = document.querySelector('.pendingAmt');
          pendingAmt.textContent = parseInt(pendingAmt.textContent) + 1

          pillPending.classList.remove('changePill');
          if (canvas.parentElement === parentContainer) {
            parentContainer.removeChild(canvas);
          }
        });
      }
    }

    //update status to approve
    const approveBtn = document.querySelector('#approveBtn');
    if (approveBtn) {
      approveBtn.setAttribute('id', 'approveBtn-studentid-' + studentId);
      approveBtn.addEventListener('click', function () {
        // Update status to "approved" in the database
        updateStatusApprove(formData)
        const pillPending = document.querySelector('.changePill');
        pillPending.classList.add('pillApproved');

        pillPending.textContent = 'Approved';
        alertBox("The form is aproved!", 'success');
        const apprRejContainer = document.querySelector('#apprRejContainer');
        apprRejContainer.innerHTML = ''
        const pmtHeadingForm = document.querySelector('#pmtHeadingForm');
        pmtHeadingForm.innerHTML = ''

        const apprAmt = document.querySelector('.apprAmt');
        apprAmt.textContent = parseInt(apprAmt.textContent) + 1

        const pendingAmt = document.querySelector('.pendingAmt');
        pendingAmt.textContent = parseInt(pendingAmt.textContent) - 1

        pillPending.classList.remove('changePill');

        if (canvas.parentElement === parentContainer) {
          parentContainer.removeChild(canvas);
        }
        undoStatusContainer.innerHTML = `<div class="btn btn-primary btn-sm undoStatusBtn">Undo
        Back To Pending</div>`

      });
    }
  }

  const closeBtn = document.querySelector('.closeBtn');
  closeBtn.setAttribute("id", "closeBtn-studentid-" + studentId)
  closeBtn.addEventListener('click', function () {
    const apprRejContainer = document.querySelector('#apprRejContainer');
    apprRejContainer.innerHTML = ''
    const pmtHeadingForm = document.querySelector('#pmtHeadingForm');
    pmtHeadingForm.innerHTML = ''
    const textarea = document.getElementById("doctor-comments");
    textarea.disabled = true;
    if (canvas.parentElement === parentContainer) {
      parentContainer.removeChild(canvas);
    }
    pillPending.classList.remove("changePill");

  });
  const textarea = document.querySelector("#mst-review");
  const submitReview = document.querySelector('.submitReviewBtn');
  const newReview = document.querySelector('#mst-review');
  if (userPermissions.includes(7)) {
    submitReview.classList.remove('d-none');
    textarea.disabled = false;
  }
  //click on submit button
  submitReview.addEventListener('mousedown', function (event) {
    if (userPermissions.includes(7)) {
      submitReview.setAttribute("data-bs-dismiss", "modal");
      editReview(formData, newReview)
    } else {
      alertBox("You don't have permission to edit review!", 'danger');
    }
  })
}

//FUNCTION TO UPDATE STATUS OF FORM TO APPROVED
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

//FUNCTION TO HANDLE MODAL BUTTONS SO THAT THEY OPEN THE MODAL
function handleModalButtons(clonedRowTemplate, studentId, formData, index) {
  const modalBtn1 = clonedRowTemplate.querySelector('.modalBtn1');
  const modalBtn2 = clonedRowTemplate.querySelector('.modalBtn2');
  const modalBtn3 = clonedRowTemplate.querySelector('.modalBtn3');
  const modalBtn4 = clonedRowTemplate.querySelector('.modalBtn4');
  const modalBtn5 = clonedRowTemplate.querySelector('.modalBtn5');
  const modalBtn6 = clonedRowTemplate.querySelector('.modalBtn6');
  const modalBtn7 = clonedRowTemplate.querySelector('.modalBtn7');
  const modalBtns = [modalBtn1, modalBtn2, modalBtn3, modalBtn4, modalBtn5, modalBtn6, modalBtn7];

  modalBtns.forEach(function (modalBtn) {
    //for cypress
    modalBtn.setAttribute("id", "modalBtn-studentId-" + studentId);
    modalBtn.setAttribute("data-bs-toggle", "modal");
  });

  const formStatusDiv = clonedRowTemplate.querySelector('.pillPending');
  formStatusDiv.textContent = formData[index].formStatus;

  if (formData[index].formStatus === "Pending") {
    formStatusDiv.classList.add("pillPending");
  } else if (formData[index].formStatus === "Rejected") {
    formStatusDiv.classList.add("pillRejected");
  } else if (formData[index].formStatus === "Approved") {

    formStatusDiv.classList.add("pillApproved");
  } else if (formData[index].formStatus === "Pending Parent") {
    formStatusDiv.classList.add("pillParent");
  } else if (formData[index].formStatus === "Need Review") {
    formStatusDiv.classList.add("pillParent");
  }

  getAllForms.appendChild(clonedRowTemplate);

  if (index >= 0 && index < formData.length) {
    const formStatus = formData[index].formStatus;
    modalBtns.forEach(function (modalBtn) {
      modalBtn.addEventListener("mousedown", function () {
        if (formStatus === "Pending") {
          modalBtn.setAttribute("data-bs-target", "#staticBackdrop");
        } else if (formStatus === "Approved") {
          modalBtn.setAttribute("data-bs-target", "#staticBackdrop");
          //alert being called in displayFormModal function
          alertBox(`Form already approved!`, 'rejected');
        } else if (formStatus === "Rejected") {
          modalBtn.setAttribute("data-bs-target", "#staticBackdrop");
          //alert being called in displayFormModal function
          alertBox(`Form already rejected!`, 'rejected');
        } else if (formStatus === "Pending Parent") {
          modalBtn.setAttribute("data-bs-target", "#staticBackdrop");
          alertBox(`Form is pending for parent's acknowledgement!`, 'warn');
        }
        modalBtn7.classList.add("changePill");
        openModal(studentId, modalBtns);
      });
    });
  }



}

//FUNCTION TO UPDATE STATUS OF FORM TO REJECTED
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

//FUNCTION TO UPDATE STATUS OF FORM TO PENDING
function updateStatusPending(formData) {
  const studentId = formData.studentId;
  axios
    .put(`${API_URL}/${studentId}`, { formStatus: 'Pending' })
    .then(function (response) {
    })
    .catch(function (error) {
      // Handle error
      console.log(error);
      // Display an error message or handle the error as needed
    });
}

//FUNCTION TO EDIT REVIEW OF FORM
function editReview(formData, newReview) {
  const submitReview = document.querySelector('.submitReviewBtn');
  const studentId = formData.studentId;

  axios.put(`${API_URL_MST}/review/${studentId}`,
    {
      review: newReview.value,
    }
  )
    .then(function (response) {
      if (response.status === 204) {
        alertBox('Your review has been deleted or is empty.', 'warn');
      } else {
        alertBox('Review has been submitted.', 'success');
      }
    })
    .catch(function (error) {
      // Handle error
      alertBox(error.message, 'danger');

    })

}

//Function to export to excel individually
function exportToExcel(applicantName, schoolOrg, classNo, courseDate, formStatus, mstReview, docReview) {
  axios.get('/export', {
    params: {
      applicantName: applicantName,
      schoolOrg: schoolOrg,
      classNo: classNo,
      courseDate: courseDate,
      formStatus: formStatus,
      mstReview: mstReview,
      docReview: docReview,


    },
    responseType: 'blob' // Set the response type to 'blob' to handle binary data
  })
    .then(response => {
      const contentType = response.headers["content-type"];
      if (contentType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        const url = URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = `${applicantName}.xlsx`;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        link.remove();
        alertBox("You have successfully exported the data to excel!", "success")
      } else {
        console.error("Invalid file format received:", contentType);
        alertBox("You do not have permission to export!", "danger")
        location.reload();
      }
    })
    .catch(error => {
      console.error("Export request failed:", error);
    });

}

//Function to export to excel bulk
function exportToExcelBulk(data) {
  axios.post("/export-bulk", {
    data: JSON.stringify(data),
  }, {
    responseType: "blob"
  })
    .then(response => {
      const contentType = response.headers["content-type"];
      if (contentType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        const url = URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = "exported-form.xlsx";
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        link.remove();
        alertBox("You have successfully exported the data to excel!", "success")
      } else {
        console.error("Invalid file format received:", contentType);
        alertBox("You do not have permission to export!", "danger")
        location.reload();
      }
    })
    .catch(error => {
      // error.response.status === 431
      console.error("Export request failed:", error);
    });
}
//expportButtonHandler
const exportButtonHandler = () => {
  console.log(dataAll);
  exportToExcelBulk(dataAll);
  alertBox("You have successfully exported the data to excel!", "success")
}


const alertContainer = document.getElementById('alertbox');
let dataAll = [];
const arrowIcon = document.querySelector('.arrow-icon');
const searchInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector('#search-button');
const searchClearBtn = document.querySelector('#clear-button');
const allForms = document.querySelector('#getAllForms');
const rectanglePendingParent = document.querySelector('.rectanglePendingParent');
const rectanglePending = document.querySelector('.rectanglePending');
const rectangleApproved = document.querySelector('.rectangleApproved');
const rectangleRejected = document.querySelector('.rectangleRejected');

const nricColoumn = document.querySelector('#nricColoumn');
const fullNameColoumn = document.querySelector('#fullNameColoumn');
const classColumn = document.querySelector('#classColumn');
const schoolColumn = document.querySelector('#schColumn');
const eligibilityColumn = document.querySelector('#eligibilityColumn');
const courseDateColumn = document.querySelector('#courseDateColumn');



document.addEventListener("DOMContentLoaded", function () {

  axios.get(`${API_URL}/all`)
    .then(function (response) {
      const configURL = response.config.url;
      const requestURL = response.request.responseURL;
      if (configURL !== requestURL) {
        window.location.href = requestURL;
        throw new Error("redirected");
      }

      //call function to update status count
      const formData = response.data;

      //remove user permission from array of data
      const userPermission = response.data.pop();
      console.log(formData)
      updateFormCounts(formData);

      //call function to create export button for
      const exportBtnBulkContainer = document.querySelector('#export-btn-all');
      const exportIcon = createExportButtonAll('export-icon');


      const successBtn = document.querySelector('.successBtn');
      const rejectBtn = document.querySelector('.rejectBtn');
      if (successBtn) {
        successBtn.addEventListener('click', function () {

          const pillPending = document.querySelector('.changePill');
          if (pillPending) {
            pillPending.classList.remove('changePill');
          }

        });
      }
      if (rejectBtn) {
        rejectBtn.addEventListener('click', function () {
          const pillPending = document.querySelector('.changePill');
          if (pillPending) {
            pillPending.classList.remove('changePill');
          }
        });
      }
      //create array to store all data for export to excel bulk

      // Loop through the data and add it to the page
      for (i = 0; i < formData.length; i++) {

        //call function to format date
        const formattedDate = createFormattedDate(formData[i].courseDate);
        // Get references to the status container and template
        const getAllForms = document.querySelector('#getAllForms');
        const rowTemplate = document.querySelector('.row-table-template');

        //clear html content in getAllForms once since using template
        if (i === 0) {
          dataAll = [];
          getAllForms.innerHTML = "";
        }
        // Clone the template and append it to the status container
        const templateContent = rowTemplate.content;
        const clonedRowTemplate = document.importNode(templateContent, true);

        // Populate the cloned template function
        const {
          studentNRICCell,
          nameOfStudentCell,
          classCell,
          schoolCell,
          eligibilityCell,
          formattedDateCell,
          formStatusValue,
          studentId,
          mstReviewCell,
          docReviewCell
        } = populateRowData(clonedRowTemplate, formData, i, formattedDate);
        //call function to handle checkboxes
        if (userPermission.includes(5)) {
          arrowIcon.classList.remove('d-none');
          handleCheckBoxes(clonedRowTemplate, nameOfStudentCell, schoolCell, classCell, formattedDateCell, formStatusValue, mstReviewCell, docReviewCell, exportBtnBulkContainer, exportIcon, dataAll, i, formData)
        } else {
          const checkBoxes = clonedRowTemplate.querySelectorAll('#checkBox');
          const checkBoxTop = document.querySelector('#checkBoxTop');
          checkBoxes.forEach(function (checkBox) {
            checkBox.classList.add('d-none');
          });
          checkBoxTop.classList.add('d-none');
        }


        //get all modalBtns and add attribute so that checkbox will not be affected by openModal function
        handleModalButtons(clonedRowTemplate, studentId, formData, i);
        ;


      }
      //Outside of for loop 
      //Export to Excel Bulk Once
      const exportBtnBulk = document.querySelector('#export-btn-all');
      exportBtnBulk.addEventListener('click', function () {
        console.log(dataAll);
        exportToExcelBulk(dataAll);
      });

    })
    .catch(function (error) {
      if (error && error.message !== "redirected") {
        console.log(error);
      }
      console.log(error);
    });
});


//Function to search for forms
function searchForms() {
  if (searchInput.value.trim() === '') {
    location.reload();
  } else {
    const encodedSearchInput = encodeURIComponent(searchInput.value);
    axios.get(`${API_URL}/search/${encodedSearchInput}`)
      .then(function (response) {
        const configURL = response.config.url;
        const requestURL = response.request.responseURL;
        if (configURL !== requestURL) {
          window.location.href = requestURL;
          throw new Error("redirected");
        }

        //call function to update status count
        const formData = response.data;
        const userPermission = response.data.pop();

        updateFormCounts(formData);

        //call function to create export button for
        const exportBtnBulkContainer = document.querySelector('#export-btn-search');
        const exportIcon = createExportButtonAll('export-icon');


        const successBtn = document.querySelector('.successBtn');
        const rejectBtn = document.querySelector('.rejectBtn');
        if (successBtn) {
          successBtn.addEventListener('click', function () {

            const pillPending = document.querySelector('.changePill');
            if (pillPending) {
              pillPending.classList.remove('changePill');
            }


          });
        }
        if (rejectBtn) {
          rejectBtn.addEventListener('click', function () {
            const pillPending = document.querySelector('.changePill');
            pillPending.classList.remove('changePill');

          });
        }
        

        // Loop through the data and add it to the page
        for (i = 0; i < formData.length; i++) {

          //call function to format date
          const formattedDate = createFormattedDate(formData[i].courseDate);
          // Get references to the status container and template
          const getAllForms = document.querySelector('#getAllForms');
          const rowTemplate = document.querySelector('.row-table-template');

          //clear html content in getAllForms once since using template
          if (i === 0) {
            dataAll = [];
            getAllForms.innerHTML = "";
          }
          // Clone the template and append it to the status container
          const templateContent = rowTemplate.content;
          const clonedRowTemplate = document.importNode(templateContent, true);

          // Populate the cloned template function
        
          const {
            studentNRICCell,
            nameOfStudentCell,
            classCell,
            schoolCell,
            eligibilityCell,
            formattedDateCell,
            formStatusValue,
            studentId,
            mstReviewCell,
            docReviewCell
          } = populateRowData(clonedRowTemplate, formData, i, formattedDate);
          //call function to handle checkboxes
          if (userPermission.includes(5)) {
            arrowIcon.classList.remove('d-none');
            handleCheckBoxes(clonedRowTemplate, nameOfStudentCell, schoolCell, classCell, formattedDateCell, formStatusValue, mstReviewCell, docReviewCell, exportBtnBulkContainer, exportIcon, dataAll, i, formData)
          } else {
            const checkBoxes = clonedRowTemplate.querySelectorAll('#checkBox');
            const checkBoxTop = document.querySelector('#checkBoxTop');
            checkBoxes.forEach(function (checkBox) {
              checkBox.classList.add('d-none');
            });
            checkBoxTop.classList.add('d-none');
          }


          //get all modalBtns and add attribute so that checkbox will not be affected by openModal function
          handleModalButtons(clonedRowTemplate, studentId, formData, i);
          ;


        }
        //Outside of for loop 
        //Export to Excel Bulk Once 
        const exportBtnBulk = document.querySelector('#export-btn-search');
        exportBtnBulk.removeEventListener('click', exportButtonHandler);
        exportBtnBulk.addEventListener('click', exportButtonHandler);

      })
      .catch(function (error) {
        if (error && error.message !== "redirected") {
          console.log(error);
        }
        if (error.response && error.response.status === 404) {
          alertBox("No results found!", "danger")
          allForms.innerHTML = ` <tr>
          <td><input type="checkbox" id="checkBox"></td>
          <td colspan="7" class="text-center" style="font-size: calc(1.275rem + .3vw) !important">
          <div style="margin-right: 70px; display: inline-block;">No results found!</div></td>
          </tr>`;
        }
        console.log(error);
      });
  }

}

//Serach, click icon
searchBtn.addEventListener('click', () => {
  rectanglePendingParent.style.border = '1px solid #485eab';
  rectangleApproved.style.border = '1px solid #485eab';
  rectanglePending.style.border = '1px solid #485eab';
  rectangleRejected.style.border = '1px solid #485eab';
  searchForms();
});

//Search, press enter
searchInput.addEventListener('keypress', event => {
  rectanglePendingParent.style.border = '1px solid #485eab';
  rectangleApproved.style.border = '1px solid #485eab';
  rectanglePending.style.border = '1px solid #485eab';
  rectangleRejected.style.border = '1px solid #485eab';
  if (event.key === "Enter") {
    event.preventDefault();
    searchForms();
  }
});

//Search, clear button
searchClearBtn.onclick = () => {
  searchInput.value = "";
  retrieveAllForms()
}

////////////////////////////
//Big Status Buttons
////////////////////////////

//temp
function formCountOfDataAll() {
  axios.get(`${API_URL}/all`)
    .then(function (response) {
      const configURL = response.config.url;
      const requestURL = response.request.responseURL;
      if (configURL !== requestURL) {
        window.location.href = requestURL;
        throw new Error("redirected");
      }
      //call function to update status count
      const formData = response.data;
      //remove user permission from array of data
      const userPermission = response.data.pop();
      console.log(formData)
      updateFormCounts(formData);

    })
    .catch(function (error) {
      if (error && error.message !== "redirected") {
        console.log(error);
      }
      console.log(error);
    });
}

//function for retreriving data by status
function retrieveByStatus(apiUrl) {
  axios.get(apiUrl)
  .then(function (response) {
    const configURL = response.config.url;
    const requestURL = response.request.responseURL;
    if (configURL !== requestURL) {
      window.location.href = requestURL;
      throw new Error("redirected");
    }

    //call function to update status count
    const formData = response.data;

    //remove user permission from array of data
    const userPermission = response.data.pop();
    console.log(formData)

    //tempx
    formCountOfDataAll()
    //  updateFormCounts(formData);  

    //call function to create export button for
    const exportBtnBulkContainer = document.querySelector('#export-btn-status');
    const exportIcon = createExportButtonAll('export-icon');


    const successBtn = document.querySelector('.successBtn');
    const rejectBtn = document.querySelector('.rejectBtn');
    if (successBtn) {
      successBtn.addEventListener('click', function () {

        const pillPending = document.querySelector('.changePill');
        if (pillPending) {
          pillPending.classList.remove('changePill');
        }

      });
    }
    if (rejectBtn) {
      rejectBtn.addEventListener('click', function () {
        const pillPending = document.querySelector('.changePill');
        if (pillPending) {
          pillPending.classList.remove('changePill');
        }
      });
    }
    //create array to store all data for export to excel bulk

    // Loop through the data and add it to the page
    for (i = 0; i < formData.length; i++) {

      //call function to format date
      const formattedDate = createFormattedDate(formData[i].courseDate);
      // Get references to the status container and template
      const getAllForms = document.querySelector('#getAllForms');
      const rowTemplate = document.querySelector('.row-table-template');

      //clear html content in getAllForms once since using template
      if (i === 0) {
        dataAll = [];
        getAllForms.innerHTML = "";
      }
      // Clone the template and append it to the status container
      const templateContent = rowTemplate.content;
      const clonedRowTemplate = document.importNode(templateContent, true);

      // Populate the cloned template function
      const {
        studentNRICCell,
        nameOfStudentCell,
        classCell,
        schoolCell,
        eligibilityCell,
        formattedDateCell,
        formStatusValue,
        studentId,
        mstReviewCell,
        docReviewCell
      } = populateRowData(clonedRowTemplate, formData, i, formattedDate);
      //call function to handle checkboxes
      if (userPermission.includes(5)) {
        arrowIcon.classList.remove('d-none');
        handleCheckBoxes(clonedRowTemplate, nameOfStudentCell, schoolCell, classCell, formattedDateCell, formStatusValue, mstReviewCell, docReviewCell, exportBtnBulkContainer, exportIcon, dataAll, i, formData)
      } else {
        const checkBoxes = clonedRowTemplate.querySelectorAll('#checkBox');
        const checkBoxTop = document.querySelector('#checkBoxTop');
        checkBoxes.forEach(function (checkBox) {
          checkBox.classList.add('d-none');
        });
        checkBoxTop.classList.add('d-none');
      }


      //get all modalBtns and add attribute so that checkbox will not be affected by openModal function
      handleModalButtons(clonedRowTemplate, studentId, formData, i);
      ;


    }
    //Outside of for loop 
    //Export to Excel Bulk Once
    exportBtnBulkContainer.removeEventListener('click', exportButtonHandler);
    exportBtnBulkContainer.addEventListener('click', exportButtonHandler);
    

  })
  .catch(function (error) {
    if (error && error.message !== "redirected") {
      console.log(error);
    }
    console.log(error);
  });
}

let selectedButton = null;

function resetBorders() {
  rectanglePendingParent.style.border = '1px solid #485eab';
  rectangleApproved.style.border = '1px solid #485eab';
  rectanglePending.style.border = '1px solid #485eab';
  rectangleRejected.style.border = '1px solid #485eab';
}
function retrieveAllForms() {
  axios.get(`${API_URL}/all`)
  .then(function (response) {
    const configURL = response.config.url;
    const requestURL = response.request.responseURL;
    if (configURL !== requestURL) {
      window.location.href = requestURL;
      throw new Error("redirected");
    }

    //call function to update status count
    const formData = response.data;

    //remove user permission from array of data
    const userPermission = response.data.pop();
    console.log(formData)
    updateFormCounts(formData);

    //call function to create export button for
    const exportBtnBulkContainer = document.querySelector('#export-btn-all');
    const exportIcon = createExportButtonAll('export-icon');


    const successBtn = document.querySelector('.successBtn');
    const rejectBtn = document.querySelector('.rejectBtn');
    if (successBtn) {
      successBtn.addEventListener('click', function () {

        const pillPending = document.querySelector('.changePill');
        if (pillPending) {
          pillPending.classList.remove('changePill');
        }

      });
    }
    if (rejectBtn) {
      rejectBtn.addEventListener('click', function () {
        const pillPending = document.querySelector('.changePill');
        if (pillPending) {
          pillPending.classList.remove('changePill');
        }
      });
    }
    //create array to store all data for export to excel bulk

    // Loop through the data and add it to the page
    for (i = 0; i < formData.length; i++) {

      //call function to format date
      const formattedDate = createFormattedDate(formData[i].courseDate);
      // Get references to the status container and template
      const getAllForms = document.querySelector('#getAllForms');
      const rowTemplate = document.querySelector('.row-table-template');

      //clear html content in getAllForms once since using template
      if (i === 0) {
        dataAll = [];
        getAllForms.innerHTML = "";
      }
      // Clone the template and append it to the status container
      const templateContent = rowTemplate.content;
      const clonedRowTemplate = document.importNode(templateContent, true);

      // Populate the cloned template function
      const {
        studentNRICCell,
        nameOfStudentCell,
        classCell,
        schoolCell,
        eligibilityCell,
        formattedDateCell,
        formStatusValue,
        studentId,
        mstReviewCell,
        docReviewCell
      } = populateRowData(clonedRowTemplate, formData, i, formattedDate);
      //call function to handle checkboxes
      if (userPermission.includes(5)) {
        arrowIcon.classList.remove('d-none');
        handleCheckBoxes(clonedRowTemplate, nameOfStudentCell, schoolCell, classCell, formattedDateCell, formStatusValue, mstReviewCell, docReviewCell, exportBtnBulkContainer, exportIcon, dataAll, i, formData)
      } else {
        const checkBoxes = clonedRowTemplate.querySelectorAll('#checkBox');
        const checkBoxTop = document.querySelector('#checkBoxTop');
        checkBoxes.forEach(function (checkBox) {
          checkBox.classList.add('d-none');
        });
        checkBoxTop.classList.add('d-none');
      }


      //get all modalBtns and add attribute so that checkbox will not be affected by openModal function
      handleModalButtons(clonedRowTemplate, studentId, formData, i);
      ;


    }
    //Outside of for loop 
    //Export to Excel Bulk Once
    const exportBtnBulk = document.querySelector('#export-btn-all');
    exportBtnBulk.addEventListener('click', function () {
      console.log(dataAll);
      exportToExcelBulk(dataAll);
    });

  })
  .catch(function (error) {
    if (error && error.message !== "redirected") {
      console.log(error);
    }
    console.log(error);
  });
}
// If user clicks on pending parent status button, retrieve forms by status
if (rectanglePendingParent) {
  rectanglePendingParent.addEventListener('click', () => {
    // Check if this button was previously selected
    if (selectedButton === rectanglePendingParent) {
      // Deselect the button
      resetBorders();
      selectedButton = null;
      retrieveAllForms()
      
    } else {
      // Reset borders and highlight the button
      resetBorders();
      rectanglePendingParent.style.border = '4px solid #4195fc';
      selectedButton = rectanglePendingParent;
      rectanglePendingParent.style.transform = 'scale(0.9)';
      rectanglePendingParent.style.transition = 'transform 0.2s ease-in-out';
  
    setTimeout(function() {
      rectanglePendingParent.style.transform = 'scale(1)';
    }, 200);

      let apiUrl = `${API_URL}/formStatus/Pending%20Parent`;
      retrieveByStatus(apiUrl);
    }
  });
}

// If user clicks on pending status button, retrieve forms by status
if (rectanglePending) {
  rectanglePending.addEventListener('click', () => {
    // Check if this button was previously selected
    if (selectedButton === rectanglePending) {
      // Deselect the button
      resetBorders();
      selectedButton = null;
      retrieveAllForms()
    } else {
      // Reset borders and highlight the button
      resetBorders();
      rectanglePending.style.border = '4px solid #4195fc';
      selectedButton = rectanglePending;
      rectanglePending.style.transform = 'scale(0.9)';
      rectanglePending.style.transition = 'transform 0.2s ease-in-out';
  
    setTimeout(function() {
      rectanglePending.style.transform = 'scale(1)';
    }, 200);
      let apiUrl = `${API_URL}/formStatus/Pending`;
      retrieveByStatus(apiUrl);
    }
  });
}

// If user clicks on approved status button, retrieve forms by status
if (rectangleApproved) {
  rectangleApproved.addEventListener('click', () => {
    // Check if this button was previously selected
    if (selectedButton === rectangleApproved) {
      // Deselect the button
      resetBorders();
      selectedButton = null;
      retrieveAllForms()
    } else {
      // Reset borders and highlight the button
      resetBorders();
      rectangleApproved.style.border = '4px solid #4195fc';
      selectedButton = rectangleApproved;
      rectangleApproved.style.transform = 'scale(0.9)';
      rectangleApproved.style.transition = 'transform 0.2s ease-in-out';
  
    setTimeout(function() {
      rectangleApproved.style.transform = 'scale(1)';
    }, 200);
      let apiUrl = `${API_URL}/formStatus/Approved`;
      retrieveByStatus(apiUrl);
    }
  });
}

// If user clicks on rejected status button, retrieve forms by status
if (rectangleRejected) {
  rectangleRejected.addEventListener('click', () => {
    // Check if this button was previously selected
    if (selectedButton === rectangleRejected) {
      // Deselect the button
      resetBorders();
      selectedButton = null;
      retrieveAllForms()
    } else {
      // Reset borders and highlight the button
      resetBorders();
      rectangleRejected.style.border = '4px solid #4195fc';
      selectedButton = rectangleRejected;
      rectangleRejected.style.transform = 'scale(0.9)';
    rectangleRejected.style.transition = 'transform 0.2s ease-in-out';
  
    setTimeout(function() {
      rectangleRejected.style.transform = 'scale(1)';
    }, 200);
      let apiUrl = `${API_URL}/formStatus/Rejected`;
      retrieveByStatus(apiUrl);
    }
  });
}

////////////////////////////
//SHOW FILTERS ON CLICK
////////////////////////////
const filterIcons = document.querySelector('#filter-icon');
const filterDropDowns = document.querySelector('.displayFilters');
filterIcons.addEventListener('click', () => {
  rectanglePendingParent.style.border = '1px solid #485eab';
  rectangleApproved.style.border = '1px solid #485eab';
  rectanglePending.style.border = '1px solid #485eab';
  rectangleRejected.style.border = '1px solid #485eab';
  if (filterDropDowns.classList.contains('d-none')) {
    filterDropDowns.classList.remove('d-none');
  } else {
    filterDropDowns.classList.add('d-none');
  }
});

////////////////////////////
//Navbar Error Handling
////////////////////////////
const navBarPerms = document.querySelector('#permission-li')
const navBarUsers = document.querySelector('#user-li')
const navBarForms = document.querySelector('#form-li')
navBarPerms.addEventListener('click', function () {
  alertBox('You do not have permission to access this page!', 'danger');
});
navBarUsers.addEventListener('click', function () {
  alertBox('You do not have permission to access this page!', 'danger');
});
navBarForms.addEventListener('click', function () {
  alertBox('You are already on this page', 'warn');
});


////////////////////////////
//Filters
////////////////////////////
document.addEventListener('DOMContentLoaded', (event) => {
  var dropdownMenuStayOpen = document.querySelectorAll('.dropdown-menu-stay');
  const schoolMenuBtn = document.querySelector('#schoolMenuButton');
  const classMenuBtn = document.querySelector('#classMenuButton');
  const courseDateMenuBtn = document.querySelector('#courseDateMenuButton');
  const eligibilityMenuBtn = document.querySelector('#eligibilityMenuButton');
  // const exportBtnFilter = document.querySelector('#export-btn-filter');
  // const exportBtnFilterSchool = document.querySelector('#export-btn-filter-school');
  // const exportBtnFilterCourseDate = document.querySelector('#export-btn-filter-course-date');
  // const exportBtnFilterEligibility = document.querySelector('#export-btn-filter-eligibility');
  // prevent menu from closing down 
  for (var i = 0; i < dropdownMenuStayOpen.length; i++) {
    dropdownMenuStayOpen[i].addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  let dataAll = [];
  let classesArray = [];
  let schoolsArray = [];
  let courseDatesArray = [];
  let eligibilityArray = [];

  // Clear searches when dropdown is closed
  // For each dropdown, clear the search input
  const dropdowns = [schoolMenuBtn, classMenuBtn, courseDateMenuBtn, eligibilityMenuBtn];
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('hide.bs.dropdown', function () {
      const searchInputs = document.querySelectorAll('.searchBarFilter');
      searchInputs.forEach(searchInput => {
        searchInput.value = "";
      }
      );
      const filterDiv = document.querySelectorAll('.filter-div');
      filterDiv.forEach(filter => {
        const filterList = filter.querySelector('li');
        filterList.style.display = "block";
      }
      );
    });
  });



  let fetchSchools = fetch(`/get-school-filter`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const loadingMsgDiv = schoolsDiv.querySelector('.loadingMsg');
      if (loadingMsgDiv) {
        loadingMsgDiv.remove();
      }

      data.forEach(item => {
        // Create a new <li> element with checkbox floating right
        const newDiv = document.createElement('div');
        newDiv.classList.add('filter-div');
        const li = document.createElement('li');
        li.textContent = item.school;
        li.className = "m-3";
        // Align checkbox to most right of li
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = "school";
        checkbox.value = item.school;

        checkbox.style.float = "right";
        checkbox.style.margin = "3px";
        checkbox.style.width = "15px";
        checkbox.style.height = "15px";
        checkbox.style.borderRadius = "50%";
        checkbox.style.border = "1px solid #000";
        checkbox.style.cursor = "pointer";

        li.appendChild(checkbox);
        newDiv.appendChild(li);
        schoolsDiv.appendChild(newDiv);
      });
    })
    .catch(function (error) {
      if (error && error.message !== "redirected") {
        console.log(error);
      }
      console.log(error);
    });

  let fetchClasses = fetch(`/getClasses`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const loadingMsgDiv = classesDiv.querySelector('.loadingMsg');
      if (loadingMsgDiv) {
        loadingMsgDiv.remove();
      }

      data.forEach(item => {
        // Create a new <li> element with checkbox floating right
        const newDiv = document.createElement('div');
        newDiv.classList.add('filter-div');
        const li = document.createElement('li');
        li.textContent = item.class;
        li.className = "m-3";
        // Align checkbox to most right of li
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = "class";
        checkbox.value = item.class;

        checkbox.style.float = "right";
        checkbox.style.margin = "3px";
        checkbox.style.width = "15px";
        checkbox.style.height = "15px";
        checkbox.style.borderRadius = "50%";
        checkbox.style.border = "1px solid #000";
        checkbox.style.cursor = "pointer";


        li.appendChild(checkbox);
        newDiv.appendChild(li);
        classesDiv.appendChild(newDiv);
      });
    })
    .catch(function (error) {
      if (error && error.message !== "redirected") {
        console.log(error);
      }
      console.log(error);
    });

  let fetchCourseDates = fetch(`/getCourseDates`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const loadingMsgDiv = courseDatesDiv.querySelector('.loadingMsg');
      if (loadingMsgDiv) {
        loadingMsgDiv.remove();
      }

      data.forEach(item => {
        // Create a new <li> element with checkbox floating right
        const newDiv = document.createElement('div');
        newDiv.classList.add('filter-div');
        const li = document.createElement('li');
        // Change date to singapore format, no time
        li.textContent = createFormattedDate(item.courseDate);

        li.className = "m-3";
        // Align checkbox to most right of li
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = "course-date";

        //to cross check with database date format
        //data format in website is dd-mm-yyyy
        //database reads yyyy-mm-dd
        const [day, month, year] = createFormattedDate(item.courseDate).split("/");
        const formattedCourseDateISO = `${year}-${month}-${day}`;
        checkbox.value = formattedCourseDateISO

        checkbox.style.float = "right";
        checkbox.style.margin = "3px";
        checkbox.style.width = "15px";
        checkbox.style.height = "15px";
        checkbox.style.borderRadius = "50%";
        checkbox.style.border = "1px solid #000";
        checkbox.style.cursor = "pointer";

        li.appendChild(checkbox);
        newDiv.appendChild(li);
        courseDatesDiv.appendChild(newDiv);
      });
    })
    .catch(function (error) {
      if (error && error.message !== "redirected") {
        console.log(error);
      }
      console.log(error);
    });

  let fetchEligiblity = fetch(`/getEligibility`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const loadingMsgDiv = eligibilityDiv.querySelector('.loadingMsg');
      if (loadingMsgDiv) {
        loadingMsgDiv.remove();
      }

      data.forEach(item => {

        // Create a new <li> element with checkbox floating right
        const newDiv = document.createElement('div');
        newDiv.classList.add('filter-div');
        const li = document.createElement('li');
        li.textContent = item.eligibility;
        li.className = "m-3";
        // Align checkbox to most right of li
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = "eligibility";
        checkbox.value = item.eligibility;

        checkbox.style.float = "right";
        checkbox.style.margin = "3px";
        checkbox.style.width = "15px";
        checkbox.style.height = "15px";
        checkbox.style.borderRadius = "50%";
        checkbox.style.border = "1px solid #000";
        checkbox.style.cursor = "pointer";

        li.appendChild(checkbox);
        newDiv.appendChild(li);
        eligibilityDiv.appendChild(newDiv);
      });
    })
    .catch(function (error) {
      if (error && error.message !== "redirected") {
        console.log(error);
      }
      console.log(error);
    });

  let schoolCount = 0;
  let classCount = 0;
  let courseDateCount = 0;
  let eligibilityCount = 0;



  Promise.all([fetchSchools, fetchClasses, fetchCourseDates, fetchEligiblity])
    // For each of the filters, add event listener to each checkbox
    .then(() => {
      // For all the checkbox, add event listener then every on click, fetch the data again
      const allCheckBoxes = document.querySelectorAll('.filter-div input[type="checkbox"]');
      allCheckBoxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
          // If checkbox is checked, add to array
          if (checkbox.checked) {
            if (checkbox.name === "school") {
              schoolCount++;
              if (schoolCount === 0) {
                schoolMenuBtn.textContent = "School";
              } else if (schoolCount === 1) {
                schoolMenuBtn.textContent = schoolCount + " School Selected";
              } else {
                schoolMenuBtn.textContent = schoolCount + " Schools Selected";
              }
              schoolsArray.push(checkbox.value);
            } else if (checkbox.name === "class") {
              classCount++;
              if (classCount === 0) {
                classMenuBtn.textContent = "Class";
              } else if (classCount === 1) {
                classMenuBtn.textContent = classCount + " Class Selected";
              } else {
                classMenuBtn.textContent = classCount + " Classes Selected";
              }
              classesArray.push(checkbox.value);
            } else if (checkbox.name === "course-date") {
              courseDateCount++;
              if (courseDateCount === 0) {
                courseDateMenuBtn.textContent = "Course Date";
              } else if (courseDateCount === 1) {
                courseDateMenuBtn.textContent = courseDateCount + " Course Date Selected";
              } else {
                courseDateMenuBtn.textContent = courseDateCount + " Course Dates Selected";
              }
              courseDatesArray.push(checkbox.value);
            } else if (checkbox.name === "eligibility") {
              eligibilityCount++;
              if (eligibilityCount === 0) {
                eligibilityMenuBtn.textContent = "Eligibility";
              } else if (eligibilityCount === 1) {
                eligibilityMenuBtn.textContent = eligibilityCount + " Eligibility Selected";
              } else {
                eligibilityMenuBtn.textContent = eligibilityCount + " Eligibilities Selected";
              }
              eligibilityArray.push(checkbox.value);
            }
          } else {
            // If checkbox is unchecked, remove from array
            if (checkbox.name === "school") {
              schoolCount--;
              if (schoolCount === 0) {
                schoolMenuBtn.textContent = "School";
              } else if (schoolCount === 1) {
                schoolMenuBtn.textContent = schoolCount + " School Selected";
              } else {
                schoolMenuBtn.textContent = schoolCount + " Schools Selected";
              }
              schoolsArray = schoolsArray.filter(item => item !== checkbox.value);
            } else if (checkbox.name === "class") {
              classCount--;
              if (classCount === 0) {
                classMenuBtn.textContent = "Class";
              } else if (classCount === 1) {
                classMenuBtn.textContent = classCount + " Class Selected";
              } else {
                classMenuBtn.textContent = classCount + " Classes Selected";
              }
              classesArray = classesArray.filter(item => item !== checkbox.value);
            } else if (checkbox.name === "course-date") {
              courseDateCount--;
              if (courseDateCount === 0) {
                courseDateMenuBtn.textContent = "Course Date";
              } else if (courseDateCount === 1) {
                courseDateMenuBtn.textContent = courseDateCount + " Course Date Selected";
              } else {
                courseDateMenuBtn.textContent = courseDateCount + " Course Dates Selected";
              }
              courseDatesArray = courseDatesArray.filter(item => item !== checkbox.value);
            } else if (checkbox.name === "eligibility") {
              eligibilityCount--;
              if (eligibilityCount === 0) {
                eligibilityMenuBtn.textContent = "Eligibility";
              } else if (eligibilityCount === 1) {
                eligibilityMenuBtn.textContent = eligibilityCount + " Eligibility Selected";
              } else {
                eligibilityMenuBtn.textContent = eligibilityCount + " Eligibilities Selected";
              }
              eligibilityArray = eligibilityArray.filter(item => item !== checkbox.value);
            }
          }

          // Pull data to display in table
          axios.post(`/obs-admin/pmt/filter`, {
            school: schoolsArray,
            class: classesArray,
            courseDate: courseDatesArray,
            eligibility: eligibilityArray
          })
            .then(response => {
              const formData = response.data;

              //remove user permission from array of data
              const userPermission = response.data.pop();
              if (formData.length === 0) {
                const getAllForms = document.querySelector('#getAllForms');
                getAllForms.innerHTML = "";
              }
              updateFormCounts(formData);

              //call function to create export button for
              const exportBtnBulkContainer = document.querySelector('#export-btn-filter');
              const exportIcon = createExportButtonAll('export-icon');

              const exportBtnAll = document.querySelector('#export-btn-all');
              if (exportBtnAll) {
                exportBtnAll.style.display = 'none';
              }

              const successBtn = document.querySelector('.successBtn');
              const rejectBtn = document.querySelector('.rejectBtn');
              if (successBtn) {
                successBtn.addEventListener('click', function () {

                  const pillPending = document.querySelector('.changePill');
                  if (pillPending) {
                    pillPending.classList.remove('changePill');
                  }


                });
              }
              if (rejectBtn) {
                rejectBtn.addEventListener('click', function () {
                  const pillPending = document.querySelector('.changePill');
                  pillPending.classList.remove('changePill');

                });
              }

              //create array to store all data for export to excel bulk

              // Loop through the data and add it to the page
              for (i = 0; i < formData.length; i++) {

                //call function to format date
                const formattedDate = createFormattedDate(formData[i].courseDate);
                // Get references to the status container and template
                const getAllForms = document.querySelector('#getAllForms');
                const rowTemplate = document.querySelector('.row-table-template');

                //clear html content in getAllForms once since using template
                if (i === 0) {
                  dataAll = [];
                  getAllForms.innerHTML = "";
                }
                // Clone the template and append it to the status container
                const templateContent = rowTemplate.content;
                const clonedRowTemplate = document.importNode(templateContent, true);

                // Populate the cloned template function
                // Populate the cloned template function
                const {
                  studentNRICCell,
                  nameOfStudentCell,
                  classCell,
                  schoolCell,
                  eligibilityCell,
                  formattedDateCell,
                  formStatusValue,
                  studentId,
                  mstReviewCell,
                  docReviewCell
                } = populateRowData(clonedRowTemplate, formData, i, formattedDate);
                //call function to handle checkboxes
                if (userPermission.includes(5)) {
                  arrowIcon.classList.remove('d-none');
                  handleCheckBoxes(clonedRowTemplate, nameOfStudentCell, schoolCell, classCell, formattedDateCell, formStatusValue, mstReviewCell, docReviewCell, exportBtnBulkContainer, exportIcon, dataAll, i, formData)
                } else {
                  const checkBoxes = clonedRowTemplate.querySelectorAll('#checkBox');
                  const checkBoxTop = document.querySelector('#checkBoxTop');
                  checkBoxes.forEach(function (checkBox) {
                    checkBox.classList.add('d-none');
                  });
                  checkBoxTop.classList.add('d-none');
                }


                //get all modalBtns and add attribute so that checkbox will not be affected by openModal function
                handleModalButtons(clonedRowTemplate, studentId, formData, i);
                ;


              }
              //Outside of for loop 
              //Export to Excel Bulk Once
              exportBtnBulkContainer.removeEventListener('click', exportButtonHandler);
              exportBtnBulkContainer.addEventListener('click', exportButtonHandler);
              // Remove exportIcon if filter checkbox is pressed
            })
            .catch(function (error) {
              if (error && error.message !== "redirected") {
                console.log(error);
              }
              console.log(error);
            });
        })
      })
    })
    .catch(function (error) {
      if (error && error.message !== "redirected") {
        console.log(error);
      }
    });

  // const exportButtonHandler = () => {
  //   console.log(dataAll);
  //   exportToExcelBulk(dataAll);
  //   alertBox("You have successfully exported the data to excel!", "success")
  // }



  // Search bar to search for filters in the respective .filter-div
  const filterSearch = document.querySelectorAll('.searchBarFilter')
  filterSearch.forEach(search => {
    search.addEventListener('keyup', function () {
      const filter = search.value.toUpperCase();
      const filterDiv = search.parentElement;
      const filterDivItems = filterDiv.querySelectorAll('li');
      filterDivItems.forEach(item => {
        const textValue = item.textContent || item.innerText;
        if (textValue.toUpperCase().indexOf(filter) > -1) {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      })
    })
  })
})