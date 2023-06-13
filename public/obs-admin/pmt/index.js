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

      // Get references to the status container and template
      // const statusContainer = document.querySelector('.statusContainer');
      // const template = document.querySelector('.status-template');

      // Clone the template and append it to the status container
      // const templateContent = template.content;
      // const clonedTemplate = document.importNode(templateContent, true);

      // const pendingAmtElement = clonedTemplate.querySelector('.pendingAmt');
      // const apprAmtElement = clonedTemplate.querySelector('.apprAmt');
      // const rejAmtElement = clonedTemplate.querySelector('.rejAmt');

      // pendingAmtElement.textContent = `${formCounts.pending}`;
      // apprAmtElement.textContent = `${formCounts.approved}`;
      // rejAmtElement.textContent = `${formCounts.rejected}`;

      // statusContainer.appendChild(clonedTemplate);
      // console.log(formData);

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
        const modalBtns = [modalBtn1,modalBtn2, modalBtn3, modalBtn4, modalBtn5, modalBtn6,modalBtn7];

        modalBtns.forEach(function (modalBtn) {
          modalBtn.setAttribute("data-bs-toggle", "modal");
        });


        // pillDivCell.setAttribute("data-bs-target", `#staticBackdrop${i + 1}`);

        const formStatusDiv = clonedRowTemplate.querySelector('.pillPending');
        formStatusDiv.textContent = formData[i].formStatus;


        //To change the color of the pill
        if (formData[i].formStatus === "Pending") {
          formStatusDiv.classList.add("pillPending");
        } else if (formData[i].formStatus === "Rejected") {
          formStatusDiv.classList.add("pillRejected");
        } else if (formData[i].formStatus === "Approved") {
          formStatusDiv.classList.add("pillApproved");
        }



        getAllForms.appendChild(clonedRowTemplate);

        function handleFormClick(index) {
          //index = i;
          // Check if the index is within the valid range of the formData array
          if (index >= 0 && index < formData.length) {
            // Retrieve the formStatus of the clicked form at the given index
            const formStatus = formData[index].formStatus;

            // // Add a CSS class based on the formStatus to pillDivCell
            // pillDivCell.classList.add(`${formStatus.toLowerCase()}Form`);

            //loop to add attribute to all .modalBtn
            // Set the appropriate data-bs-target attribute based on the formStatus
            modalBtns.forEach(function (modalBtn) {
              if (formStatus === "Pending") {
                modalBtn.setAttribute("data-bs-target", "#staticBackdrop");
              } else if (formStatus === "Approved") {
                modalBtn.setAttribute("data-bs-target", "#staticBackdropAppr");
              } else if (formStatus === "Rejected") {
                modalBtn.setAttribute("data-bs-target", "#staticBackdropRej");
              }
            });


          }
        }

        // Call the handleFormClick function with the current value of i
        handleFormClick(i);

        modalBtns.forEach(function (modalBtn) {
          modalBtn.addEventListener("click", function () {
            openModal();
          });
        });
        function openModal() {


          const studentName = nameOfStudentCell.getAttribute("nameOfStudent");


          // Perform additional actions or make API requests using the studentName
          axios.get(`${API_URL}/${studentName}`)
            .then(function (response) {

              const formData = response.data[0];
              console.log(response.data);

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

              // Handle the response
              // Get references to the form modal containers and templates

              const formContainer = document.querySelector('.formModalContainer');
              //clear all values within the form modal 

              const formTemplate = document.querySelector('.form-modal-template');

              // Clone the template and append it to the form modal containers
              // Copy the HTML content of the template
              const templateContent = formTemplate.content;
              // Create a copy of the template content
              const clonedTemplate = document.importNode(templateContent, true);


              const nameInput = clonedTemplate.querySelector('#applicantName');
              const schoolInput = clonedTemplate.querySelector('#schoolOrg');
              const nricInput = clonedTemplate.querySelector('#personalId');
              const classInput = clonedTemplate.querySelector('#designation');
              const courseDateInput = clonedTemplate.querySelector('#courseDate');
              const dateVacInput = clonedTemplate.querySelector('#tetanusVaccine');
              const additonalInput = clonedTemplate.querySelector('#medicalText');
              const doctorNameInput = clonedTemplate.querySelector('#physicianName');
              const doctoMCRInput = clonedTemplate.querySelector('#mcrNo');
              const clinicNameInput = clonedTemplate.querySelector('#clinicName');
              const examDateInput = clonedTemplate.querySelector('#examDate');
              const doctorContactInput = clonedTemplate.querySelector('#contactNo');
              const clinicAddressInput = clonedTemplate.querySelector('#clinicAddress');
              const doctorSignatureInput = clonedTemplate.querySelector('#signatureData');


              nameInput.value = `${formData.nameOfStudent}`;
              console.log(formData.nameOfStudent + ' eeeee')
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

              const closeBtn = clonedTemplate.querySelector('.closeBtn');
              closeBtn.addEventListener('click', function () {
                // Clear the form modal container
                formContainer.innerHTML = '';
              });



              //call exportToExcel function
              const exportBtn = clonedTemplate.querySelector("#exportBtn");
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


              formContainer.appendChild(clonedTemplate);

              // Display the approve modal
              // Get references to the approve modal containers and templates
              const apprContainer = document.querySelector('.apprModalContainer');
              const apprTemplate = document.querySelector('.appr-modal-template');

              // Clone the template and append it to the approve modal containers
              const apprTemplateContent = apprTemplate.content;
              const apprClonedTemplate = document.importNode(apprTemplateContent, true);

              const confirmBtn = apprClonedTemplate.querySelector('.successBtn');
              confirmBtn.addEventListener('click', function () {
                // Clear the form modal container
                formContainer.innerHTML = '';
              });

              apprContainer.appendChild(apprClonedTemplate);

              // Display the approve modal
              // Get references to the approve modal containers and templates
              const rejContainer = document.querySelector('.rejModalContainer');
              const rejTemplate = document.querySelector('.rej-modal-template');

              // Clone the template and append it to the approve modal containers
              const rejTemplateContent = rejTemplate.content;
              const rejClonedTemplate = document.importNode(rejTemplateContent, true);

              const confirm2Btn = rejClonedTemplate.querySelector('.successBtn');
              confirm2Btn.addEventListener('click', function () {
                // Clear the form modal container
                formContainer.innerHTML = '';
              });

              rejContainer.appendChild(rejClonedTemplate);

            })
            .catch(function (error) {
              // Handle errors
              console.log(error);
            });

        }

      }
    })
    .catch(function (error) {
      console.log(error);
    });



});
















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
  XLSX.writeFile(workbook, "StudentForm.xlsx");

}