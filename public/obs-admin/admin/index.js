window.addEventListener('DOMContentLoaded', () => {

    const createForm = this.document.querySelector("#create-user-form");

    // GET GROUPS
    const getPermGroups = () => {
        return fetch('/obs-admin/permission/groups')
            .then((response) => {
                if (response.status == 404) {
                    const error = new Error('No permission groups found')
                    error.code = response.status;
                    throw error;
                } else if (response.status != 200) {
                    const error = new Error('Unknown error')
                    error.code = response.status;
                    throw error;
                }
                return response.json();

            }).then((jsonData) => {
                const select = createForm.querySelector('#permission-input');
                jsonData.result.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.groupId;
                    option.text = item.groupName;
                    select.appendChild(option);
                });

            }).catch((error) => {
                console.log(error)
                this.alert(error)
                // display error
            })
    }
    getPermGroups();
    // CREATE USER
    const createUser = (newuser) => {
        return fetch('/obs-admin/newuser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newuser)

        }).then((response) => {
            if (response.status == 400) {
                const error = new Error("Invalid user data");
                error.status = response.status
                throw error;

            } else if (response.status == 422) {
                const error = new Error("Email or contact already exists");
                error.status = response.status
                throw error;

            } else if (response.status != 201) {
                const error = new Error("Unknown error");
                error.status = response.status
                throw error;
            }

            this.alert("Successfully created")
            // do success

        }).catch((error) => {
            console.log(error)
            this.alert(error)
            // display error
        })
    }

    createForm.onsubmit = (e) => {
        e.preventDefault();
        const email = createForm.querySelector('#email-input').value.trim();
        const permissionGroup = createForm.querySelector('#permission-input').value;
        const name = createForm.querySelector('#name-input').value.trim();
        const password = createForm.querySelector('#password-input').value;
        const contact = createForm.querySelector('#number-input').value.trim();

        if (!email || !permissionGroup || !name || !password || !contact || permissionGroup == 0) {
            this.alert("Please fill in all fields");

        } else {
            const newuser = {
                email,
                permissionGroup,
                name,
                password,
                contact
            };

            createUser(newuser);
        }
    }
})

