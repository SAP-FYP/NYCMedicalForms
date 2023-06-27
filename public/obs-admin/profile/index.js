window.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('input-name');
    const numberInput = document.getElementById('input-number');
    const roleInput = document.getElementById('input-role');
    const emailInput = document.getElementById('input-email');
    const profileImg = document.getElementById('profile-img');
    const imgProfileFile = document.querySelector("#edit-profile-upload");

    const visibilityCurrent = document.getElementById('current-btn');
    const visibilityNew = document.getElementById('new-btn');
    const visibilityConfirm = document.getElementById('confirm-btn');
    const submitPassword = document.getElementById('confirm-password-icon');
    const passwordForm = document.getElementById('change-password-form');
    const profileForm = document.getElementById('profile-form');
    const myModalEl = document.getElementById('editPasswordModal');
    const modal = new bootstrap.Modal(myModalEl);


    // === ERROR AND RESPONSE HANDLING ===

    // 400 , !200
    const handleUpdateResponse = (response) => {
        if (response.redirected) {
            window.location.href = response.url;
            throw new Error('redirected');
        }

        if (response.status == 401) {
            const error = new Error('Invalid email or password')
            error.status = response.status || 500
            throw error;
        }

        if (response.status != 200) {
            const error = new Error('Failed to update')
            error.status = response.status || 500
            throw error;
        }

        return;
    }

    // TODO: Proper Error
    const handleError = (error) => {
        if (error && error.message !== 'redirected') {
            if (error !== "TypeError: Failed to fetch") {
                console.log(error);
                alert(error);
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
                const error = new Error('Unknown error');
                error.status = 500;
                throw error;
            }

            return response.json();
        })
        .then((jsonData) => {
            const { user } = jsonData;
            if (!user) {
                alert('Failed to fetch profile data');
                // do error
            } else {
                nameInput.value = user.name;
                numberInput.value = user.contact;
                roleInput.value = user.roleName;
                emailInput.value = user.email;

                if (user.picUrl) {
                    profileImg.src = user.picUrl
                    picUrl = user.picUrl
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
                alert('Successfully changed password!')
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
                profileForm.reset();
                alert('Successfully updated profile!')
                location.reload();
            })
            .catch(handleError)
    }

    // === EVENT HANDLERS ===

    profileForm.onsubmit = (e) => {
        e.preventDefault();

        if (!document.getElementById('input-password').value) {
            alert('Please enter password to continue');

        } else {
            const password = document.getElementById('input-password').value;

            const webFormData = new FormData();

            if (!nameInput.value.trim() || !numberInput.value.trim()) {
                alert('Please fill in all fields');

            } else {
                webFormData.append('name', nameInput.value.trim());
                webFormData.append('number', numberInput.value.trim());
                webFormData.append('password[currentPassword]', password);

                if (imgProfileFile.files[0]) {
                    webFormData.append("img", imgProfileFile.files[0]);
                }

                updateUser(webFormData);
            }
        }
    }

    submitPassword.onclick = (e) => {
        e.preventDefault();
        const pass = {
            currentPassword: document.getElementById('current-input').value.trim(),
            newPassword: document.getElementById('new-input').value.trim(),
            confirmPassword: document.getElementById('confirm-input').value.trim(),
        }

        if (!pass.currentPassword || !pass.newPassword || !pass.confirmPassword) {
            alert('Please fill in all fields');
        } else if (pass.newPassword != pass.confirmPassword) {
            alert('Passwords do not match');
        } else {
            updateUserPassword(pass);
        }
    }

    imgProfileFile.onchange = (e) => {
        let file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.')
        } else {
            profileImg.src = window.URL.createObjectURL(file)
        }
    }

    visibilityCurrent.onclick = (e) => {
        e.preventDefault();
        togglePassword('current-input', 'current-btn')
    }

    visibilityNew.onclick = (e) => {
        e.preventDefault();
        togglePassword('new-input', 'new-btn')
    }

    visibilityConfirm.onclick = (e) => {
        e.preventDefault();
        togglePassword('confirm-input', 'confirm-btn')
    }

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

})

