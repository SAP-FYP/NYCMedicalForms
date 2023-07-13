window.addEventListener("DOMContentLoaded", function () {
  // Retrieve encrypted StudentID from the unique URL
  const urlParams = new URLSearchParams(window.location.search);
  const baseURL = window.location.origin;
  const encrypted = urlParams.get("encrypted");
  const errMsg = document.getElementById('err-message');
  const errMsgContainer = document.getElementById('err-message-container');

  const setErrMsg = (message, toggle) => {
    errMsg.innerHTML = `<i class="material-symbols-outlined">error</i>${message}`;
    errMsgContainer.style.visibility = toggle;
  }

  // Validation for URL
  axios.post('/parent/login-verify', {
    encrypted: encrypted
  }).then((response) => {
    const acknowledged = response.data.statusOfAcknowledgement;
    if (acknowledged === undefined) {
      throw new Error('You have an invalid URL.');
    }
  }).catch((error) => {
    setErrMsg('You have an invalid URL.', 'visible');
    // Disable login & password button
    document.getElementById("login-button").disabled = true;
    document.getElementById("login-button").style.backgroundColor = "#9e9e9e";
    document.getElementById("login-password").disabled = true;
  });


  const password = document.getElementById("login-password");
  const loginBtn = document.getElementById("login-button");

  // Add event listener to login button
  loginBtn.addEventListener("click", function (e) {
    // Prevent default form submission
    e.preventDefault();

    if (!encrypted || encrypted.length !== 32) {
      setErrMsg('You have an invalid URL.', 'visible');
      return;
    }

    // Check if password is empty
    if (!password.value) {
      setErrMsg('Please fill in all fields.', 'visible');
      return;
    }


    // Axios post request to /parent/login
    axios
      .post("/parent/login", {
        encrypted: encrypted,
        password: password.value,
      })
      // If successful, redirect to acknowledgement page
      .then((response) => {
        const configURL = baseURL + response.config.url;
        const requestURL = response.request.responseURL;
        if (configURL !== requestURL) {
          window.location.href = requestURL;
          throw new Error("redirected");
        }
        window.location.href = "/acknowledgement/form?encrypted=" + encrypted;
      })
      .catch((error) => {
          setErrMsg('The password you entered is incorrect.', 'visible');
      });
  });
});
