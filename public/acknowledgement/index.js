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

  // Axios post request to /parent/login
  let login = (password) => axios
  .post("/parent/login", {
    encrypted: encrypted,
    password: password,
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
    const status = error.response.request.status;
    if (status === 400 || status === 401 || status === 404) {
      setErrMsg('The password you entered is incorrect.', 'visible');
      return;
    }

    if (status === 403) {
      setErrMsg('Account is disabled. Please contact admin for more information.', 'visible');
      return;
    }

    if (status === 500) {
      setErrMsg('An error occured logging in.', 'visible');
      return;
    }
  })
  .finally(() => {
    document.querySelectorAll('.spinner-item').forEach(i => {
      i.style.display = 'none';
    });
    document.getElementById('login-text').style.display = 'none';
    document.getElementById('login-button').style.backgroundColor = '#4d4d4d';
  });
  
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


  const loginBtn = document.getElementById("login-button");

  // Add event listener to login button
  loginBtn.addEventListener("click", function (e) {
    const password = document.getElementById("login-password").value;
    // Prevent default form submission
    e.preventDefault();

    if (!encrypted || encrypted.length !== 32) {
      setErrMsg('You have an invalid URL.', 'visible');
      return;
    }

    // Check if password is empty
    if (!password) {
      setErrMsg('Please fill in all fields.', 'visible');
      return;
    }
    
    login(password);
  });
});
