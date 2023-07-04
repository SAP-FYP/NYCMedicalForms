window.addEventListener("DOMContentLoaded", function () {
  // Retrieve encrypted StudentID from the unique URL
  const urlParams = new URLSearchParams(window.location.search);
  const encrypted = urlParams.get("encrypted");
  
  // Get password from field
  const password = document.getElementById("login-password");

  // Get login button
  const loginBtn = document.getElementById("login-button");

  // Add event listener to login button
  loginBtn.addEventListener("click", function (e) {
    // Prevent default form submission
    e.preventDefault();
    // Axios post request to /parent/login
    axios
      .post("/parent/login", {
        encrypted: encrypted,
        password: password.value,
      })
      // If successful, redirect to acknowledgement page
      .then((response) => {
        console.log(response);
        // Set local storage
        localStorage.setItem("key", JSON.stringify(password.value));
        window.location.href = "/acknowledgement/form?encrypted=" + encrypted;
        // TODO ERROR HANDLING

      })
      .catch((error) => {
        console.log(error);
        alert("Invalid URL or password");
      });
  });
});
