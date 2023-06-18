window.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-button');
    const searchClearBtn = document.getElementById('clear-button');
    const createForm = document.querySelector('#create-permission-form');
    const createBtn = document.getElementById('open-modal-button');
    const editFormSumbitButton = document.getElementById('edit-permission-icon');
    const createFormSumbitButton = document.getElementById('confirm-permission-icon');
    const myModalEl = document.getElementById('createPermissionModal');
    const modal = new bootstrap.Modal(myModalEl);

    // === FETCHES ===

    // GET PERMISSIONS GROUPS
    const getPermGroups = fetch('/obs-admin/permission/groups/-1')

    // GET PERMISSIONS
    const getPerms = fetch('/obs-admin/permission')

    Promise.all([getPermGroups, getPerms])
        .then(async function (responses) {

            if (responses[0].redirected || responses[1].redirected) {
                window.location.href = responses[0].url
                throw new Error('redirected');
            }

            if ((responses[0].status != 200 && responses[0].status != 404) ||
                responses[1].status != 200 && responses[1].status != 404) {
                const error = new Error('Unknown error')
                error.status = 500;
                throw error;
            }

            const permGroup = await responses[0].json();
            const perms = await responses[1].json();
            return [permGroup.result, perms.result];
        })
        .then((allJsonData) => {
            const permGroup = allJsonData[0];
            const perms = allJsonData[1];

            if (!permGroup) {
                // handle no perms group
            }

            if (!perms) {
                // handle no permissions
            }

            buildPermGroups(permGroup);
            buildPerms(perms);

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

    // BUILD PERMISSION GROUPS TEMPLATE
    const buildPermGroups = (permgroups) => {
        const template = document.getElementById("permission-group-template");
        const templateContainer = document.getElementById("insert-permission-group-template");

        permgroups.forEach(i => {
            const content = template.content.cloneNode(true);
            templateContainer.setAttribute('value', i.groupId);
            content.querySelector(".item-container").setAttribute('value', i.groupId);
            content.querySelector(".select-item-chkbox").setAttribute('value', i.groupId);
            content.querySelector(".permission-group-name").textContent = i.groupName;
            content.querySelector(".more-button").setAttribute('value', i.groupId);

            content.querySelector(".dropdown-edit").addEventListener('click', (e) => {
                e.preventDefault;
                let groupInfo = {
                    groupId: i.groupId,
                    groupName: i.groupName,
                    permissions: i.permsId
                }
                editButtonHandler(groupInfo);
            })

            content.querySelector(".dropdown-delete").addEventListener('click', (e) => {
                e.preventDefault;
                let groupInfo = {
                    groupId: i.groupId,
                    groupName: i.groupName,
                    permissions: i.permsId
                }
                deleteButtonHandler(groupInfo);
            })

            const permissions = i.permsName ? i.permsName.replace(/,/g, ', ') : 'No permissions';
            content.querySelector(".permission-group-type").textContent = permissions;

            templateContainer.append(content);
        });
    }

    // BUILD PERMISSION CHECKBOX TEMPLATE
    const buildPerms = (perms) => {
        const template = document.getElementById("checkbox-template");
        const templateContainer = document.getElementById("insert-checkbox-template");

        perms.forEach(i => {
            const content = template.content.cloneNode(true);
            content.querySelector(".checkbox").setAttribute('value', i.permsId);
            content.querySelector(".checkbox").id = `checkbox_${i.permsId}`;
            content.querySelector(".checkbox-label").textContent = i.permsName;
            content.querySelector(".checkbox-label").htmlFor = `checkbox_${i.permsId}`;
            content.querySelector(".checkbox-label").setAttribute('title', i.permsDescription);

            if (i.permsId == 1) {
                content.querySelector(".checkbox").setAttribute("checked", true);
                content.querySelector(".checkbox").disabled = true;
            }

            templateContainer.append(content);
        })
    }

    // CREATE PERMISSION GROUPS
    const createPermGroup = (newPermGroup) => {
        return fetch('/obs-admin/permission/groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPermGroup)

        }).then((response) => {
            if (response.redirected) {
                window.location.href = response.url
                throw new Error('redirected');
            }

            if (response.status == 400) {
                const error = new Error("Invalid permission data");
                error.status = response.status
                throw error;

            } else if (response.status == 422) {
                const error = new Error("Permission group already exists");
                error.status = response.status
                throw error;

            } else if (response.status != 201) {
                const error = new Error("Unknown error");
                error.status = response.status
                throw error;
            }
            return response.json();
        })
            .then((jsonData) => {
                const groupId = jsonData;
                newPermGroup.groupId = groupId;
                newPermGroup.permsId = newPermGroup.permsId.join(',');
                newPermGroup.permsName = newPermGroup.permsName.join(',');

                createForm.reset();
                modal.hide();
                alert('Successfully created')
                buildPermGroups([newPermGroup])

            }).catch((error) => {
                if (error && error.message != 'redirected') {
                    console.log(error);
                    alert(error);
                }
                // display error
            })
    }

    // GET PERMISSION GROUPS
    const searchGroups = () => {
        let filter = searchInput.value.trim() || -1;

        return fetch(`/obs-admin/permission/groups/${filter}`)
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
                const permGroup = jsonData.result;

                if (!permGroup) {
                    // handle empty
                }

                const templateContainer = document.getElementById("insert-permission-group-template");
                while (templateContainer.firstChild) {
                    templateContainer.removeChild(templateContainer.firstChild);
                }

                buildPermGroups(permGroup);

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

    // EDIT PERMISSION GROUPS BUTTON HANDLER
    const editButtonHandler = (permGroup) => {
        createForm.reset();
        editFormSumbitButton.style.display = 'inline';
        editFormSumbitButton.value = permGroup.groupId;
        createFormSumbitButton.style.display = 'none';
        document.getElementById('staticBackdropLabel').textContent = "Edit Permission Group";
        document.getElementById('name-input').value = permGroup.groupName;
        document.getElementById('create-permission-modal-icon').src = "../../../assets/images/edit-permission-icon.png"
        const checkboxes = document.getElementsByClassName('checkbox');

        if (permGroup.permissions) {
            Array.from(checkboxes).forEach(i => {
                if (permGroup.permissions.includes(i.value)) {
                    i.checked = true;
                }
            });
        }
        modal.show();
    }

    // EDIT PERMISSION GROUPS
    const editPermGroup = (permGroup) => {
        return fetch('/obs-admin/permission/groups', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(permGroup)

        }).then((response) => {
            if (response.redirected) {
                window.location.href = response.url
                throw new Error('redirected');
            }

            if (response.status == 400) {
                const error = new Error("Invalid permission data");
                error.status = response.status
                throw error;

            } else if (response.status == 422) {
                const error = new Error("Permission group already exists");
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

    // DELETE PERMISSION GROUPS BUTTON HANDLER
    const deleteButtonHandler = (permGroup) => {

        // DELETE PERMISSION GROUPS
        document.getElementById('confirmation-delete-button').onclick = () => {
            return fetch(`/obs-admin/permission/groups/${permGroup.groupId}`, {
                method: 'DELETE'
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
        };
    }

    // === EVENT HANDLERS ===

    // OPEN CREATE PERMISSION GROUPS BUTTON
    createBtn.onclick = () => {
        createForm.reset();
        editFormSumbitButton.style.display = 'none';
        createFormSumbitButton.style.display = 'inline';
        document.getElementById('staticBackdropLabel').textContent = "Create New Permission Group";
        document.getElementById('create-permission-modal-icon').src = "../../../assets/images/create-modal-icon.png"
    }

    // SUBMIT CREATE PERMISSION GROUPS BUTTON
    createForm.onsubmit = (e) => {
        e.preventDefault();
        const groupName = createForm.querySelector('#name-input').value.trim();
        const checkedBoxes = createForm.querySelectorAll('.checkbox:checked');
        const checkedLabels = createForm.querySelectorAll('.checkbox:checked + label');
        let permsId = Array.from(checkedBoxes).map((checkbox) => checkbox.value);
        let permsName = Array.from(checkedLabels).map((labels) => labels.textContent);

        if (!permsName.includes('Read forms')) {
            permsName.unshift('Read forms')
        }

        if (!permsId.includes('1')) {
            permsId.unshift('1')
        }

        if (!groupName || permsId.length == 0) {
            alert('Please fill in all fields and select at least 1 permission')

        } else {
            const newPermGroup = {
                groupName,
                permsId,
                permsName
            }

            createPermGroup(newPermGroup);
        }
    }

    // SUBMIT EDIT PERMISSION GROUPS BUTTON
    editFormSumbitButton.onclick = (e) => {
        const groupId = e.target.value
        const groupName = createForm.querySelector('#name-input').value.trim();
        const checkedBoxes = createForm.querySelectorAll('.checkbox:checked');
        const checkedLabels = createForm.querySelectorAll('.checkbox:checked + label');
        let permsId = Array.from(checkedBoxes).map((checkbox) => checkbox.value);
        let permsName = Array.from(checkedLabels).map((labels) => labels.textContent);

        if (!permsName.includes('Read forms')) {
            permsName.unshift('Read forms')
        }

        if (!permsId.includes('1')) {
            permsId.unshift('1')
        }

        if (!groupName || permsId.length == 0) {
            alert('Please fill in all fields and select at least 1 permission')

        } else {
            const permGroup = {
                groupId,
                groupName,
                permsId,
                permsName
            }
            editPermGroup(permGroup);
        }
    }

    // SEARCH BAR CLEAR BUTTON
    searchClearBtn.onclick = () => {
        searchInput.value = "";
        searchGroups();
    }

    // SEARCH BAR CLEAR 'ENTER' KEY
    searchInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            searchGroups();
        }
    });

    // SEARCH BAR SUBMIT BUTTON
    searchBtn.onclick = searchGroups;

})