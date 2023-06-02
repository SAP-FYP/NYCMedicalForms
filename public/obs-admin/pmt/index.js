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
      const statusContainer = document.querySelector('.statusContainer');
      const template = document.querySelector('.status-template');

      // Clone the template and append it to the status container
      const templateContent = template.content;
      const clonedTemplate = document.importNode(templateContent, true);

      const pendingAmtElement = clonedTemplate.querySelector('.pendingAmt');
      const apprAmtElement = clonedTemplate.querySelector('.apprAmt');
      const rejAmtElement = clonedTemplate.querySelector('.rejAmt');

      pendingAmtElement.textContent = `${formCounts.pending}`;
      apprAmtElement.textContent = `${formCounts.approved}`;
      rejAmtElement.textContent = `${formCounts.rejected}`;

      statusContainer.appendChild(clonedTemplate);
      console.log(formData);
      
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

        const pillDivCell = clonedRowTemplate.querySelector('.modalBtn');
        pillDivCell.setAttribute("data-bs-toggle", "modal");
        pillDivCell.setAttribute("data-bs-target", `#staticBackdrop${i + 1}`);

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

            // Add a CSS class based on the formStatus to pillDivCell
            pillDivCell.classList.add(`${formStatus.toLowerCase()}Form`);

            // Set the appropriate data-bs-target attribute based on the formStatus
            if (formStatus === "Pending") {
              pillDivCell.setAttribute("data-bs-target", "#staticBackdrop");
            } else if (formStatus === "Approved") {
              pillDivCell.setAttribute("data-bs-target", "#staticBackdropAppr");
            } else if (formStatus === "Rejected") {
              pillDivCell.setAttribute("data-bs-target", "#staticBackdropRej");
            }


          }
        }

        // Call the handleFormClick function with the current value of i
        handleFormClick(i);


       

        pillDivCell.addEventListener("click", function () {
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


                let nameInput = clonedTemplate.querySelector('#applicantName');
                let schoolInput = clonedTemplate.querySelector('#schoolOrg');
                let nricInput = clonedTemplate.querySelector('#personalId');
                let classInput = clonedTemplate.querySelector('#designation');
                let courseDateInput = clonedTemplate.querySelector('#courseDate');
                let dateVacInput = clonedTemplate.querySelector('#tetanusVaccine');
                let additonalInput = clonedTemplate.querySelector('#medicalText');
                let doctorNameInput = clonedTemplate.querySelector('#physicianName');
                let doctoMCRInput = clonedTemplate.querySelector('#mcrNo');
                let clinicNameInput = clonedTemplate.querySelector('#clinicName');
                let examDateInput = clonedTemplate.querySelector('#examDate');
                let doctorContactInput = clonedTemplate.querySelector('#contactNo');
                let clinicAddressInput = clonedTemplate.querySelector('#clinicAddress');
                let doctorSignatureInput = clonedTemplate.querySelector('#signatureData');

                
                nameInput.value = `${formData.nameOfStudent}`;
                console.log(formData.nameOfStudent+' eeeee')
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
                 
                
                formContainer.appendChild(clonedTemplate);

                // Display the approve modal
                 // Get references to the approve modal containers and templates
                 const apprContainer = document.querySelector('.apprModalContainer');
                 const apprTemplate = document.querySelector('.appr-modal-template');
 
                 // Clone the template and append it to the approve modal containers
                 const apprTemplateContent = apprTemplate.content;
                 const apprClonedTemplate = document.importNode(apprTemplateContent, true);

                 apprContainer.appendChild(apprClonedTemplate);

                 // Display the approve modal
                 // Get references to the approve modal containers and templates
                 const rejContainer = document.querySelector('.rejModalContainer');
                 const rejTemplate = document.querySelector('.rej-modal-template');
 
                 // Clone the template and append it to the approve modal containers
                 const rejTemplateContent = rejTemplate.content;
                 const rejClonedTemplate = document.importNode(rejTemplateContent, true);

                 rejContainer.appendChild(rejClonedTemplate);

            })
            .catch(function (error) {
              // Handle errors
              console.log(error);
            });
        })
      }
    })
    .catch(function (error) {
      console.log(error);
    });



});
















const sideMenuBar = document.querySelector(".sideMenuBar");
const hamburgerIcon = document.querySelector(".openMenu");
const svgElement = document.querySelector("#openMenuContainer");
const navIconTextElements = document.querySelectorAll(".navIconText");
const bgOverlay = document.querySelector(".bgOverlay");
const signOutText = document.querySelector(".signOutText");
const anchorTag = document.querySelector("a");

const texts = ["Permission Groups", "Users", "Forms"];

hamburgerIcon.addEventListener("click", function () {
  sideMenuBar.classList.toggle("expanded");

  if (sideMenuBar.classList.contains("expanded")) {
    svgElement.style.transform = "rotate(180deg)";
    navIconTextElements.forEach((element, index) => {
      element.textContent = texts[index];
      element.style.display = "flex";
      element.style.paddingTop = "30px";
      element.style.paddingLeft = "20px";
    });
    signOutText.textContent = "Sign Out";
    signOutText.style.color = "black";
    signOutText.style.paddingLeft = "10px";
    anchorTag.style.textDecoration = "none";
  } else {
    svgElement.style.transform = "rotate(0deg)";
    sideMenuBar.classList.remove("expanded");
    svgElement.style.transform = "rotate(0deg)";
    navIconTextElements.forEach((element) => {
      element.textContent = "";
      element.style.display = "";
      element.style.paddingTop = "";
      element.style.paddingLeft = "";
    });
    signOutText.textContent = "";
    signOutText.style.color = "";
    signOutText.style.paddingLeft = "";
  }
});

const exportBtn = document.querySelector("#exportBtn");
form.addEventListener("submit", (e) => {
  e.preventDefault(); // prevent the default form submission behavior

  const applicantName = document.getElementById("applicantName").value;
  const schoolOrg = document.getElementById("schoolOrg").value;
  const classNo = document.getElementById("designation").value;
  const courseDate = document.getElementById("courseDate").value;

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
});
