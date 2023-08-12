window.addEventListener("DOMContentLoaded", function () {
  // Retrieve encrypted StudentID from the unique URL
  const loadingOverlay = document.getElementById('loadingOverlay');

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
      localStorage.setItem("encrypted", encrypted);
      callAuthoriseApi();
    })
    .catch((error) => {
      const status = error.response.request.status;
      if (status === 400 || status === 401 || status === 404) {
        setErrMsg('The password you entered is incorrect.', 'visible');
        return;
      }

      if (status === 500) {
        setErrMsg('An error occured logging in.', 'visible');
        return;
      }
    })

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

  //  ==== FOR SINGPASS DEMO ====
  const callAuthoriseApi = () => {
    let authoriseUrl = authApiUrl + "?client_id=" + clientId +
      "&attributes=" + attributes +
      "&purpose=" + purpose +
      "&state=" + encodeURIComponent(state) +
      "&redirect_uri=" + redirectUrl;

    window.location = authoriseUrl;
  }

  // ---START---CALLBACK HANDLER (AUTH CODE)
  if (this.location.href.indexOf("acknowledgement/?code") > -1) {
    loadingOverlay.style.display = 'block';
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);

    let authCode = searchParams.get('code');
    let state = searchParams.get('state');

    fetch('http://localhost:3000/getPersonData', {
      method: 'POST', // post to server side
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        authCode: authCode,
        state: state
      })
    })
      .then((response) => {
        if (response.status != 200) {
          throw new Error('Request failed with status: ' + response.status);
        }
        return response.json();
      })
      .then((result) => {
        console.log(result)
        let user = {
          name: result.name.value,
          email: result.email.value,
          nric: result.uinfin.value,
          contact: result.mobileno.nbr.value
        }

        let storageEncrypted = localStorage.getItem("encrypted");
        window.location.href = `/acknowledgement/form?encrypted=${storageEncrypted}&user=${encodeURIComponent(JSON.stringify(user))}`;
      })
      .catch((error) => {
        alert('ERROR: ' + error.message);
      });
  }
  // ---END---CALLBACK HANDLER

});

// ---START---SETUP VARIABLES---
let authApiUrl; // URL for authorise API
let clientId; // your app_id/client_id provided to you during onboarding
let redirectUrl; // callback url for your application
let purpose; // The purpose of your data retrieval
let state = Math.floor(Math.random() * 100000); // Identifier that represents the user's session with the client (for testing - andomly generated state)
let attributes; // the attributes you are retrieving for your application to fill the form
let environment;
// ---END---SETUP VARIABLES---

window.onload = function (e) {
  const getEnv = fetch('http://localhost:3000/getEnv')
    .then((response) => {
      if (response.status != 200) {
        throw new Error('Failed to fetch ENV')
      }

      return response.json();

    }).then((result) => {
      clientId = result.clientId;
      redirectUrl = result.redirectUrl;
      attributes = result.attributes;
      purpose = result.purpose;
      environment = result.environment;
      authApiUrl = result.authApiUrl;
    }).catch((error) => {
      alert("ERROR:" + JSON.stringify(result.responseJSON.error));
    })
}
