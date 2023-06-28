window.addEventListener('DOMContentLoaded', () => {
    let itemCheckboxes = document.querySelectorAll('.select-item-chkbox');
    const bulkDeleteBtn = document.getElementById('bulk-delete-button');
    const bulkDisableBtn = document.getElementById('bulk-disable-button');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-button');
    const searchClearBtn = document.getElementById('clear-button');
    const createForm = document.querySelector("#create-user-form");
    const roleInput = document.getElementById("role-input");
    const permissionInput = document.getElementById("permission-input");
    const editFormSumbitButton = document.getElementById('edit-user-icon');
    const createFormSumbitButton = document.getElementById('confirm-user-icon')
    const createButton = document.getElementById('create-user-icon');
    const myModalEl = document.getElementById('createUserModal');
    const myModalEnable = document.getElementById('confirmationEnableModal');
    const myModalDisable = document.getElementById('confirmationDisableModal');
    const enableModal = new bootstrap.Modal(myModalEnable);
    const disableModal = new bootstrap.Modal(myModalDisable);
    const modal = new bootstrap.Modal(myModalEl);
    const container = document.getElementById('data-container');


    // === FLAGS ===

    let isLoading = false;
    let eof = false;
    let offset = 0;
    let searchFilter;


    // === ERROR AND RESPONSE HANDLING ===

    // 400 , 422 , !200
    const handleCreateEditResponse = (response) => {
        if (response.redirected) {
            window.location.href = response.url
            throw new Error('redirected');
        }

        if (response.status == 400) {
            const error = new Error("Invalid data");
            error.status = response.status
            throw error;

        } else if (response.status == 422) {
            const error = new Error("Email already exists");
            error.status = response.status
            throw error;

        } else if (response.status != 200 && response.status != 201) {
            const error = new Error("Unknown error");
            error.status = response.status
            throw error;
        }

        return;
    }

    // !404 , !200
    const handleResponse = (response) => {
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

    // GET ROLES  
    const getRoles = () => {
        fetch('/obs-admin/roles')
            .then(handleResponse)
            .then((jsonData) => {
                const userRole = jsonData.result;

                if (!userRole) {
                    alert('no user roles found')
                    // handle no user roles
                } else {
                    const roleSelect = createForm.querySelector('#role-input');
                    userRole.forEach(item => {
                        const option = document.createElement('option');
                        option.value = item.roleId;
                        option.text = item.roleName;
                        roleSelect.appendChild(option);
                    });
                }
            })
            .catch(handleError)
    }

    // GET GROUPS
    const getPermGroups = () => {
        fetch(`/obs-admin/permission/groups/-1/999/0`)
            .then(handleResponse)
            .then((jsonData) => {
                const permGroups = jsonData.result;

                if (!permGroups) {
                    alert('no permission groups found')
                    // handle no permission groups
                } else {

                    const permissionSelect = createForm.querySelector('#permission-input');
                    permGroups.forEach(item => {
                        const option = document.createElement('option');
                        option.value = item.groupId;
                        option.text = item.groupName;
                        permissionSelect.appendChild(option);
                    });
                }
            })
            .catch(handleError)
    }

    // GET ALL USERS
    const getUsers = (filter) => {
        !filter ? filter = -1 : filter;

        fetch(`/obs-admin/users/${filter}/16/${offset}`)
            .then(handleResponse)
            .then((jsonData) => {
                const users = jsonData.result;

                if (!users) {
                    eof = true;
                    alert('no users found')
                    // handle no users
                } else {
                    buildUsers(users);
                }

                offset += 16;
                isLoading = false;
                filter == -1 ? container.addEventListener('scroll', defaultScroll) : container.addEventListener('scroll', filterScroll)
            })
            .catch(handleError)
    }

    // === FUNCTIONS ===

    // CREATE USER FUNCTION
    const createUser = (newuser) => {
        return fetch('/obs-admin/newuser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newuser)

        })
            .then(handleCreateEditResponse)
            .then(() => {
                createForm.reset();
                modal.hide();
                alert('Successfully created')
                location.reload();
            })
            .catch(handleError)
    }

    // BUILD USERS TEMPLATE
    const buildUsers = (users) => {
        const template = document.getElementById("user-template");
        const templateContainer = document.getElementById("insert-user-template");

        users.forEach(i => {
            const content = template.content.cloneNode(true);
            templateContainer.setAttribute('value', i.email);

            content.querySelector(".item-border").setAttribute('id', `item-${i.email}`)
            content.querySelector(".profile-button").setAttribute('id', `profile-button-${i.email}`);
            content.querySelector(".profile-button").setAttribute('value', i.email);
            content.querySelector(".select-item-chkbox").setAttribute('value', i.email);
            content.querySelector("#user-name").textContent = i.nameOfUser;
            content.querySelector("#user-role").textContent = i.roleName;
            content.querySelector("#user-email").textContent = i.email;
            content.querySelector("#user-number").textContent = i.contactNo;
            content.querySelector("#user-image").src = i.picUrl || '../../../assets/images/default-user-icon.png';

            if (i.isDisabled) {
                content.querySelector(".dropdown-disable").setAttribute('data-bs-target', '#confirmationEnableModal');
                content.querySelector(".dropdown-disable").textContent = 'Enable';

                content.querySelector(".profile-button").classList.add('profile-button-disabled')
                content.querySelector(".profile-button").textContent = `Disabled`
            }

            content.querySelector(".dropdown-disable").addEventListener('click', (e) => {
                e.preventDefault;
                let user = {
                    email: i.email
                }

                if (i.isDisabled) {
                    enableButtonHandler(user, 0);
                } else {
                    disableButtonHandler(user, 1);
                }
            })

            content.querySelector(".dropdown-delete").addEventListener('click', (e) => {
                e.preventDefault;
                let user = {
                    email: i.email
                }
                deleteButtonHandler(user);
            })

            content.querySelector(".dropdown-edit").addEventListener('click', (e) => {
                e.preventDefault;
                let user = {
                    email: i.email,
                    name: i.nameOfUser,
                    contact: i.contactNo,
                    role: i.roleId,
                    group: i.groupId
                }
                editButtonHandler(user);
            })
            templateContainer.append(content);
            updateCheckboxes();
        })
    }

    // EDIT USER BUTTON HANDLER
    const editButtonHandler = (user) => {
        createForm.reset();

        editFormSumbitButton.style.display = 'inline';
        editFormSumbitButton.value = user.email;
        createFormSumbitButton.style.display = 'none';
        document.getElementById('email-input').disabled = true;

        document.getElementById('staticBackdropLabel').textContent = "Edit User";
        document.getElementById('name-input').value = user.name;
        document.getElementById('role-input').value = user.role;

        if (user.role == 1) {
            document.getElementById('permission-input').value = -1;
            document.getElementById('permission-input').disabled = true;
        } else {
            document.getElementById('permission-input').value = user.group;
            document.getElementById('permission-input').disabled = false;
        }

        document.getElementById('email-input').value = user.email;
        document.getElementById('number-input').value = user.contact;
        document.getElementById('create-user-modal-icon').src = "../../../assets/images/edit-permission-icon.png"
    }

    // EDIT USER 
    const editUser = (user) => {
        return fetch('/obs-admin/user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user)

        })
            .then(handleCreateEditResponse)
            .then(() => {
                createForm.reset();
                modal.hide();
                alert('Successfully edited user');
                location.reload();
            })
            .catch(handleError)
    }

    // DELETE USER BUTTON HANDLER
    const deleteButtonHandler = (user) => {
        if (document.getElementById('confirmation-delete-bulk-button')) {
            document.getElementById('confirmation-delete-bulk-button').id = 'confirmation-delete-button';

            const formLabel = document.querySelector('#confirmation-delete-button').closest('.modal-content').querySelector('.modal-body .form-label');
            formLabel.textContent = `Are you sure you want to delete this user? You can't undo this action.`;
        }

        // DELETE USER
        document.getElementById('confirmation-delete-button').onclick = () => {
            return fetch(`/obs-admin/delete/user/${user.email}`, {
                method: 'PUT'
            })
                .then(handleCreateEditResponse)
                .then(() => {
                    alert('Successfully deleted user');
                    location.reload();
                })
                .catch(handleError)
        };
    }

    // BULK DELETE USERS
    const bulkDelete = (users) => {
        if (document.getElementById('confirmation-delete-button')) {
            document.getElementById('confirmation-delete-button').id = 'confirmation-delete-bulk-button';

            const formLabel = document.querySelector('#confirmation-delete-bulk-button').closest('.modal-content').querySelector('.modal-body .form-label');
            formLabel.textContent = `Are you sure you want to delete selected users? You can't undo this action.`;
        }

        // BULK DELETE PERMISSION GROUPS
        document.getElementById('confirmation-delete-bulk-button').onclick = () => {
            return fetch(`/obs-admin/delete/user`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(users)
            })
                .then(handleCreateEditResponse)
                .then(() => {
                    alert('Successfully deleted selected users');
                    location.reload();
                })
                .catch(handleError)
        }
    }

    // DISABLE USER BUTTON HANDLER
    const disableButtonHandler = (user, status) => {
        if (document.getElementById('confirmation-disable-bulk-button')) {
            document.getElementById('confirmation-disable-bulk-button').id = 'confirmation-disable-button';

            const formLabel = document.querySelector('#confirmation-disable-button').closest('.modal-content').querySelector('.modal-body .form-label');
            formLabel.textContent = `Are you sure you want to disable this users`;
        }

        // DISABLE USER
        document.getElementById('confirmation-disable-button').onclick = () => {
            return fetch(`/obs-admin/disable/user/${user.email}/${status}`, {
                method: 'PUT'
            })
                .then(handleCreateEditResponse)
                .then(() => {
                    alert('Successfully disabled user!')
                    disableModal.hide();
                    document.getElementById(`profile-button-${user.email}`).classList.add('profile-button-disabled')
                    document.getElementById(`profile-button-${user.email}`).textContent = `Disabled`
                    document.getElementById(`item-${user.email}`).getElementsByClassName('dropdown-disable')[0].textContent = 'Enable'
                    document.getElementById(`item-${user.email}`).getElementsByClassName('dropdown-disable')[0].setAttribute('data-bs-target', '#confirmationEnableModal');
                    document.getElementById(`item-${user.email}`).getElementsByClassName('dropdown-disable')[0].addEventListener('click', (e) => {
                        e.preventDefault;
                        enableButtonHandler(user, 0);
                    });
                    updateCheckedCount();
                })
                .catch(handleError)
        };
    }

    // BULK DELETE USERS
    const bulkDisable = (users) => {
        if (document.getElementById('confirmation-disable-button')) {
            document.getElementById('confirmation-disable-button').id = 'confirmation-disable-bulk-button';

            const formLabel = document.querySelector('#confirmation-disable-bulk-button').closest('.modal-content').querySelector('.modal-body .form-label');
            formLabel.textContent = `Are you sure you want to disable selected users?`;
        }

        // BULK DELETE PERMISSION GROUPS
        document.getElementById('confirmation-disable-bulk-button').onclick = () => {
            return fetch(`/obs-admin/disable/user`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(users)
            })
                .then(handleCreateEditResponse)
                .then(() => {
                    alert('Successfully disabled selected users!')
                    disableModal.hide();

                    users.users.forEach(user => {
                        document.getElementById(`profile-button-${user}`).classList.add('profile-button-disabled')
                        document.getElementById(`profile-button-${user}`).textContent = `Disabled`
                        document.getElementById(`item-${user}`).getElementsByClassName('dropdown-disable')[0].textContent = 'Enable'
                        document.getElementById(`item-${user}`).getElementsByClassName('dropdown-disable')[0].setAttribute('data-bs-target', '#confirmationEnableModal');
                        document.getElementById(`item-${user}`).getElementsByClassName('dropdown-disable')[0].addEventListener('click', (e) => {
                            e.preventDefault;
                            enableButtonHandler({ email: user }, 0);

                        });
                        updateCheckedCount();
                    });

                })
                .catch(handleError)
        }
    }

    // ENABLE USER BUTTON HANDLER
    const enableButtonHandler = (user, status) => {
        // ENABLE USER
        document.getElementById('confirmation-enable-button').onclick = () => {

            return fetch(`/obs-admin/disable/user/${user.email}/${status}`, {
                method: 'PUT'
            })
                .then(handleCreateEditResponse)
                .then(() => {
                    enableModal.hide();
                    alert('Successfully enabled user!')
                    document.getElementById(`profile-button-${user.email}`).classList.remove('profile-button-disabled')
                    document.getElementById(`profile-button-${user.email}`).textContent = `Enabled`
                    document.getElementById(`item-${user.email}`).getElementsByClassName('dropdown-disable')[0].textContent = 'Disable'
                    document.getElementById(`item-${user.email}`).getElementsByClassName('dropdown-disable')[0].setAttribute('data-bs-target', '#confirmationDisableModal');
                    document.getElementById(`item-${user.email}`).getElementsByClassName('dropdown-disable')[0].addEventListener('click', (e) => {
                        e.preventDefault;
                        disableButtonHandler(user, 1);
                    });
                    updateCheckedCount();
                })
                .catch(handleError)
        };
    }

    // GET NUMBER OF CHECKBOXES 
    const updateCheckboxes = () => {
        itemCheckboxes = document.querySelectorAll('.select-item-chkbox');
        itemCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateCheckedCount);
        });
    }

    // CHECKBOXES 
    const updateCheckedCount = () => {
        const checkedBoxes = document.querySelectorAll('.select-item-chkbox:checked');
        const checkedCount = checkedBoxes.length;

        const values = Array.from(checkedBoxes).map(checkbox => checkbox.value);

        let enable = values.some(i => document.getElementById(`item-${i}`).getElementsByClassName('dropdown-disable')[0].textContent === 'Enable');

        if (enable) {
            // disable the disable button
            document.getElementById('bulk-disable-button').classList.add('disabled')
        } else {
            // enable the disable button
            document.getElementById('bulk-disable-button').classList.remove('disabled')
        }

        if (checkedCount == 1) {
            document.getElementById('bulk-action').style.visibility = 'visible';
            document.getElementById('bulk-delete-selected').textContent = `${checkedCount} User Selected`
        } else if (checkedCount > 1) {
            document.getElementById('bulk-action').style.visibility = 'visible';
            document.getElementById('bulk-delete-selected').textContent = `${checkedCount} Users Selected`
        } else if (checkedCount < 1) {
            document.getElementById('bulk-action').style.visibility = 'hidden';
        }

    }

    // === EVENT HANDLERS ===

    document.getElementById('name-input').oninput = (e) => {
        !e.target.value.trim()
            ? document.getElementById('name-input').classList.add('is-invalid')
            : document.getElementById('name-input').classList.remove('is-invalid');
    }

    document.getElementById('permission-input').onchange = (e) => {
        (e.target.value == -1 && roleInput.value != 1)
            ? document.getElementById('permission-input').classList.add('is-invalid')
            : document.getElementById('permission-input').classList.remove('is-invalid');
    }

    document.getElementById('email-input').oninput = (e) => {
        !validator.isEmail(e.target.value.trim())
            ? document.getElementById('email-input').classList.add('is-invalid')
            : document.getElementById('email-input').classList.remove('is-invalid');
    }

    document.getElementById('number-input').oninput = (e) => {
        const phoneNumberPattern = /^(\+?65)?[689]\d{7}$/;
        !phoneNumberPattern.test(e.target.value.trim())
            ? document.getElementById('number-input').classList.add('is-invalid')
            : document.getElementById('number-input').classList.remove('is-invalid');
    }

    createButton.onclick = () => {
        createForm.reset();
        createFormSumbitButton.style.display = 'inline';
        editFormSumbitButton.style.display = 'none';
        document.getElementById('email-input').disabled = false;
        document.getElementById('permission-input').disabled = false;
        document.getElementById('staticBackdropLabel').textContent = "Create New User";
        document.getElementById('create-user-modal-icon').src = "../../../assets/images/create-modal-icon.png"
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
        const phoneNumberPattern = /^(\+?65)?[689]\d{7}$/;

        // validate here and show errors when user click submit.
        if (!permissionGroup || !name || (permissionGroup == -1 && role != 1) || role == -1) {
            alert("Please fill in all fields");
        } else if (!validator.isEmail(email)) {
            alert("Please enter a valid email");
        } else if (!phoneNumberPattern.test(phoneNumber)) {
            alert("Please enter a valid number");
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

    // SUBMIT EDIT PERMISSION GROUPS BUTTON
    editFormSumbitButton.onclick = (e) => {
        const email = e.target.value
        const name = createForm.querySelector('#name-input').value.trim();
        const role = createForm.querySelector('#role-input').value;
        const group = createForm.querySelector('#permission-input').value;
        const contact = createForm.querySelector('#number-input').value.trim();
        //password? to be randomly generated / reset by admin. another feature so for now no need to fill

        if (!email || !group || !name || !contact || (group == -1 && role != 1) || role == -1) {
            alert("Please fill in all fields");

        } else {
            const user = {
                email,
                name,
                role,
                group,
                contact
            }
            editUser(user);
        }
    }

    // ON DROP DOWN ROLE CHANGE
    roleInput.onchange = (e) => {
        e.target.value == -1
            ? document.getElementById('role-input').classList.add('is-invalid')
            : document.getElementById('role-input').classList.remove('is-invalid');

        if (e.target.value == 1) {
            permissionInput.value = -1;
            permissionInput.disabled = true;
            document.getElementById('permission-input').classList.remove('is-invalid');
        } else {
            permissionInput.disabled = false;
        }
    }

    // SEARCH BAR CLEAR BUTTON
    searchClearBtn.onclick = () => {
        eof = false;
        offset = 0;
        container.removeEventListener('scroll', defaultScroll)
        container.removeEventListener('scroll', filterScroll)
        document.getElementById('bulk-action').style.visibility = 'hidden';
        searchInput.value = "";

        const templateContainer = document.getElementById("insert-user-template");
        while (templateContainer.firstChild) {
            templateContainer.removeChild(templateContainer.firstChild);
        }

        getUsers();
    }

    // SEARCH BAR CLEAR 'ENTER' KEY
    searchInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            searchFilter = searchInput.value.trim();
            eof = false;
            offset = 0;
            container.removeEventListener('scroll', defaultScroll)
            container.removeEventListener('scroll', filterScroll)
            document.getElementById('bulk-action').style.visibility = 'hidden';

            const templateContainer = document.getElementById("insert-user-template");
            while (templateContainer.firstChild) {
                templateContainer.removeChild(templateContainer.firstChild);
            }

            getUsers(searchFilter);
        }
    });

    // SEARCH BAR SUBMIT BUTTON
    searchBtn.onclick = () => {
        searchFilter = searchInput.value.trim();

        eof = false;
        offset = 0;
        container.removeEventListener('scroll', defaultScroll)
        container.removeEventListener('scroll', filterScroll)
        document.getElementById('bulk-action').style.visibility = 'hidden';

        const templateContainer = document.getElementById("insert-user-template");
        while (templateContainer.firstChild) {
            templateContainer.removeChild(templateContainer.firstChild);
        }

        getUsers(searchFilter);
    }

    // BULK DELETE
    bulkDeleteBtn.onclick = () => {
        let checkedItems = []
        document.querySelectorAll('.select-item-chkbox:checked').forEach(i => {
            checkedItems.push(i.value)
        });

        if (checkedItems.length < 1) {
            alert('Please select 1 user or more');
        } else {
            bulkDelete({ users: checkedItems });
        }
    }

    // BULK DISABLE
    bulkDisableBtn.onclick = () => {
        let checkedItems = []
        document.querySelectorAll('.select-item-chkbox:checked').forEach(i => {
            checkedItems.push(i.value)
        });

        if (checkedItems.length < 1) {
            alert('Please select 1 user or more');
        } else {
            bulkDisable({ users: checkedItems });
        }
    }

    // LAZY LOADING DEFAULT SCROLL
    const defaultScroll = () => {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        if ((scrollHeight - (scrollTop + clientHeight) <= 200) && !isLoading && !eof) {
            isLoading = true;
            getUsers();
        }
    }

    // LAZY LOADING SEARCHED SCROLL
    const filterScroll = () => {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        if ((scrollHeight - (scrollTop + clientHeight) <= 200) && !isLoading && !eof) {
            isLoading = true;
            getUsers(searchFilter);
        }
    }

    // LAZY LOADING USERS
    container.addEventListener('scroll', defaultScroll)

    getUsers();
    getPermGroups();
    getRoles();

})

