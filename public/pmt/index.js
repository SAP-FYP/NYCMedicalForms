document.addEventListener('DOMContentLoaded', function() {
    const approveBtns = Array.from(document.querySelectorAll('.approve-btn'));
    const rejectBtns = Array.from(document.querySelectorAll('.reject-btn'));
    const pillPendings = Array.from(document.querySelectorAll('.pillPending'));
    
    // Loops through approveBtns and adds event listeners
    approveBtns.forEach(function(approveBtn, index) {
      approveBtn.addEventListener('click', function() {
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
    rejectBtns.forEach(function(rejectBtn, index) {
      rejectBtn.addEventListener('click', function() {
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
  
  hamburgerIcon.addEventListener('click', function() {
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
  const form = document.querySelector('form');
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
  