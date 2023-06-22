window.addEventListener('DOMContentLoaded', () => {

    const createForm = document.querySelector("#create-user-form");
    const roleInput = document.getElementById("role-input");
    const permissionInput = document.getElementById("permission-input");

    // === FETCHES ===

    // GET ROLES 
    const getRoles = fetch('/obs-admin/roles');

    // GET GROUPS
    const getPermGroups = fetch('/obs-admin/permission/groups/-1');

    // GET ALL USERS
    const getUsers = fetch('/obs-admin/users');

    Promise.all([getRoles, getPermGroups, getUsers])
        .then(async function (responses) {

            if (responses.some(response => response.redirected)) {
                window.location.href = responses[0].url;
                throw new Error('redirected');
            }

            if (responses.some(response => response.status != 200 && response.status != 404)) {
                const error = new Error('Unknown error')
                error.status = 500;
                throw error;
            }

            const [userRoles, permGroups, users] = await Promise.all(responses.map(response => response.json()));

            return [userRoles.result, permGroups.result, users.result];
        })
        .then((allJsonData) => {

            const [userRole, permGroups, users] = allJsonData;

            // Validate responses
            if (!userRole) {
                // handle no roles
            }

            if (!permGroups) {
                // handle no perms group
            }

            if (!users) {
                // handle no users
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

            buildUsers(users);

        })
        .catch((error) => {
            if (error && error.message != 'redirected') {
                if (error != "TypeError: Failed to fetch") {
                    console.log(error);
                    alert(error);
                }
            }
        })

    // === FUNCTIONS ===

    // CREATE USER FUNCTION
    const createUser = (newuser) => {
        return fetch('/obs-admin/newuser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newuser)

        }).then((response) => {
            if (response.redirected) {
                window.location.href = response.url
                throw new Error('redirected');
            }

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
            if (error && error.message != 'redirected') {
                if (error != "TypeError: Failed to fetch") {
                    console.log(error);
                    alert(error);
                }
            }
        })
    }

    // BUILD USERS TEMPLATE
    const buildUsers = (users) => {
        const template = document.getElementById("user-template");
        const templateContainer = document.getElementById("insert-user-template");

        users.forEach(i => {
            const content = template.content.cloneNode(true);
            templateContainer.setAttribute('value', i.email);

            content.querySelector(".profile-button").setAttribute('value', i.email);
            content.querySelector("#user-name").textContent = i.nameOfUser;
            content.querySelector("#user-role").textContent = i.roleName;
            content.querySelector("#user-email").textContent = i.email;
            content.querySelector("#user-number").textContent = i.contactNo;

            let imgUrl;
            if (!i.picUrl) {
                imgUrl = '../../../assets/images/default-user-icon.png'
            } else {
                imgUrl = picUrl
            }

            content.querySelector("#user-number").src = imgUrl
            templateContainer.append(content);
        })
    }

    // === EVENT HANDLERS ===

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

