window.addEventListener('DOMContentLoaded', () => {

    const myinfoBtn = document.getElementById('myinfo-btn');
    const submitBtn = document.getElementById('submit-btn');

    // ---START---SETUP VARIABLES---
    let scrollToAppForm = false;
    let authApiUrl; // URL for authorise API
    let clientId; // your app_id/client_id provided to you during onboarding
    let redirectUrl; // callback url for your application
    let purpose; // The purpose of your data retrieval
    let state = Math.floor(Math.random() * 100000); // Identifier that represents the user's session with the client (for testing - andomly generated state)
    let attributes; // the attributes you are retrieving for your application to fill the form
    let securityEnable; // the auth level, determines the flow
    // ---END---SETUP VARIABLES---


    // ---START---WINDOW ONLOAD---
    window.onload = function (e) {
        const getEnv = fetch('http://localhost:3001/getEnv')
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

                console.log(redirectUrl)
                console.log(authApiUrl)
            }).catch((error) => {
                alert("ERROR:" + JSON.stringify(result.responseJSON.error));

            })
    }
    // ---END---WINDOW ONLOAD---


    // ---START---MAIN HANDLER---
    myinfoBtn.onclick = (e) => {
        e.preventDefault();
        callAuthoriseApi();
    }

    submitBtn.onclick = (e) => {
        e.preventDefault();
        // add code here to submit the application form back to server for processing
        //$('#complete').toggleClass('hidden');
    }
    // ---END---MAIN HANDLER---


    // ---START---AUTH API---
    const callAuthoriseApi = () => {
        let authoriseUrl = authApiUrl + "?client_id=" + clientId +
            "&attributes=" + attributes +
            "&purpose=" + purpose +
            "&state=" + encodeURIComponent(state) +
            "&redirect_uri=" + redirectUrl;

        window.location = authoriseUrl;
    }
    // ---END---AUTH API---


    // ---START---CALL SERVER API - calling server side APIs (token & person) to get the person data for prefilling form
    const callServerAPIs = () => {
        // let authCode = $.url(this.location.href).param('code');
        // let state = $.url(this.location.href).param('state');
        console.log('doing')
        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams(url.search);

        let authCode = searchParams.get('code');
        let state = searchParams.get('state');

        // console.log("Auth Code:",authCode);
        // console.log("State:",state);

        // invoke AJAX call from frontend client side to your backend server side
        fetch('http://localhost:3001/getPersonData', {
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
                // console.log("response",response);
                return response.json();
            })
            .then((result) => {
                console.log(result);
                //prefillForm(result);
            })
            .catch((error) => {
                alert('ERROR: ' + error.message);
            });
    }
    // ---END---CALL SERVER API - calling server side APIs (token & person) to get the person data for prefilling form


    // ---START---CALLBACK HANDLER (AUTH CODE)
    if (this.location.href.indexOf("callback?code") > -1) {
        callServerAPIs(); // call the backend server APIs
    } else if (this.location.href.indexOf("callback") > -1) {
        alert("ERROR:" + JSON.stringify("Missing Auth Code"));
    }
    // ---END---CALLBACK HANDLER
})