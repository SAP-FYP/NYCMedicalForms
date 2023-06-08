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
                error.code = response.status;
                throw error;

            } else if (response.status !== 200) {
                const error = new Error("Unknown Error");
                error.code = response.status;
                throw error;
            }
            return response.json();

        }).then((jsonData) => {
            console.log(jsonData)
            // role check
            // redirect to superadmin/pmt/mst form

        }).catch((error) => {
            console.log(error)
            this.alert(error)
            // display error
        })
    }

    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('#login-email').value.trim();
        const password = loginForm.querySelector('#login-password').value;

        if (!email || !password) {
            this.alert("Please fill in empty fields")
        } else {
            login(email, password)
        }
    };
})