API_URL = `http://localhost:3000/api/pmt`;
document.addEventListener("DOMContentLoaded", function () {

  axios.get(`${API_URL}/all`)
    .then(function (response) {
      const formData = response.data;
      const formCounts = formData.reduce(
        (counts, form) => {
          if (form.formStatus === "Pending") {
            counts.pending++;
          } else if (form.formStatus === "Approved") {
            counts.approved++;
          } else if (form.formStatus === "Rejected") {
            counts.rejected++;
          }
          return counts;
        },
        { pending: 0, approved: 0, rejected: 0 }
      );
      console.log(formCounts);
      console.log(formCounts.pending);

      const pendingAmtElement = document.querySelector('.pendingAmt');
      const apprAmtElement = document.querySelector('.apprAmt');
      const rejAmtElement = document.querySelector('.rejAmt');

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
          });
        });
      }
    })
    .catch(function (error) {
      console.log(error);
    });
});

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
      const dateObj = new Date(formData.courseDate);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const formattedCourseDate = `${year}-${month}-${day}`;

      //Format the examDate
      const dateObj2 = new Date(formData.examinationDate);
      const year2 = dateObj2.getFullYear();
      const month2 = String(dateObj2.getMonth() + 1).padStart(2, "0");
      const day2 = String(dateObj2.getDate()).padStart(2, "0");
      const formattedExamDate = `${year2}-${month2}-${day2}`;
      
     
      const formStatus = formData.formStatus;

      
      openFormModal(formData, formattedCourseDate, formattedExamDate);
    })
    .catch(function (error) {
      // Handle errors
      console.log(error);
    });
}


////////////////////////////
//FUNCTION TO OPEN FORM MODAL
////////////////////////////
function openFormModal(formData, formattedCourseDate, formattedExamDate) {
  

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

  // Set input field values
  nameInput.value = `${formData.nameOfStudent}`;
  schoolInput.value = `${formData.school}`;
  nricInput.value = `${formData.studentNRIC}`;
  classInput.value = `${formData.class}`;
  courseDateInput.value = `${formattedCourseDate}`;
  dateVacInput.value = `${formData.dateOfVaccination}`;
  additonalInput.value = `${formData.review}`;
  doctorNameInput.value = `${formData.nameOfDoctor}`;
  doctoMCRInput.value = `${formData.doctorMCR}`;
  clinicNameInput.value = `${formData.nameOfClinic}`;
  examDateInput.value = `${formattedExamDate}`;
  doctorContactInput.value = `${formData.contactNo}`;
  clinicAddressInput.value = `${formData.clinicAddress}`;
  doctorSignatureInput.value = `${formData.signature}`;

  if (formData.formStatus === "Pending Parent") {
    const apprRejContainer = document.querySelector('#apprRejContainer');
    apprRejContainer.innerHTML = ''
    const pmtHeadingForm = document.querySelector('#pmtHeadingForm');
    pmtHeadingForm.innerHTML = ''
  }

  // const rejectBtn = document.querySelector('#rejectBtn');
  // rejectBtn.addEventListener('click', function () {
  //   // Update status to "rejected" in the database
  //   updateStatus(formData)
  //   if (formData.formStatus === 'Rejected') {
  //     rejectBtn.setAttribute("data-bs-target", "#staticBackdropRej");
  //   }
  // });

  // const approveBtn = document.querySelector('#approveBtn');
  // approveBtn.addEventListener('click', function () {
  //   // Update status to "approved" in the database
  //   updateStatus(formData)
  //   if (formData.formStatus === 'Approved') {
  //     approveBtn.setAttribute("data-bs-target", "#staticBackdropAppr");
      
  //     console.log("ewewew")
  //   }
  // });


  //call exportToExcel function

  exportBtn.addEventListener("click", (e) => {
    e.preventDefault(); // prevent the default form submission behavior
    // Get the values of the input fields
    const applicantName = nameInput.value
    const schoolOrg = schoolInput.value
    const classNo = classInput.value
    const courseDate = courseDateInput.value
    exportToExcel(applicantName, schoolOrg, classNo, courseDate);
    console.log(applicantName, schoolOrg, classNo, courseDate);
  });
}

function updateStatus(formData) {
  const studentId = formData.studentId;
axios
      .put(`${API_URL}/${studentId}`, { formStatus: 'Approved' })
      .then(function (response) {
        // Handle success
        console.log('Status updated to approved:', response.data);
        // Perform any additional actions or display a success message
        // Clear the form modal container
      
      

       

        
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

////////////////////////////
//FUNCTION TO EXPORT TO EXCEL
////////////////////////////
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
  XLSX.writeFile(workbook, "StudentForm.xlsx");

}