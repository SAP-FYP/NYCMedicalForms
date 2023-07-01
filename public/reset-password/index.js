window.addEventListener('DOMContentLoaded', () => {
    const visibilityNew = document.getElementById('v-new');
    const visibilityConfirm = document.getElementById('v-re');
    const newPassword = document.getElementById('input-password');
    const rePassword = document.getElementById('re-password');
    const form = document.getElementById('reset-form');

    // === FETCHES ===

    // VALIDATE TOKEN
    const checkToken = fetch('/user/updatepassword')
        .then((response) => {
            if (response.redirected) {
                window.location.href = response.url;
                throw new Error('redirected');
            }
        }).catch((error) => {
            if (error && error.message !== 'redirected') {
                if (error.message !== "Failed to fetch") {
                    console.log(error);
                    alert(error);
                }
            }
        })


    // === FUNCTIONS ===

    // UPDATE PASSWORD
    const updateUserPassword = (password) => {
        fetch('/user/updatepassword', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password })
        })
            .then((response) => {
                if (response.redirected) {
                    window.location.href = response.url;
                    throw new Error('redirected');
                }

                if (response.status == 401) {
                    const error = new Error('Invalid email or password')
                    error.status = response.status || 500
                    throw error;
                }

                if (response.status == 400) {
                    const error = new Error('Passwords do not match')
                    error.status = response.status || 500
                    throw error;
                }

                if (response.status != 200) {
                    const error = new Error('Failed to update')
                    error.status = response.status || 500
                    throw error;
                }
            })
            .catch((error) => {
                if (error && error.message !== 'redirected') {
                    if (error.message !== "Failed to fetch") {
                        console.log(error);
                        alert(error);
                    }
                }
            })
    }

    // === EVENT HANDLERS ===

    visibilityNew.onclick = () => {
        togglePassword(newPassword, 'v-new')
    }

    visibilityConfirm.onclick = () => {
        togglePassword(rePassword, 'v-re')
    }

    const togglePassword = (input, icon) => {
        let inputId = input;
        let iconId = document.querySelector(`#${icon} i`);

        if (inputId.getAttribute("type") == "password") {
            inputId.setAttribute("type", "text")
            iconId.textContent = "visibility_off"
        } else {
            inputId.setAttribute("type", "password")
            iconId.textContent = "visibility"
        }
    }

    newPassword.oninput = (e) => {
        const password = e.target.value;
        checkRequirements(document.querySelector('#check-min i'), password.length >= 8)
        checkRequirements(document.querySelector('#check-upper i'), /[A-Z]/.test(password))
        checkRequirements(document.querySelector('#check-lower i'), /[a-z]/.test(password))
        checkRequirements(document.querySelector('#check-number i'), /\d/.test(password))
        checkRequirements(document.querySelector('#check-symbol i'), /[-#!$@£%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(password))
    }

    const checkRequirements = (inputId, checkFn) => {
        if (checkFn) {
            inputId.textContent = "check"
            inputId.style.color = "#00cc11"
        } else {
            inputId.textContent = "close"
            inputId.style.color = "#cc0000"
        }

        const confirmPassword = rePassword.value;
        const password = newPassword.value;

        if (confirmPassword != password) {
            document.getElementById('feedback').style.visibility = 'visible';
        } else {
            document.getElementById('feedback').style.visibility = 'hidden';
        }

    }

    rePassword.oninput = (e) => {
        const confirmPassword = e.target.value;
        const password = newPassword.value;

        if (confirmPassword != password) {
            document.getElementById('feedback').style.visibility = 'visible';
        } else {
            document.getElementById('feedback').style.visibility = 'hidden';
        }
    }

    form.onsubmit = (e) => {
        e.preventDefault();

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-#!$@£%^&*()_+|~=`{}\[\]:";'<>?,.\/]).{8,}$/;
        const password = newPassword.value;
        const confirmPassword = rePassword.value;

        const isValid = (passwordRegex.test(password)) && (password == confirmPassword)
        if (isValid) {
            const pass = {
                newPassword: password,
                confirmPassword: confirmPassword
            }
            updateUserPassword(pass);
        } else {
            alert('Please enter a valid password / Passwords do not match');
        }
    }
})