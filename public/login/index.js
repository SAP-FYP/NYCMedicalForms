window.addEventListener('DOMContentLoaded', function () {

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
                error.code = response.status;
                throw error;
            } else if (response.status !== 200) {
                const error = new Error("Unknown Error");
                error.code = response.status;
                throw error;
            }
            return response.json();

        }).then((jsonData) => {
            console.log(jsonData);
            let user = jsonData.user.nameOfUser;
            let url;

            if (user == "Isaac") {
                url = "/docForm"
            } else if (user == "admin") {
                url = "/pmt"
            }
            this.window.location.href = url;
            // do something with data + token

        }).catch((error) => {
            console.log(error)
            // display error
        })
    }

    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('#login-email').value
        const password = loginForm.querySelector('#login-password').value
        login(email, password)
    };
})