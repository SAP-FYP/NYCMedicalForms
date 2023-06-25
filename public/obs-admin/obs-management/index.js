const url = window.location
const domain = url.protocol + "//" + url.host;
API_URL = `${domain}/obs-admin/pmt`;

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
    { pendingParent: 0, pending: 0, approved: 0, rejected: 0 }
  );
  console.log(formCounts); // Log the formCounts object to the console
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
function createExportButtonAll() {
  // Create the export button element for all data
  const exportIcon = document.createElement('img');
  exportIcon.src = '../../assets/images/export-to-excel-icon.png';
  exportIcon.id = 'export-btn';
  exportIcon.alt = 'export-icon';
  return exportIcon;
}
// Function to populate row data
function populateRowData(clonedRowTemplate, formData, index, formattedDate) {
  const studentNRICCell = clonedRowTemplate.querySelector('.studentNRIC');
  studentNRICCell.textContent = `***${formData[index].studentNRIC}`;

  const nameOfStudentCell = clonedRowTemplate.querySelector('.studentName');
  nameOfStudentCell.textContent = formData[index].nameOfStudent;
  nameOfStudentCell.setAttribute("nameOfStudent", formData[index].nameOfStudent);

  const classCell = clonedRowTemplate.querySelector('.studentClass');
  classCell.textContent = formData[index].class;

  const schoolCell = clonedRowTemplate.querySelector('.studentSch');
  schoolCell.textContent = formData[index].school;

  const eligibilityCell = clonedRowTemplate.querySelector('.studentEligibility');
  eligibilityCell.textContent = formData[index].eligibility;

  const formattedDateCell = clonedRowTemplate.querySelector('.courseDate');
  formattedDateCell.textContent = formattedDate;

  const formStatusValue = formData[index].formStatus;

  return {
    studentNRICCell,
    nameOfStudentCell,
    classCell,
    schoolCell,
    eligibilityCell,
    formattedDateCell,
    formStatusValue
  };
}

// Function to handle checkboxes
function handleCheckBoxes(clonedRowTemplate, nameOfStudentCell, schoolCell, classCell, formattedDateCell, formStatusValue, exportContainer, exportIcon, targetDataArray) {
  const checkBoxes = clonedRowTemplate.querySelectorAll('#checkBox');
  const checkBoxTop = document.querySelector('#checkBoxTop');

  checkBoxTop.addEventListener('change', function () {
    const isChecked = checkBoxTop.checked;

    checkBoxes.forEach(function (checkbox) {
      checkbox.checked = isChecked;
      checkbox.disabled = isChecked;

      if (isChecked) {
        const applicantName = nameOfStudentCell.textContent;
        const schoolOrg = schoolCell.textContent;
        const classNo = classCell.textContent;
        const courseDate = formattedDateCell.textContent;
        const formStatus = formStatusValue;

        targetDataArray.push({
          "Name of Applicant": applicantName,
          "Organization/School": schoolOrg,
          "Designation/Class": classNo,
          "Course Date": courseDate,
          "Form Status": formStatus
        });

        console.log(targetDataArray);
      } else {
        for (let i = 0; i < targetDataArray.length; i++) {
          if (targetDataArray[i]["Name of Applicant"] === nameOfStudentCell.textContent) {
            targetDataArray.splice(i, 1);
          }
        }
      }
    });

    if (isChecked) {
      // Append exportIcon when the checkbox is checked
      exportContainer.appendChild(exportIcon);
    } else {
      // Remove exportIcon when the checkbox is not checked
      if (exportIcon.parentNode === exportContainer) {
        exportContainer.removeChild(exportIcon);
      }
    }
    
  });
}


//FUNCTION TO OPEN MODAL VIA CLICKING ON THE TABLE ROW
function openModal(studentName) {
  // Perform additional actions or make API requests using the studentName
  axios.get(`${API_URL}/${studentName}`)
    .then(function (response) {
      const formData = response.data[0];
      console.log(formData);
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
      const dateObjAckDate = new Date(formData.dateOfAcknowledgement);
      const formatToLocal5 = dateObjAckDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const datePartsAckDate = formatToLocal5.split("/");
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
        const formStatus = String(formData.formStatus);

        exportToExcel(applicantName, schoolOrg, classNo, courseDate, formStatus);
        console.log(applicantName, schoolOrg, classNo, courseDate, formStatus);

        // Remove the event listener to avoid repeated downloads
        exportBtns.forEach((exportBtn) => {
          exportBtn.removeEventListener("click", handleExportClick);
        });
      }

      displayFormModal(formData, formattedCourseDate, formattedVaccinationDate, formattedExamDate, formattedAckDate);

    })
    .catch(function (error) {
      // Handle errors
      console.log(error);
    });
}

//FUNCTION TO DSIPLAY FORM MODAL
function displayFormModal(formData, formattedCourseDate, formattedVaccinationDate, formattedExamDate, formattedAckDate) {
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
  if (rejectBtn) {
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
  }



  const approveBtn = document.querySelector('#approveBtn');
  if (approveBtn) {
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
function handleModalButtons(clonedRowTemplate, nameOfStudentCell, formData) {
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
    if (index >= 0 && index < formData.length) {
      const formStatus = formData[index].formStatus;
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

  handleFormClick(i);

  modalBtns.forEach(function (modalBtn) {
    modalBtn.addEventListener("mousedown", function () {
      modalBtn7.classList.add("changePill");
      openModal(nameOfStudentCell.getAttribute("nameOfStudent"));
      
    });
  });
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


//Function to export to excel individually
function exportToExcel(applicantName, schoolOrg, classNo, courseDate, formStatus) {
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
        "Form Status": formStatus,
      },
    ],
    {
      header: [
        "Name of Applicant",
        "Organization/School",
        "Designation/Class",
        "Course Date",
        "Form Status",
      ],
    }
  );
  // add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Student Data");
  // save the workbook as an Excel file
  XLSX.writeFile(workbook, applicantName + ".xlsx");

}

//Function to export to excel bulk
function exportToExcelBulk(data) {


  // Create a new worksheet with the formatted data
  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: [
      "Name of Applicant",
      "Organization/School",
      "Designation/Class",
      "Course Date",
      "Form Status",
    ],
  });
console.log(data)
  // Create a new workbook and add the worksheet to it
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bulk Data");

  // Save the workbook as an Excel file
  XLSX.writeFile(workbook, "exportedBulk.xlsx");
}


document.addEventListener("DOMContentLoaded", function () {
  
  axios.get(`${API_URL}/all`)
    .then(function (response) {
      const configURL = response.config.url;
      const requestURL = response.request.responseURL;
      if (configURL !== requestURL) {
        window.location.href = "/error?code=403";
        throw new Error("redirected");
      }

      //call function to update status count
      const formData = response.data;
      console.log(response);
      updateFormCounts(formData);

      //call function to create export button for
      const exportBtnBulkContainer = document.querySelector('#export-btn-all');
      const exportIcon = createExportButtonAll();


      const successBtn = document.querySelector('.successBtn');
      const rejectBtn = document.querySelector('.rejectBtn');
      if (successBtn) {
        successBtn.addEventListener('click', function () {

          const pillPending = document.querySelector('.changePill');
          pillPending.classList.remove('changePill');

        });
      }
      if (rejectBtn) {
        rejectBtn.addEventListener('click', function () {
          const pillPending = document.querySelector('.changePill');
          pillPending.classList.remove('changePill');

        });
      }
      //create array to store all data for export to excel bulk
      const dataAll = []; 
      // Loop through the data and add it to the page
      for (i = 0; i < formData.length; i++) {
        //call function to format date
        const formattedDate = createFormattedDate(formData[i].courseDate);
        console.log(formattedDate);
        // Get references to the status container and template
        const getAllForms = document.querySelector('#getAllForms');
        const rowTemplate = document.querySelector('.row-table-template');

        //clear html content in getAllForms once since using template
        if (i === 0) {
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
          formStatusValue
        } = populateRowData(clonedRowTemplate, formData, i, formattedDate);

        //call function to handle checkboxes
        handleCheckBoxes(clonedRowTemplate, nameOfStudentCell, schoolCell, classCell, formattedDateCell, formStatusValue, exportBtnBulkContainer, exportIcon, dataAll)



        //get all modalBtns and add attribute so that checkbox will not be affected by openModal function
        handleModalButtons(clonedRowTemplate, nameOfStudentCell, formData);
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


function createExportButtonSearch() {
  // Create the export button element for all data
  const exportIcon = document.createElement('img');
  exportIcon.src = '../../assets/images/export-to-excel-icon.png';
  exportIcon.id = 'export-btn';
  exportIcon.alt = 'export-icon';
  return exportIcon;
}

function createExportButtonFilter() {
  // Create the export button element for all data
  const exportIcon = document.createElement('img');
  exportIcon.src = '../../assets/images/export-to-excel-icon.png';
  exportIcon.id = 'export-btn';
  exportIcon.alt = 'export-icon';
  return exportIcon;
}
const searchInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector('#search-button');
const searchClearBtn = document.querySelector('#clear-button');


function searchForms() {
  const exportBtnFilter = document.querySelector('#export-btn-filter');
  const exportBtnFilterSchool = document.querySelector('#export-btn-filter-school');
  const exportBtnFilterCourseDate = document.querySelector('#export-btn-filter-course-date');
  const exportBtnFilterEligibility = document.querySelector('#export-btn-filter-eligibility');
  const exportBtnAll = document.querySelector('#export-btn-all');
  if (exportBtnAll) {
    exportBtnAll.style.display = 'none';
  }
  const exportBtnSearch = document.querySelector('#export-btn-search');
  if (exportBtnSearch) {
    exportBtnSearch.style.display = 'block';
  }

  if (exportBtnFilter) {
    exportBtnFilter.style.display = 'none';
  }
  if (exportBtnFilterSchool){
    exportBtnFilterSchool.style.display = 'none';
  }
  if (exportBtnFilterCourseDate) {
    exportBtnFilterCourseDate.style.display = 'none';
  }
  if (exportBtnFilterEligibility) {
    exportBtnFilterEligibility.style.display = 'none';
  }
  
  const dataSearch = []; 

  const exportBtnBulkContainer = document.querySelector('#export-btn-search');
  const exportIcon = createExportButtonSearch();
  

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
        if (formData.length === 0) {
          showAlert("Error: Search does not exist.");
          location.reload();

        }
        //call function to update status count
        updateFormCounts(formData);
      
        // Loop through the data and add it to the page
        for (i = 0; i < formData.length; i++) {
          //call function to format date
          const formattedDate = createFormattedDate(formData[i].courseDate);
          // Get references to the status container and template
          const getAllForms = document.querySelector('#getAllForms');
          const rowTemplate = document.querySelector('.row-table-template');

          //clear html content in getAllForms once since using template
          if (i === 0) {
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
            formStatusValue
          } = populateRowData(clonedRowTemplate, formData, i, formattedDate);
        
          //call function to handle checkboxes
          handleCheckBoxes(clonedRowTemplate, nameOfStudentCell, schoolCell, classCell, formattedDateCell, formStatusValue, exportBtnBulkContainer, exportIcon,dataSearch)



          //get all modalBtns and add attribute so that checkbox will not be affected by openModal function
            handleModalButtons(clonedRowTemplate, nameOfStudentCell, formData);
          ;

        }
        //Outside of for loop 
        //Export to Excel Bulk Once
        const exportBtnBulk = document.querySelector('#export-btn-search');
        exportBtnBulk.addEventListener('click', function () {
          console.log(dataSearch);
          exportToExcelBulk(dataSearch);

        });
      })
      .catch(function (error) {
        if (error && error.message !== "redirected") {
          console.log(error);
        }
        console.log(error);
      });
  }

}
function showAlert(message) {
  alert(message);
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
//SHOW FILTERS ON CLICK
////////////////////////////
const filterIcons = document.querySelector('#filter-icon');
const filterDropDowns = document.querySelector('.displayFilters');
filterIcons.addEventListener('click', () => {
  if (filterDropDowns.style.display === 'none') {
    filterDropDowns.style.display = 'block';
  } else {
    filterDropDowns.style.display = 'none';
  }
});







////////////////////////////
//Filters
////////////////////////////

document.addEventListener('DOMContentLoaded', (event) => {
  var dropdownMenuStayOpen = document.querySelectorAll('.dropdown-menu-stay');
  const classDropDown = document.getElementById('classDropDown');
  const schoolDropDown = document.getElementById('schoolDropDown');
  const courseDateDropDown = document.getElementById('courseDateDropDown');
  const eligibilityDropDown = document.getElementById('eligibilityDropDown');
  const exportBtnFilter = document.querySelector('#export-btn-filter');
  const exportBtnFilterSchool = document.querySelector('#export-btn-filter-school');
  const exportBtnFilterCourseDate = document.querySelector('#export-btn-filter-course-date');
  const exportBtnFilterEligibility = document.querySelector('#export-btn-filter-eligibility');

  // prevent menu from closing down 
  for (var i = 0; i < dropdownMenuStayOpen.length; i++) {
    dropdownMenuStayOpen[i].addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  document.getElementById('classMenuButton').addEventListener('click', function () {
    const exportBtnAll = document.querySelector('#export-btn-all');
    if (exportBtnAll) {
      exportBtnAll.remove();
    }
    const exportBtnSearch = document.querySelector('#export-btn-search');
    if (exportBtnSearch) {
      exportBtnSearch.style.display = 'none';
    }
    if (exportBtnFilter) {
      exportBtnFilter.style.display = 'block';
    }
    if (exportBtnFilterSchool){
      exportBtnFilterSchool.style.display = 'none';
    }
    if (exportBtnFilterCourseDate) {
      exportBtnFilterCourseDate.style.display = 'none';
    }
    if (exportBtnFilterEligibility) {
      exportBtnFilterEligibility.style.display = 'none';
    }

    const limit = 7;
    let offset = 0;
    const classesDiv = document.getElementById('classesDiv');
    const searchBar = document.getElementById('classSearch');
  

    const fetchClasses = (searchTerm = '') => {


      fetch(`/getClasses?limit=${limit}&offset=${offset}&search=${searchTerm}`)
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
          //so that there is no duplicate divs when reselected
          const existingDivs = classesDiv.querySelectorAll('.newDiv');
          existingDivs.forEach(div => div.remove());

          data.forEach(item => {
            const newDiv = document.createElement('div');
            newDiv.classList.add('newDiv');
            const li = document.createElement('li');
            li.textContent = item.class;
            li.className = "m-3";
            li.setAttribute("class-id", item.class);
            li.addEventListener('click', function () {
              const classId = this.getAttribute('class-id');
              axios.get(`${API_URL}/filter/class/${classId}`)
                .then(response => {
                  const configURL = response.config.url;
                  const requestURL = response.request.responseURL;

                  // Decode the URL-encoded strings
                  const decodedConfigURL = decodeURIComponent(configURL);
                  const decodedRequestURL = decodeURIComponent(requestURL);
                  console.log(decodedConfigURL);
                  console.log(decodedRequestURL);
                  if (decodedConfigURL !== decodedRequestURL) {
                    window.location.href = "/error?code=403";
                    throw new Error("redirected");
                  }
                  //call function to update status count
                  const formData = response.data;
                  console.log(formData);
                  updateFormCounts(formData);

                  //call function to create export button for
                  const exportIcon = createExportButtonFilter();


                  const successBtn = document.querySelector('.successBtn');
                  const rejectBtn = document.querySelector('.rejectBtn');
                  if (successBtn) {
                    successBtn.addEventListener('click', function () {

                      const pillPending = document.querySelector('.changePill');
                      pillPending.classList.remove('changePill');

                    });
                  }
                  if (rejectBtn) {
                    rejectBtn.addEventListener('click', function () {
                      const pillPending = document.querySelector('.changePill');
                      pillPending.classList.remove('changePill');

                    });
                  }
                    //create array to store all data for export to excel bulk
const dataFilterClass = []; 
                  // Loop through the data and add it to the page
                  for (i = 0; i < formData.length; i++) {
                    //call function to format date
                    const formattedDate = createFormattedDate(formData[i].courseDate);
                    // Get references to the status container and template
                    const getAllForms = document.querySelector('#getAllForms');
                    const rowTemplate = document.querySelector('.row-table-template');
          
                    //clear html content in getAllForms once since using template
                    if (i === 0) {
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
                      formStatusValue
                    } = populateRowData(clonedRowTemplate, formData, i, formattedDate);
                  
                    //call function to handle checkboxes
                    handleCheckBoxes(clonedRowTemplate, nameOfStudentCell, schoolCell, classCell, formattedDateCell, formStatusValue, exportBtnFilter, exportIcon,dataFilterClass)
          
          
                    //get all modalBtns and add attribute so that checkbox will not be affected by openModal function
                      handleModalButtons(clonedRowTemplate, nameOfStudentCell, formData);
                    ;
          
                  }
                  //Outside of for loop 
                  //Export to Excel Bulk Once
                  const exportBtnBulk = document.querySelector('#export-btn-filter');
                  if(exportBtnBulk){
                  exportBtnBulk.addEventListener('click', function () {
                    console.log(dataFilterClass);
                    exportToExcelBulk(dataFilterClass);
                  });
                }

                })
                .catch(function (error) {
                  if (error && error.message !== "redirected") {
                    console.log(error);
                  }
                  console.log(error);
                });
            });
            newDiv.appendChild(li);
            classesDiv.appendChild(newDiv);
          });

          // Increase the offset for the next fetch
          offset += limit;
          console.log(offset + '1')
          // If reached the end of data, remove any more scroll
          if (data.length < limit) {
            document.getElementById('classDropDownMenu').removeEventListener('scroll', handleScroll);
          }
        })
        .catch(error => console.error('Error:', error));
    };

    const handleScroll = (e) => {
      const nearBottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 5;
      if (nearBottom) {
        // Remove the scroll event listener to prevent multiple requests
        classesDiv.removeEventListener('scroll', handleScroll);

        // Fetch the next set of data
        fetchClasses();
      }
    };

    // Search event listener
    searchBar.addEventListener('input', function () {
      // Reset the offset and clear the classesDiv
      offset = 0;
      classesDiv.innerHTML = "";
      // Add the loading message
      const loadingMsgTemplate = document.getElementById("loadingMsgTemp").content.cloneNode(true);
      classesDiv.appendChild(loadingMsgTemplate);

      // Fetch the new search results
      fetchClasses(searchBar.value.trim());

      // Reattach the scroll event listener
      // document.getElementById('classDropDownMenu').addEventListener('scroll', handleScroll);
    });

    // when dropdown is closed
    classDropDown.addEventListener('hide.bs.dropdown', event => {
      const loadingMsgTemplate = document.getElementById("loadingMsgTemp").content.cloneNode(true);
      const classesDiv = document.getElementById('classesDiv');
      searchBar.value = '';
      classesDiv.innerHTML = '';
      classesDiv.appendChild(loadingMsgTemplate);
      document.getElementById('classDropDownMenu').removeEventListener('scroll', handleScroll);
      offset = 0;
      console.log(offset);
    });

    // Fetch the first set of data
    fetchClasses();
    document.getElementById('classDropDownMenu').addEventListener('scroll', handleScroll);
  });


  document.getElementById('schoolMenuButton').addEventListener('click', function () {
    const exportBtnAll = document.querySelector('#export-btn-all');
    if (exportBtnAll) {
      exportBtnAll.remove();
    }
    const exportBtnSearch = document.querySelector('#export-btn-search');
    if (exportBtnSearch) {
      exportBtnSearch.remove();
    }
    
    if (exportBtnFilter) {
      exportBtnFilter.style.display = 'none';
    }
    if (exportBtnFilterSchool){
      exportBtnFilterSchool.style.display = 'block';
    }
    if (exportBtnFilterCourseDate) {
      exportBtnFilterCourseDate.style.display = 'none';
    }
    if (exportBtnFilterEligibility) {
      exportBtnFilterEligibility.style.display = 'none';
    }
    const limit = 7;
    let offset = 0;
    const schoolsDiv = document.getElementById('schoolsDiv');
    const searchBar = document.getElementById('schoolSearch');

    const fetchSchools = (searchTerm = '') => {

      fetch(`/getSchools?limit=${limit}&offset=${offset}&search=${searchTerm}`)
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
          //so that there is no duplicate divs when reselected
          const existingDivs = schoolsDiv.querySelectorAll('.newDiv');
          existingDivs.forEach(div => div.remove());
          data.forEach(item => {
            const newDiv = document.createElement('div');
            newDiv.classList.add('newDiv');
            const li = document.createElement('li');
            li.textContent = item.school;
            li.className = "m-3";
            li.setAttribute("school-id", item.school);
            li.style.cursor = "pointer"; // Set the cursor style
            //Click function to filter by school
            li.addEventListener('click', function () {
              const schoolId = this.getAttribute('school-id');
              axios.get(`${API_URL}/filter/school/${schoolId}`)
                .then(response => {
                  const configURL = response.config.url;
                  const requestURL = response.request.responseURL;

                  // Decode the URL-encoded strings
                  const decodedConfigURL = decodeURIComponent(configURL);
                  const decodedRequestURL = decodeURIComponent(requestURL);
                  console.log(decodedConfigURL);
                  console.log(decodedRequestURL);
                  if (decodedConfigURL !== decodedRequestURL) {
                    window.location.href = "/error?code=403";
                    throw new Error("redirected");
                  }
                  //call function to update status count
                  const formData = response.data;
                  console.log(response);
                  updateFormCounts(formData);

                


                  const successBtn = document.querySelector('.successBtn');
                  const rejectBtn = document.querySelector('.rejectBtn');
                  if (successBtn) {
                    successBtn.addEventListener('click', function () {

                      const pillPending = document.querySelector('.changePill');
                      pillPending.classList.remove('changePill');

                    });
                  }
                  if (rejectBtn) {
                    rejectBtn.addEventListener('click', function () {
                      const pillPending = document.querySelector('.changePill');
                      pillPending.classList.remove('changePill');

                    });
                  }
                    //call function to create export button for
                    const exportIcon = createExportButtonAll();
                    console.log(exportBtnFilterSchool)
                  const dataFilterSchool = []
                  // Loop through the data and add it to the page
                  for (i = 0; i < formData.length; i++) {
                    //call function to format date
                    const formattedDate = createFormattedDate(formData[i].courseDate);
                    // Get references to the status container and template
                    const getAllForms = document.querySelector('#getAllForms');
                    const rowTemplate = document.querySelector('.row-table-template');

                    //clear html content in getAllForms once since using template
                    if (i === 0) {
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
                      formStatusValue
                    } = populateRowData(clonedRowTemplate, formData, i, formattedDate);
                    
                    
                    console.log("huhuh")
                   
                  
                     //call function to handle checkboxes
                    handleCheckBoxes(clonedRowTemplate, nameOfStudentCell, schoolCell, classCell, formattedDateCell, formStatusValue, exportBtnFilterSchool, exportIcon, dataFilterSchool) 



                    //get all modalBtns and add attribute so that checkbox will not be affected by openModal function
                      handleModalButtons(clonedRowTemplate, nameOfStudentCell, formData);
                    ;


                  }
                  //Outside of for loop 
                  //Export to Excel Bulk Once
                  
                  const exportBtnBulk = document.querySelector('#export-btn-filter-school');
                  if(exportBtnBulk){
                  exportBtnBulk.addEventListener('click', function () {
                    console.log(dataFilterSchool);
                    exportToExcelBulk(dataFilterSchool);
                  });
                }

                })
                .catch(function (error) {
                  if (error && error.message !== "redirected") {
                    console.log(error);
                  }
                  console.log(error);
                });
            });
            newDiv.appendChild(li);
            schoolsDiv.appendChild(newDiv);
          });

          // Increase the offset for the next fetch
          offset += limit;

          // Remove the loadingMsg div after the first fetch
          if (offset === limit) {
            const schoolsLoadingMsg = document.querySelector('#schoolDropDown .loadingMsg');
            if (schoolsLoadingMsg) {
              schoolsLoadingMsg.remove();
            }
          }

          // If reached the end of data, remove any more scroll
          if (data.length < limit) {
            schoolsDiv.removeEventListener('scroll', handleScroll);
          }
        })
        .catch(error => console.error('Error:', error));
    };

    const handleScroll = (e) => {
      const nearBottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 5;
      if (nearBottom) {
        // Remove the scroll event listener to prevent multiple requests
        schoolsDiv.removeEventListener('scroll', handleScroll);

        // Fetch the next set of data
        fetchSchools();
      }

    };

    // Search event listener
    searchBar.addEventListener('input', function () {
      offset = 0;
      schoolsDiv.innerHTML = "";

      // Add the loading message
      const loadingMsgTemplate = document.getElementById("loadingMsgTemp").content.cloneNode(true);
      schoolsDiv.appendChild(loadingMsgTemplate);

      // Fetch the new search results
      fetchSchools(searchBar.value.trim());

      // Reattach the scroll event listener
      //schoolsDiv.addEventListener('scroll', handleScroll);
    });

    schoolDropDown.addEventListener('hidden.bs.dropdown', event => {
      const loadingMsgTemplate = document.getElementById("loadingMsgTemp").content.cloneNode(true);;
      const schoolsDiv = document.getElementById('schoolsDiv');
      searchBar.value = '';
      schoolsDiv.innerHTML = "";
      schoolsDiv.appendChild(loadingMsgTemplate);
      document.getElementById('schoolDropDownMenu').removeEventListener('scroll', handleScroll);
      offset = 0;
    });
    // Fetch the first set of data
    fetchSchools();
    document.getElementById('schoolDropDownMenu').addEventListener('scroll', handleScroll);
  });

  document.getElementById('courseDateMenuButton').addEventListener('click', function () {
    const exportBtnAll = document.querySelector('#export-btn-all');
    if (exportBtnAll) {
      exportBtnAll.remove();
    }
    const exportBtnSearch = document.querySelector('#export-btn-search');
    if (exportBtnSearch) {
      exportBtnSearch.remove();
    }
    if (exportBtnFilter) {
      exportBtnFilter.style.display = 'none';
    }
    if (exportBtnFilterSchool){
      exportBtnFilterSchool.style.display = 'none';
    }
    if (exportBtnFilterCourseDate) {
      exportBtnFilterCourseDate.style.display = 'block';
    }
    if (exportBtnFilterEligibility) {
      exportBtnFilterEligibility.style.display = 'none';
    }
   
    const limit = 7;
    let offset = 0;
    const courseDatesDiv = document.getElementById('courseDatesDiv');
    const searchBar = document.getElementById('courseDateSearch');

    const fetchCourseDates = (searchTerm = '') => {

      fetch(`/getCourseDates?limit=${limit}&offset=${offset}&search=${searchTerm}`)
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
          //so that there is no duplicate divs when reselected
          const existingDivs = courseDatesDiv.querySelectorAll('.newDiv');
          existingDivs.forEach(div => div.remove());
          data.forEach(item => {
            const newDiv = document.createElement('div');
            newDiv.classList.add('newDiv');
            const li = document.createElement('li');
            const courseDate = createFormattedDate(item.courseDate);
            const courseDateDBFormat = courseDate.split('/').reverse().join('-');
            li.textContent = courseDate;
            li.className = "m-3";
            li.setAttribute("course-date-id", courseDateDBFormat);
            li.style.cursor = "pointer";
            li.addEventListener('click', function () {
              const courseDate = this.getAttribute('course-date-id');
              axios.get(`${API_URL}/filter/courseDate/${courseDate}`)
                .then(response => {
                  const configURL = response.config.url;
                  const requestURL = response.request.responseURL;

                  // Decode the URL-encoded strings
                  const decodedConfigURL = decodeURIComponent(configURL);
                  const decodedRequestURL = decodeURIComponent(requestURL);
                  console.log(decodedConfigURL);
                  console.log(decodedRequestURL);
                  if (decodedConfigURL !== decodedRequestURL) {
                    window.location.href = "/error?code=403";
                    throw new Error("redirected");
                  }
                  //call function to update status count
                  const formData = response.data;
                  console.log(response);
                  updateFormCounts(formData);

                  //call function to create export button for

                  const exportIcon = createExportButtonAll();


                  const successBtn = document.querySelector('.successBtn');
                  const rejectBtn = document.querySelector('.rejectBtn');
                  if (successBtn) {
                    successBtn.addEventListener('click', function () {

                      const pillPending = document.querySelector('.changePill');
                      pillPending.classList.remove('changePill');

                    });
                  }
                  if (rejectBtn) {
                    rejectBtn.addEventListener('click', function () {
                      const pillPending = document.querySelector('.changePill');
                      pillPending.classList.remove('changePill');

                    });
                  }
                  const dataFilterCourseDate=[]
                  // Loop through the data and add it to the page
                  for (i = 0; i < formData.length; i++) {
                    //call function to format date
                    const formattedDate = createFormattedDate(formData[i].courseDate);
                    // Get references to the status container and template
                    const getAllForms = document.querySelector('#getAllForms');
                    const rowTemplate = document.querySelector('.row-table-template');

                    //clear html content in getAllForms once since using template
                    if (i === 0) {
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
                      formStatusValue
                    } = populateRowData(clonedRowTemplate, formData, i, formattedDate);

                    //call function to handle checkboxes
                    handleCheckBoxes(clonedRowTemplate, nameOfStudentCell, schoolCell, classCell, formattedDateCell, formStatusValue, exportBtnFilterCourseDate, exportIcon, dataFilterCourseDate)



                    //get all modalBtns and add attribute so that checkbox will not be affected by openModal function
                      handleModalButtons(clonedRowTemplate, nameOfStudentCell, formData);
                    ;


                  }
                  //Outside of for loop 
                  //Export to Excel Bulk Once
                  const exportBtnBulk = document.querySelector('#export-btn-filter-course-date');
                  if(exportBtnBulk){
                  exportBtnBulk.addEventListener('click', function () {
                    console.log(dataFilterCourseDate);
                    exportToExcelBulk(dataFilterCourseDate);
                  });
                }

                })
                .catch(function (error) {
                  if (error && error.message !== "redirected") {
                    console.log(error);
                  }
                  console.log(error);
                });
            });
            newDiv.appendChild(li);
            courseDatesDiv.appendChild(newDiv);
          });

          // Increase the offset for the next fetch
          offset += limit;

          // Remove the loadingMsg div after the first fetch
          if (offset === limit) {
            const courseDatesLoadingMsg = document.querySelector('#courseDateDropDown .loadingMsg');
            if (courseDatesLoadingMsg) {
              courseDatesLoadingMsg.remove();
            }
          }

          // If reached the end of data, remove any more scroll
          if (data.length < limit) {
            courseDatesDiv.removeEventListener('scroll', handleScroll);
          }
        })
        .catch(error => console.error('Error:', error));
    };

    const handleScroll = (e) => {
      const nearBottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 5;
      if (nearBottom) {
        // Remove the scroll event listener to prevent multiple requests
        courseDatesDiv.removeEventListener('scroll', handleScroll);

        // Fetch the next set of data
        fetchCourseDates();
      }
    };
    // Search event listener
    searchBar.addEventListener('input', function () {
      offset = 0;
      courseDatesDiv.innerHTML = "";

      // Add the loading message
      const loadingMsgTemplate = document.getElementById("loadingMsgTemp").content.cloneNode(true);
      courseDatesDiv.appendChild(loadingMsgTemplate);

      // Fetch the new search results
      fetchCourseDates(searchBar.value.trim());

      // Reattach the scroll event listener
      //courseDatesDiv.addEventListener('scroll', handleScroll);
    });

    courseDateDropDown.addEventListener('hidden.bs.dropdown', event => {
      const loadingMsgTemplate = document.getElementById("loadingMsgTemp").content.cloneNode(true);;
      const courseDatesDiv = document.getElementById('courseDatesDiv');
      searchBar.value = '';
      courseDatesDiv.innerHTML = "";
      courseDatesDiv.appendChild(loadingMsgTemplate);
      document.getElementById('courseDateDropDownMenu').removeEventListener('scroll', handleScroll);
      offset = 0;
      console.log(offset);
    });

    // Fetch the first set of data
    fetchCourseDates();
    document.getElementById('courseDateDropDownMenu').addEventListener('scroll', handleScroll);
  });

  document.getElementById('eligibilityMenuButton').addEventListener('click', function () {
    const exportBtnAll = document.querySelector('#export-btn-all');
    if (exportBtnAll) {
      exportBtnAll.remove();
    }
    const exportBtnSearch = document.querySelector('#export-btn-search');
    if (exportBtnSearch) {
      exportBtnSearch.remove();
    }
    if (exportBtnFilter) {
      exportBtnFilter.style.display = 'none';
    }
    if (exportBtnFilterSchool){
      exportBtnFilterSchool.style.display = 'none';
    }
    if (exportBtnFilterCourseDate) {
      exportBtnFilterCourseDate.style.display = 'none';
    }
    if (exportBtnFilterEligibility) {
      exportBtnFilterEligibility.style.display = 'block';
    }
    
    const limit = 7;
    let offset = 0;
    const eligibilityDiv = document.getElementById('eligibilityDiv');

    const fetchEligibility = () => {

      fetch(`/getEligibility?limit=${limit}&offset=${offset}`)
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
          //so that there is no duplicate divs when reselected
          const existingDivs = eligibilityDiv.querySelectorAll('.newDiv');
          existingDivs.forEach(div => div.remove());
          data.forEach(item => {
            const newDiv = document.createElement('div');
            newDiv.classList.add('newDiv');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.setAttribute('eligibility-id', item.eligibility);
            checkbox.name = 'status';
            checkbox.value = item.eligibility;
            const label = document.createElement('label');
            label.classList.add('m-1');
            label.textContent = item.eligibility; 
            newDiv.appendChild(checkbox);
            newDiv.appendChild(label);
            newDiv.appendChild(document.createElement('br'));
            eligibilityDiv.appendChild(newDiv);
          });

          // Increase the offset for the next fetch
          offset += limit;

          // Remove the loadingMsg div after the first fetch
          if (offset === limit) {
            const eligibilityLoadingMsg = document.querySelector('#eligibilityDropDown .loadingMsg');
            if (eligibilityLoadingMsg) {
              eligibilityLoadingMsg.remove();
            }
          }
        })
        .catch(error => console.error('Error:', error));
    };
    eligibilityDropDown.addEventListener('hidden.bs.dropdown', event => {
      const loadingMsgTemplate = document.getElementById("loadingMsgTemp").content.cloneNode(true);;
      eligibilityDiv.innerHTML = "";
      eligibilityDiv.appendChild(loadingMsgTemplate);
      offset = 0;
      console.log(offset);
    });
    // Fetch the first set of data
    fetchEligibility();
  });

  document.getElementById('eligibilityDiv').addEventListener('click', function (event) {
   
    if (event.target.type === 'checkbox') {
      const eligibilityDiv = event.target.parentElement;
      const checkboxList = eligibilityDiv.querySelectorAll('input[type="checkbox"][eligibility-id]:checked');
      const eligibilityIds = Array.from(checkboxList).map(checkbox => checkbox.getAttribute('eligibility-id'));
       // Check if both checkboxes are selected
    if (checkboxList.length === 2) {
      eligibilityIds.push("Fit", "Unfit");
    }
    
   
      const filter = eligibilityIds.join(',');
      console.log(filter);
      axios.get(`${API_URL}/filter/eligibility/${filter}`)
      .then(response => {
        const configURL = response.config.url;
        const requestURL = response.request.responseURL;

        // Decode the URL-encoded strings
        const decodedConfigURL = decodeURIComponent(configURL);
        const decodedRequestURL = decodeURIComponent(requestURL);
        console.log(decodedConfigURL);
        console.log(decodedRequestURL);
        if (decodedConfigURL !== decodedRequestURL && document.getElementById('checkboxId').checked) {
          window.location.href = "/error?code=403";
          throw new Error("redirected");
        }
        //call function to update status count
        const formData = response.data;
        console.log(formData);
        updateFormCounts(formData);

        //call function to create export button for

        const exportIcon = createExportButtonAll();


        const successBtn = document.querySelector('.successBtn');
        const rejectBtn = document.querySelector('.rejectBtn');
        if (successBtn) {
          successBtn.addEventListener('click', function () {

            const pillPending = document.querySelector('.changePill');
            pillPending.classList.remove('changePill');

          });
        }
        if (rejectBtn) {
          rejectBtn.addEventListener('click', function () {
            const pillPending = document.querySelector('.changePill');
            pillPending.classList.remove('changePill');

          });
        }
        const dataFilterEligibility = []
        // Loop through the data and add it to the page
        for (i = 0; i < formData.length; i++) {
          console.log("HHIIHHI")
          console.log(formData)
          //call function to format date
          const formattedDate = createFormattedDate(formData[i].courseDate);
          // Get references to the status container and template
          const getAllForms = document.querySelector('#getAllForms');
          const rowTemplate = document.querySelector('.row-table-template');

          //clear html content in getAllForms once since using template
          if (i === 0) {
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
            formStatusValue
          } = populateRowData(clonedRowTemplate, formData, i, formattedDate);

          //call function to handle checkboxes
          handleCheckBoxes(clonedRowTemplate, nameOfStudentCell, schoolCell, classCell, formattedDateCell, formStatusValue, exportBtnFilterEligibility, exportIcon, dataFilterEligibility)

        
          //get all modalBtns and add attribute so that checkbox will not be affected by openModal function
            handleModalButtons(clonedRowTemplate, nameOfStudentCell, formData);
          ;


        }
        //Outside of for loop 
        //Export to Excel Bulk Once
        const exportBtnBulk = document.querySelector('#export-btn-filter-eligibility');
        if(exportBtnBulk){
        exportBtnBulk.addEventListener('click', function () {
          console.log(dataFilterEligibility);
          exportToExcelBulk(dataFilterEligibility);
        });
      }
      })
      .catch(function (error) {
        if (error && error.message !== "redirected") {
          console.log(error);
        }
        console.log(error);
      });

    }
  });
  
  

});