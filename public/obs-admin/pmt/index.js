API_URL = `http://localhost:3000/api/pmt`;
document.addEventListener('DOMContentLoaded', function () {
  axios.get(`${API_URL}/all`)
    .then(function (response) {
      const formData = response.data;
      const formCounts = formData.reduce((counts, form) => {
        if (form.formStatus === "Pending") {
          counts.pending++;
        } else if (form.formStatus === "Approve") {
          counts.approved++;
        } else if (form.formStatus === "Rejected") {
          counts.rejected++;
        }
        return counts;
      }, { pending: 0, approved: 0, rejected: 0 });
      console.log(formCounts);
      console.log(formCounts.pending)
      const rectanglePending = document.createElement('div');
      rectanglePending.classList.add('d-flex', 'flex-wrap', 'align-items-center', 'justify-content-center', 'rectanglePending');
      rectanglePending.innerHTML = `
      <div>
          <h2 class="text-center m-auto p-0">Pending</h2>
          <h1 class="text-center m-auto p-0">${formCounts.pending}</h1>
      </div>
  `;

      const rectangleApproved = document.createElement('div');
      rectangleApproved.classList.add('d-flex', 'flex-wrap', 'align-items-center', 'justify-content-center', 'rectangleApproved');
      rectangleApproved.innerHTML = `
      <div>
          <h2 class="text-center m-auto p-0">Approved</h2>
          <h1 class="text-center m-auto p-0">${formCounts.approved}</h1>
      </div>
  `;

      const rectangleRejected = document.createElement('div');
      rectangleRejected.classList.add('d-flex', 'flex-wrap', 'align-items-center', 'justify-content-center', 'rectangleRejected');
      rectangleRejected.innerHTML = `
      <div>
          <h2 class="text-center m-auto p-0">Rejected</h2>
          <h1 class="text-center m-auto p-0">${formCounts.rejected}</h1>
      </div>
  `;
      // Append the elements to the document or specific container
      const statusContainer = document.querySelector('.statusContainer');
      statusContainer.appendChild(rectanglePending);
      statusContainer.appendChild(rectangleApproved);
      statusContainer.appendChild(rectangleRejected);


      console.log(formData)
      const allFormsContainer = document.querySelector('#getAllForms');

      for (i = 0; i < formData.length; i++) {

        const dateObj = new Date(formData[i].courseDate);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        const tr = document.createElement("tr");
        tr.setAttribute("data-bs-toggle", "modal");
        tr.setAttribute("data-bs-target", `#staticBackdrop${i + 1}`);

        const checkboxCell = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("id", "checkBox");
        checkboxCell.appendChild(checkbox);

        const studentNRICCell = document.createElement("td");
        studentNRICCell.textContent = `***${formData[i].studentNRIC}`;

        const nameOfStudentCell = document.createElement("td");
        nameOfStudentCell.textContent = formData[i].nameOfStudent;

        const classCell = document.createElement("td");
        classCell.textContent = formData[i].class;

        const schoolCell = document.createElement("td");
        schoolCell.textContent = formData[i].school;

        const eligibilityCell = document.createElement("td");
        eligibilityCell.textContent = formData[i].eligibility;

        const formattedDateCell = document.createElement("td");
        formattedDateCell.textContent = formattedDate;

        const pillDivCell = document.createElement("td");
        pillDivCell.classList.add("pillDiv");

        const formStatusDiv = document.createElement("div");
        formStatusDiv.textContent = formData[i].formStatus;

        if (formData[i].formStatus === "Pending") {
          formStatusDiv.classList.add("pillPending");
        } else if (formData[i].formStatus === "Rejected") {
          formStatusDiv.classList.add("pillRejected");
        } else if (formData[i].formStatus === "Approved") {
          formStatusDiv.classList.add("pillApproved");
        }

        pillDivCell.appendChild(formStatusDiv);

        const tripleDotCell = document.createElement("td");
        const dotSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        dotSVG.setAttribute("class", "tripleDot");
        dotSVG.setAttribute("viewBox", "0 0 30.24 8.29");
        dotSVG.innerHTML = `<g>
        <ellipse class="tripleDot" cx="4.36" cy="4.15" rx="4.36" ry="4.15" />
        <ellipse class="tripleDot" cx="15.12" cy="4.15" rx="4.36" ry="4.15" />
        <ellipse class="tripleDot" cx="25.88" cy="4.15" rx="4.36" ry="4.15" />
        </g>`
        tripleDotCell.appendChild(dotSVG);
        tr.appendChild(checkboxCell);
        tr.appendChild(studentNRICCell);
        tr.appendChild(nameOfStudentCell);
        tr.appendChild(classCell);
        tr.appendChild(schoolCell);
        tr.appendChild(eligibilityCell);
        tr.appendChild(formattedDateCell);
        tr.appendChild(pillDivCell);
        tr.appendChild(tripleDotCell);

        allFormsContainer.appendChild(tr);
      }




    })

    .catch(function (error) {
      console.log(error);
    });


  const approveBtns = Array.from(document.querySelectorAll('.approve-btn'));
  const rejectBtns = Array.from(document.querySelectorAll('.reject-btn'));
  const pillPendings = Array.from(document.querySelectorAll('.pillPending'));

  // Loops through approveBtns and adds event listeners
  approveBtns.forEach(function (approveBtn, index) {
    approveBtn.addEventListener('click', function () {
      const pillPending = pillPendings[index];
      pillPending.textContent = 'Approved';
      pillPending.classList.remove('pillPending');
      pillPending.classList.add('pillApproved');

      const modalSize = document.querySelector('.modal-lg');
      modalSize.classList.remove('modal-lg');
      const modalDialog = document.querySelector('.modal-dialog');
      modalDialog.classList.add('modal-dialog-centered');

      const modalBody = this.closest('.modal').querySelector('.modal-content');
      modalBody.innerHTML = `<div class="modal-body text-center">
        <h3 class=" text-center">Form is approved!</h3>
        <h5>The Form has been approved.</h5>
        <img src="../assets/Approved.png" alt="logo" class=" h-auto" id="errorIcon">
    
    <div class="d-flex justify-content-center align-items-center pt-2">
        <button type="button" class="btn btn-primary successBtn" data-bs-dismiss="modal">Confirm</button>
    </div>`;
    });
  });

  // Loops through rejectBtns and adds event listeners
  rejectBtns.forEach(function (rejectBtn, index) {
    rejectBtn.addEventListener('click', function () {
      const pillPending = pillPendings[index];
      pillPending.textContent = 'Rejected';
      pillPending.classList.remove('pillPending');
      pillPending.classList.add('pillRejected');

      const modalSize = document.querySelector('.modal-lg');
      modalSize.classList.remove('modal-lg');
      const modalDialog = document.querySelector('.modal-dialog');
      modalDialog.classList.add('modal-dialog-centered');

      const modalBody = this.closest('.modal').querySelector('.modal-content');
      modalBody.innerHTML = `<div class="modal-body text-center">
        <h3 class=" text-center">Form is rejected!</h3>
        <h5>The Form has been rejected.</h5>
        <img src="../assets/Rejected.png" alt="logo" class=" h-auto" id="errorIcon">
    
    <div class="d-flex justify-content-center align-items-center pt-2">
        <button type="button" class="btn btn-primary successBtn" data-bs-dismiss="modal">Confirm</button>
    </div>`;

    });
  });
});






const sideMenuBar = document.querySelector('.sideMenuBar');
const hamburgerIcon = document.querySelector('.openMenu');
const svgElement = document.querySelector('#openMenuContainer');
const navIconTextElements = document.querySelectorAll('.navIconText');
const bgOverlay = document.querySelector('.bgOverlay');
const signOutText = document.querySelector('.signOutText');
const anchorTag = document.querySelector('a');

const texts = ['Permission Groups', 'Users', 'Forms'];

hamburgerIcon.addEventListener('click', function () {
  sideMenuBar.classList.toggle('expanded');

  if (sideMenuBar.classList.contains('expanded')) {


    svgElement.style.transform = "rotate(180deg)";
    navIconTextElements.forEach((element, index) => {
      element.textContent = texts[index];
      element.style.display = "flex";
      element.style.paddingTop = "30px";
      element.style.paddingLeft = "20px";

    });
    signOutText.textContent = 'Sign Out';
    signOutText.style.color = 'black';
    signOutText.style.paddingLeft = "10px";
    anchorTag.style.textDecoration = 'none';

  } else {

    svgElement.style.transform = "rotate(0deg)";
    sideMenuBar.classList.remove('expanded');
    svgElement.style.transform = "rotate(0deg)";
    navIconTextElements.forEach((element) => {
      element.textContent = '';
      element.style.display = "";
      element.style.paddingTop = "";
      element.style.paddingLeft = "";

    })
    signOutText.textContent = '';
    signOutText.style.color = '';
    signOutText.style.paddingLeft = "";
  }
});



const exportBtn = document.querySelector("#exportBtn");
form.addEventListener('submit', (e) => {
  e.preventDefault(); // prevent the default form submission behavior

  const applicantName = document.getElementById("applicantName").value;
  const schoolOrg = document.getElementById("schoolOrg").value;
  const classNo = document.getElementById("designation").value;
  const courseDate = document.getElementById("courseDate").value;

  // create a new workbook
  const workbook = XLSX.utils.book_new();

  // create a new worksheet with the form data
  const worksheet = XLSX.utils.json_to_sheet([
    { "Name of Applicant": applicantName, "Organization/School": schoolOrg, "Designation/Class": classNo, "Course Date": courseDate }
  ],
    { header: ["Name of Applicant", "Organization/School", "Designation/Class", "Course Date"] }
  );

  // add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Student Data");

  // save the workbook as an Excel file
  XLSX.writeFile(workbook, "StudentForm.xlsx");
});
