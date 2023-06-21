window.addEventListener('DOMContentLoaded', () => {

    const loginForm = this.document.querySelector("#login-form");

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
            if (response.status === 400 || response.status === 401) {
                const error = new Error("Invalid email or password");
                error.status = response.status;
                throw error;
            }

            if (response.redirected) {
                window.location.href = response.url
                throw new Error('redirected');

            } else {
                const error = new Error("Unknown Error");
                error.status = response.status;
                throw error;
            }

        }).catch((error) => {
            if (error && error.message != 'redirected') {
                console.log(error);
                alert(error);
            }
        })
    }

    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('#login-email').value.trim();
        const password = loginForm.querySelector('#login-password').value;

        if (!email || !password) {
            alert("Please fill in empty fields")
        } else {
            login(email, password)
        }
    };
})