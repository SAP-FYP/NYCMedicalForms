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
    const myModalEl = document.getElementById('createUserModal');
    const myModalEnable = document.getElementById('confirmationEnableModal');
    const myModalDisable = document.getElementById('confirmationDisableModal');
    const enableModal = new bootstrap.Modal(myModalEnable);
    const disableModal = new bootstrap.Modal(myModalDisable);
    const modal = new bootstrap.Modal(myModalEl);

    // === FLAGS ===
    let isLoading = false;
    let eof = false;
    let offset = 0;
    let searchFilter;

    // === FETCHES ===

    // GET ROLES 
    const getRoles = fetch('/obs-admin/roles');

    // GET GROUPS
    const getPermGroups = fetch('/obs-admin/permission/groups/-1/20/0');

    // GET ALL USERS
    const getUsers = fetch('/obs-admin/users/-1');

    // Promise.all([getRoles, getPermGroups, getUsers])
    //     .then(async function (responses) {

    //         if (responses.some(response => response.redirected)) {
    //             window.location.href = responses[0].url;
    //             throw new Error('redirected');
    //         }

    //         if (responses.some(response => response.status != 200 && response.status != 404)) {
    //             const error = new Error('Unknown error')
    //             error.status = 500;
    //             throw error;
    //         }

    //         const [userRoles, permGroups, users] = await Promise.all(responses.map(response => response.json()));

    //         return [userRoles.result, permGroups.result, users.result];
    //     })
    //     .then((allJsonData) => {

    //         const [userRole, permGroups, users] = allJsonData;

    //         // Validate responses
    //         if (!userRole) {
    //             // handle no roles
    //         }

    //         if (!permGroups) {
    //             // handle no perms group
    //         }

    //         if (!users) {
    //             // handle no users
    //         }

    //         // Handle data
    //         const roleSelect = createForm.querySelector('#role-input');
    //         userRole.forEach(item => {
    //             const option = document.createElement('option');
    //             option.value = item.roleId;
    //             option.text = item.roleName;
    //             roleSelect.appendChild(option);
    //         });

    //         const permissionSelect = createForm.querySelector('#permission-input');
    //         permGroups.forEach(item => {
    //             const option = document.createElement('option');
    //             option.value = item.groupId;
    //             option.text = item.groupName;
    //             permissionSelect.appendChild(option);
    //         });

    //         buildUsers(users);

    //     })
    //     .catch((error) => {
    //         if (error && error.message != 'redirected') {
    //             if (error != "TypeError: Failed to fetch") {
    //                 console.log(error);
    //                 alert(error);
    //             }
    //         }
    //     })

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

            createForm.reset();
            modal.hide();
            alert('Successfully created')
            location.reload();

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
                content.querySelector(".profile-button").innerHTML = `<i class="material-icons profile-button-icon"
                        style="font-size:28px;color:#5a5a5a; margin-right: 5px;">person</i>
                        Disabled`
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

    // GET USERS 
    const searchUsers = () => {
        let filter = searchInput.value.trim() || -1;

        return fetch(`/obs-admin/users/${filter}`)
            .then((response) => {
                if (response.redirected) {
                    window.location.href = response.url
                    throw new Error('redirected');
                }

                if (response.status != 200 && response.status != 404) {
                    const error = new Error('Unknown error')
                    error.status = 500;
                    throw error;
                }

                return response.json()
            })
            .then((jsonData) => {
                const users = jsonData.result;

                if (!users) {
                    alert('No user found')
                    return
                    // handle empty
                }

                const templateContainer = document.getElementById("insert-user-template");
                while (templateContainer.firstChild) {
                    templateContainer.removeChild(templateContainer.firstChild);
                }

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

        modal.show();
    }

    // EDIT USER 
    const editUser = (user) => {
        return fetch('/obs-admin/user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user)

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

            } else if (response.status != 200) {
                const error = new Error("Unknown error");
                error.status = response.status
                throw error;
            }

            createForm.reset();
            modal.hide();
            alert('Successfully edited')
            location.reload();

        }).catch((error) => {
            if (error && error.message != 'redirected') {
                console.log(error);
                alert(error);
            }
            // display error
        })
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
                .then((response) => {
                    if (response.redirected) {
                        window.location.href = response.url
                        throw new Error('redirected');
                    }

                    if (response.status == 400) {
                        const error = new Error("Invalid user data");
                        error.status = response.status
                        throw error;

                    } else if (response.status != 200) {
                        const error = new Error("Unknown error");
                        error.status = response.status
                        throw error;
                    }

                    alert('Successfully deleted!')
                    location.reload();
                })
                .catch((error) => {
                    if (error && error.message != 'redirected') {
                        console.log(error);
                        alert(error);
                    }
                    // display error
                })
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
                .then((response) => {
                    if (response.redirected) {
                        window.location.href = response.url
                        throw new Error('redirected');
                    }

                    if (response.status == 400) {
                        const error = new Error("Invalid permission data");
                        error.status = response.status
                        throw error;

                    } else if (response.status != 200) {
                        const error = new Error("Unknown error");
                        error.status = response.status
                        throw error;
                    }

                    alert('Successfully deleted!')
                    location.reload();
                })
                .catch((error) => {
                    if (error && error.message != 'redirected') {
                        console.log(error);
                        alert(error);
                    }
                    // display error
                })
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
                .then((response) => {
                    if (response.redirected) {
                        window.location.href = response.url
                        throw new Error('redirected');
                    }

                    if (response.status == 400) {
                        const error = new Error("Invalid user data");
                        error.status = response.status
                        throw error;

                    } else if (response.status != 200) {
                        const error = new Error("Unknown error");
                        error.status = response.status
                        throw error;
                    }

                    alert('Successfully disabled!')
                    disableModal.hide();
                    document.getElementById(`profile-button-${user.email}`).classList.add('profile-button-disabled')
                    document.getElementById(`profile-button-${user.email}`).innerHTML = `<i class="material-icons profile-button-icon"
                    style="font-size:28px;color:#5a5a5a; margin-right: 5px;">person</i>
                    Disabled`
                    document.getElementById(`item-${user.email}`).getElementsByClassName('dropdown-disable')[0].textContent = 'Enable'
                    document.getElementById(`item-${user.email}`).getElementsByClassName('dropdown-disable')[0].setAttribute('data-bs-target', '#confirmationEnableModal');
                    document.getElementById(`item-${user.email}`).getElementsByClassName('dropdown-disable')[0].addEventListener('click', (e) => {
                        e.preventDefault;
                        enableButtonHandler(user, 0);
                    });
                    updateCheckedCount();
                })
                .catch((error) => {
                    if (error && error.message != 'redirected') {
                        console.log(error);
                        alert(error);
                    }
                    // display error
                })
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
                .then((response) => {
                    if (response.redirected) {
                        window.location.href = response.url
                        throw new Error('redirected');
                    }

                    if (response.status == 400) {
                        const error = new Error("Invalid permission data");
                        error.status = response.status
                        throw error;

                    } else if (response.status != 200) {
                        const error = new Error("Unknown error");
                        error.status = response.status
                        throw error;
                    }

                    alert('Successfully disabled!')
                    disableModal.hide();

                    users.users.forEach(user => {
                        document.getElementById(`profile-button-${user}`).classList.add('profile-button-disabled')
                        document.getElementById(`profile-button-${user}`).innerHTML = `<i class="material-icons profile-button-icon"
                    style="font-size:28px;color:#5a5a5a; margin-right: 5px;">person</i>
                    Disabled`
                        document.getElementById(`item-${user}`).getElementsByClassName('dropdown-disable')[0].textContent = 'Enable'
                        document.getElementById(`item-${user}`).getElementsByClassName('dropdown-disable')[0].setAttribute('data-bs-target', '#confirmationEnableModal');
                        document.getElementById(`item-${user}`).getElementsByClassName('dropdown-disable')[0].addEventListener('click', (e) => {
                            e.preventDefault;
                            enableButtonHandler({ email: user }, 0);

                        });
                        updateCheckedCount();
                    });

                })
                .catch((error) => {
                    if (error && error.message != 'redirected') {
                        console.log(error);
                        alert(error);
                    }
                    // display error
                })
        }
    }

    // ENABLE USER BUTTON HANDLER
    const enableButtonHandler = (user, status) => {
        // ENABLE USER
        document.getElementById('confirmation-enable-button').onclick = () => {

            return fetch(`/obs-admin/disable/user/${user.email}/${status}`, {
                method: 'PUT'
            })
                .then((response) => {
                    if (response.redirected) {
                        window.location.href = response.url
                        throw new Error('redirected');
                    }

                    if (response.status == 400) {
                        const error = new Error("Invalid user data");
                        error.status = response.status
                        throw error;

                    } else if (response.status != 200) {
                        const error = new Error("Unknown error");
                        error.status = response.status
                        throw error;
                    }

                    enableModal.hide();
                    alert('Successfully enabled!')
                    document.getElementById(`profile-button-${user.email}`).classList.remove('profile-button-disabled')
                    document.getElementById(`profile-button-${user.email}`).innerHTML = `<i class="material-icons profile-button-icon"
                    style="font-size:28px;color:#485EAB; margin-right: 5px;">person</i>
                    Profile`
                    document.getElementById(`item-${user.email}`).getElementsByClassName('dropdown-disable')[0].textContent = 'Disable'
                    document.getElementById(`item-${user.email}`).getElementsByClassName('dropdown-disable')[0].setAttribute('data-bs-target', '#confirmationDisableModal');
                    document.getElementById(`item-${user.email}`).getElementsByClassName('dropdown-disable')[0].addEventListener('click', (e) => {
                        e.preventDefault;
                        disableButtonHandler(user, 1);
                    });
                    updateCheckedCount();
                })
                .catch((error) => {
                    if (error && error.message != 'redirected') {
                        console.log(error);
                        alert(error);
                    }
                    // display error
                })
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
        if (e.target.value == 1) {
            permissionInput.value = -1;
            permissionInput.disabled = true;
        } else {
            permissionInput.disabled = false;
        }
    }

    // SEARCH BAR CLEAR BUTTON
    searchClearBtn.onclick = () => {
        searchInput.value = "";
        searchUsers();
    }

    // SEARCH BAR CLEAR 'ENTER' KEY
    searchInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            searchUsers();
        }
    });

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

    // SEARCH BAR SUBMIT BUTTON
    searchBtn.onclick = searchUsers;

    // LAZY LOADING DEFAULT SCROLL
    const defaultScroll = () => {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        if ((scrollHeight - (scrollTop + clientHeight) <= 200) && !isLoading && !eof) {
            isLoading = true;
            //getPermGroups();
        }
    }

    // LAZY LOADING SEARCHED SCROLL
    const filterScroll = () => {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        if ((scrollHeight - (scrollTop + clientHeight) <= 200) && !isLoading && !eof) {
            isLoading = true;
            //getPermGroups(searchFilter);
        }
    }

    // LAZY LOADING
    container.addEventListener('scroll', defaultScroll)

})

