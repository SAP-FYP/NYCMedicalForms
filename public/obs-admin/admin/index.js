window.addEventListener('DOMContentLoaded', () => {

    const createForm = document.querySelector("#create-user-form");
    const roleInput = document.getElementById("role-input");
    const permissionInput = document.getElementById("permission-input");

    // GET ROLES 
    const getRoles = fetch('/obs-admin/roles');

    // GET GROUPS
    const getPermGroups = fetch('/obs-admin/permission/groups/-1');

    Promise.all([getRoles, getPermGroups])
        .then(async function (responses) {
            // handle 404 here?
            // since db throws 404
            // no need to check at allJsonData

            if ((responses[0].status != 200 && responses[0].status != 404) ||
                responses[1].status != 200 && responses[1].status != 404) {
                const error = new Error('Unknown error')
                error.status = 500;
                throw error;
            }

            const userRoles = await responses[0].json();
            const permGroups = await responses[1].json();
            return [userRoles.result, permGroups.result];
        })
        .then((allJsonData) => {
            const userRole = allJsonData[0];
            const permGroups = allJsonData[1];

            // Validate responses
            if (!userRole) {
                // handle no roles
            }

            if (!permGroups) {
                // handle no perms group
            }

            // Handle data
            const roleSelect = createForm.querySelector('#role-input');
            userRole.forEach(item => {
                const option = document.createElement('option');
                option.value = item.roleId;
                option.text = item.roleName;
                roleSelect.appendChild(option);
            });

            const permissionSelect = createForm.querySelector('#permission-input');
            permGroups.forEach(item => {
                const option = document.createElement('option');
                option.value = item.groupId;
                option.text = item.groupName;
                permissionSelect.appendChild(option);
            });
        })
        .catch((error) => {
            console.log(error)
            this.alert(error)
            // display error
        })

    // CREATE USER FUNCTION
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
                const error = new Error("Email already exists");
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

    // FORM SUBMIT
    createForm.onsubmit = (e) => {
        e.preventDefault();
        const email = createForm.querySelector('#email-input').value.trim();
        const permissionGroup = createForm.querySelector('#permission-input').value;
        const name = createForm.querySelector('#name-input').value.trim();
        const password = createForm.querySelector('#password-input').value;
        const contact = createForm.querySelector('#number-input').value.trim();
        const role = createForm.querySelector('#role-input').value;

        if (!email || !permissionGroup || !name || !password || !contact || (permissionGroup == -1 && role != 1) || role == -1) {
            alert("Please fill in all fields");

        } else {
            const newuser = {
                email,
                permissionGroup,
                name,
                password,
                contact,
                role
            };

            createUser(newuser);
        }
    }

    roleInput.onchange = (e) => {
        if (e.target.value == 1) {
            permissionInput.value = -1;
            permissionInput.disabled = true;
        } else {
            permissionInput.disabled = false;
        }
    }
})

