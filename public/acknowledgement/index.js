window.addEventListener("DOMContentLoaded", function () {
  // Retrieve encrypted StudentID from the unique URL
  const urlParams = new URLSearchParams(window.location.search);
  const encrypted = urlParams.get("encrypted");
  console.log(encrypted);
  // ! BUG, DATE IS SET ONE DAY BEFORE. NEED TO FIX
  // Get password from field
  const password = document.getElementById("login-password");

  // Get login button
  const loginBtn = document.getElementById("login-button");

  // TODO Add error message
  // Get error message
  // ! const errorMessage = document.getElementById('error-message');

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
        localStorage.setItem("user", JSON.stringify(response.data.user));
        window.location.href = "/acknowledgement/form?encrypted=" + encrypted;
        // TODO Add error message
        // If unsuccessful, display error message
      })
      .catch((error) => {
        console.log(error);
        // ! errorMessage.innerHTML = error.response.data.error;
      });
  });
});
