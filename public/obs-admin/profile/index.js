window.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('input-name');
    const numberInput = document.getElementById('input-number');
    const roleInput = document.getElementById('input-role');
    const emailInput = document.getElementById('input-email');
    const passwordInput = document.getElementById('enter-password-input');
    const newInput = document.getElementById('new-input');
    const confirmInput = document.getElementById('confirm-input');
    const currentInput = document.getElementById('current-input');
    const profileImg = document.getElementById('profile-img');
    const imgProfileFile = document.querySelector("#edit-profile-upload");

    const visibilityCurrent = document.getElementById('current-btn');
    const visibilityNew = document.getElementById('new-btn');
    const visibilityConfirm = document.getElementById('confirm-btn');
    const visibilityPassword = document.getElementById('enter-password-btn');
    const submitPassword = document.getElementById('confirm-password-icon');
    const passwordForm = document.getElementById('change-password-form');
    const profileForm = document.getElementById('profile-form');
    const myModalEl = document.getElementById('editPasswordModal');
    const modal = new bootstrap.Modal(myModalEl);
    const myModalEl1 = document.getElementById('enterPasswordModal');
    const enterPasswordModal = new bootstrap.Modal(myModalEl1);
    const alertContainer = document.getElementById('alertbox');

    // === ALERT BOX ===

    const alertBox = (message, type) => {
        const alertIcon = document.getElementById('alert-icon');
        const alertMessage = document.getElementById('alert-message');
        let alertColor;

        if (type === 'danger') {
            alertIcon.setAttribute('xlink:href', '#exclamation-triangle-fill');
            alertColor = 'alert-danger';
        } else if (type === 'success') {
            alertIcon.setAttribute('xlink:href', '#check-circle-fill');
            alertColor = 'alert-success';
        } else if (type === 'warn') {
            alertIcon.setAttribute('xlink:href', '#exclamation-triangle-fill');
            alertColor = 'alert-warning';
        } else if (type === 'info') {
            alertIcon.setAttribute('xlink:href', '#info-fill');
            alertColor = 'alert-primary';
        }

        alertMessage.textContent = message;
        alertContainer.classList.add(alertColor)
        alertContainer.classList.add('alert-visible');
        alertContainer.classList.remove('alert-hidden');

        setTimeout(() => {
            alertContainer.classList.add('alert-hidden');
            alertContainer.classList.remove('alert-visible');
            alertContainer.classList.remove(alertColor);
        }, 5000);
    };

    // === ERROR AND RESPONSE HANDLING ===

    // 400 , !200
    const handleUpdateResponse = (response) => {
        if (response.redirected) {
            window.location.href = response.url;
            throw new Error('redirected');
        }

        if (response.status == 401) {
            const error = new Error('Invalid email or password.')
            error.status = response.status || 500
            throw error;
        }

        if (response.status == 400) {
            const error = new Error('Passwords do not match. PLease try again.')
            error.status = response.status || 500
            throw error;
        }

        if (response.status != 200) {
            const error = new Error('Failed to perform update.')
            error.status = response.status || 500
            throw error;
        }

        return;
    }

    // TODO: Proper Error
    const handleError = (error) => {
        if (error && error.message !== 'redirected') {
            if (error.message !== "Failed to fetch") {
                alertBox(error.message, 'danger');
            }
        }
    }

    // === FETCHES ===

    // GET USER DATA - AUTHORIZATION
    const getUser = fetch('/user')
        .then((response) => {
            if (response.redirected) {
                window.location.href = response.url;
                throw new Error('redirected');
            }

            if (response.status !== 200 && response.status !== 404) {
                const error = new Error('An unknown error occured.');
                error.status = 500;
                throw error;
            }

            return response.json();
        })
        .then((jsonData) => {
            const { user } = jsonData;
            if (!user) {
                alertBox('Failed to fetch profile data.', 'danger');
            } else {
                nameInput.value = user.name;
                numberInput.value = user.contact;
                roleInput.value = user.roleName;
                emailInput.value = user.email;

                if (user.picUrl) {
                    profileImg.src = user.picUrl
                    picUrl = user.picUrl
                }

                if (user.role == 1) {
                    document.getElementById('permission-li').style.opacity = '1';
                    document.getElementById('user-li').style.opacity = '1';
                    document.getElementById('form-li').style.opacity = '0.5';
                    document.getElementById('user-li').onclick = () => {
                        window.location.href = '/obs-admin/admin/permissions';
                    }
                    document.getElementById('user-li').onclick = () => {
                        window.location.href = '/obs-admin/admin';
                    }
                    document.getElementById('form-li').onclick = (e) => {
                        e.preventDefault();
                    }
                } else {
                    document.getElementById('form-li').style.opacity = '1'
                    document.getElementById('permission-li').style.opacity = '0.5';
                    document.getElementById('user-li').style.opacity = '0.5';
                    document.getElementById('permission-li').onclick = (e) => {
                        e.preventDefault();
                    }
                    document.getElementById('user-li').onclick = (e) => {
                        e.preventDefault();
                    }
                    document.getElementById('form-li').onclick = () => {
                        window.location.href = '/obs-admin/obs-management';

                    }
                }
            }
        })
        .catch(handleError)

    // UPDATE PASSWORD
    const updateUserPassword = (password) => {
        fetch('/user/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password })
        })
            .then(handleUpdateResponse)
            .then(() => {
                passwordForm.reset();
                modal.hide();
                alertBox('Password updated successfully.', 'success');

                const checkItems = ['#check-min', '#check-upper', '#check-lower', '#check-number', '#check-symbol'];
                checkItems.forEach(item => {
                    document.querySelector(`${item} i`).textContent = "close";
                    document.querySelector(`${item} i`).style.color = "#cc0000";
                });
            })
            .catch(handleError)
    }

    // UPDATE PROFILE
    const updateUser = (webFormData) => {
        fetch('/user/profile', {
            method: 'PUT',
            body: webFormData
        })
            .then(handleUpdateResponse)
            .then(() => {
                imgProfileFile.value = "";
                passwordInput.value = "";
                alertBox('Successfully updated profile.', 'success');
                enterPasswordModal.hide();
            })
            .catch(handleError);
    }

    // === EVENT HANDLERS ===

    document.getElementById('enter-password-form').onsubmit = (e) => {
        e.preventDefault();
        const valid = validateForm();

        if (valid) {
            const password = passwordInput.value;

            if (!password) {
                passwordInput.classList.add('is-invalid');
            } else {
                const webFormData = new FormData();

                webFormData.append('name', nameInput.value.trim());
                webFormData.append('number', numberInput.value.trim());
                webFormData.append('password[currentPassword]', password);

                if (imgProfileFile.files[0]) {
                    webFormData.append("img", imgProfileFile.files[0]);
                }
                updateUser(webFormData);
            }
        } else {
            alertBox('Please fill in all fields', 'danger');
        }
    }

    // UPDATE PROFILE SUBMIT
    profileForm.onsubmit = (e) => {
        e.preventDefault();
        const valid = validateForm();

        if (valid) { enterPasswordModal.show(); }
    }

    // VALIDATE UPDATE PROFILE FORM
    const validateForm = () => {
        const name = nameInput.value.trim();
        const contact = numberInput.value.trim();
        const phoneNumberPattern = /^(\+?65)?[689]\d{7}$/;
        let valid = true;

        if (!name) {
            nameInput.classList.add('is-invalid');
            valid = false;
        }

        if (!phoneNumberPattern.test(contact)) {
            numberInput.classList.add('is-invalid');
            valid = false;
        }

        return valid;
    }

    // VALIDATOR FOR NAME / NUMBER / PASSWORD
    const validateInput = (inputElement, validationFn) => {
        const isValid = validationFn(inputElement.value);
        isValid ? inputElement.classList.remove('is-invalid') : inputElement.classList.add('is-invalid');
    }

    // ON NAME CHANGE
    nameInput.oninput = (e) => {
        validateInput(e.target, (value) => value);
    }

    // ON NUMBER CHANGE
    numberInput.oninput = (e) => {
        const phoneNumberPattern = /^(\+?65)?[689]\d{7}$/;
        validateInput(e.target, (value) => phoneNumberPattern.test(value));
    }

    // ON PASSWORD CHANGE
    passwordInput.oninput = (e) => {
        validateInput(e.target, (value) => value);
    }

    // ON NEW PASSWORD CHANGE
    newInput.oninput = (e) => {
        const password = e.target.value;
        checkRequirements(document.querySelector('#check-min i'), password.length >= 8)
        checkRequirements(document.querySelector('#check-upper i'), /[A-Z]/.test(password))
        checkRequirements(document.querySelector('#check-lower i'), /[a-z]/.test(password))
        checkRequirements(document.querySelector('#check-number i'), /\d/.test(password))
        checkRequirements(document.querySelector('#check-symbol i'), /[-#!$@£%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(password))
    }

    // VALIDATOR FOR NEW PASSWORD
    const checkRequirements = (inputId, checkFn) => {
        if (checkFn) {
            inputId.textContent = "check"
            inputId.style.color = "#00cc11"
        } else {
            inputId.textContent = "close"
            inputId.style.color = "#cc0000"
        }

        const confirmPassword = confirmInput.value;
        const password = newInput.value;

        if (confirmPassword != password) {
            confirmInput.classList.add('is-invalid');
        } else {
            confirmInput.classList.remove('is-invalid');
        }

    }

    // ON CURRENT PASSWORD CHANGE
    currentInput.oninput = (e) => {
        validateInput(e.target, (value) => value);
    }

    // ON CONFIRM PASSWORD CHANGE
    confirmInput.oninput = (e) => {
        const newPassword = newInput.value;
        validateInput(e.target, (value) => value == newPassword);
    }

    // UPDATE PASSWORD SUBMIT
    submitPassword.onclick = (e) => {
        e.preventDefault();

        const pass = {
            currentPassword: document.getElementById('current-input').value,
            newPassword: document.getElementById('new-input').value,
            confirmPassword: document.getElementById('confirm-input').value,
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-#!$@£%^&*()_+|~=`{}\[\]:";'<>?,.\/]).{8,}$/;
        const isValid = (passwordRegex.test(pass.newPassword)) && (pass.newPassword == pass.confirmPassword)

        if (isValid) {
            updateUserPassword(pass);
        } else {
            alertBox('Password not valid or does not match.', 'danger');
        }
    }

    // ON PROFILE IMAGE CHANGE
    imgProfileFile.onchange = (e) => {
        let file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
            alertBox('Please select an image file.', 'danger')
        } else {
            profileImg.src = window.URL.createObjectURL(file)
        }
    }

    // TOGGLE PASSWORD VISIBILITY
    const togglePassword = (input, icon) => {
        let inputId = document.getElementById(input);
        let iconId = document.querySelector(`#${icon} i`);

        if (inputId.getAttribute("type") == "password") {
            inputId.setAttribute("type", "text")
            iconId.textContent = "visibility_off"
        } else {
            inputId.setAttribute("type", "password")
            iconId.textContent = "visibility"
        }
    }

    // VISIBILITY BUTTON - CURRENT PASSWORD
    visibilityCurrent.onclick = (e) => {
        e.preventDefault();
        togglePassword('current-input', 'current-btn')
    }

    // VISIBILITY BUTTON - NEW PASSWORD
    visibilityNew.onclick = (e) => {
        e.preventDefault();
        togglePassword('new-input', 'new-btn')
    }

    // VISIBILITY BUTTON - CONFIRM PASSWORD
    visibilityConfirm.onclick = (e) => {
        e.preventDefault();
        togglePassword('confirm-input', 'confirm-btn')
    }

    // VISIBILITY BUTTON - ENTER PASSWORD
    visibilityPassword.onclick = (e) => {
        e.preventDefault();
        togglePassword('enter-password-input', 'confirm-btn')
    }

    // INITIALIZE BOOTSTRAP TOOLTIP
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, { trigger: 'hover' });
    });

})

