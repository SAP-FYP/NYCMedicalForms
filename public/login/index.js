window.addEventListener('DOMContentLoaded', () => {

    const loginForm = this.document.querySelector("#login-form");
    const errMsg = document.getElementById('err-message');
    const errMsgContainer = document.getElementById('err-message-container');

    const login = (email, password) => {

        return fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            })

        }).then((response) => {

            if (response.status === 400 || response.status === 401 || response.status === 404) {
                const error = new Error("The email or password you entered is incorrect.");
                error.status = response.status;
                throw error;
            }

            if (response.status === 403) {
                const error = new Error("Account is disabled. Please contact admin for more information.");
                error.status = response.status;
                throw error;
            }

            if (response.redirected) {
                window.location.href = response.url
                throw new Error('redirected');

            } else {
                const error = new Error("An error occured logging in.");
                error.status = response.status;
                throw error;
            }

        }).catch((error) => {
            if (error && error.message != 'redirected') {
                setErrMsg(error.message, 'visible');
            }
        })
    }

    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('#login-email').value.trim();
        const password = loginForm.querySelector('#login-password').value;

        if (!email || !password) {
            setErrMsg('Please fill in all fields.', 'visible');
        } else {
            login(email, password)
        }
    };

    const setErrMsg = (message, toggle) => {
        errMsg.innerHTML = `<i class="material-symbols-outlined">error</i>${message}`;
        errMsgContainer.style.visibility = toggle;
    }
})