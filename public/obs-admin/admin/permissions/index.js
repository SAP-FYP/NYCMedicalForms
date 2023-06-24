window.addEventListener('DOMContentLoaded', () => {
    let itemCheckboxes = document.querySelectorAll('.select-item-chkbox');
    const allCheckbox = document.getElementById('select-all-chkbox');
    const bulkDeleteBtn = document.getElementById('bulk-delete-button');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-button');
    const searchClearBtn = document.getElementById('clear-button');
    const createForm = document.querySelector('#create-permission-form');
    const createBtn = document.getElementById('open-modal-button');
    const editFormSumbitButton = document.getElementById('edit-permission-icon');
    const createFormSumbitButton = document.getElementById('confirm-permission-icon');
    const myModalEl = document.getElementById('createPermissionModal');
    const modal = new bootstrap.Modal(myModalEl);
    const container = document.getElementById('data-container');

    // === FLAGS ===
    let isLoading = false;
    let eof = false;
    let offset = 0;
    let searchFilter;
    // === FETCHES ===

    // GET PERMISSIONS GROUPS
    const getPermGroups = (filter) => {
        !filter ? filter = -1 : filter;

        fetch(`/obs-admin/permission/groups/${filter}/20/${offset}`)
            .then((response) => {
                if (response.redirected) {
                    window.location.href = response.url;
                    throw new Error('redirected');
                }

                if (response.status != 200 && response.status != 404) {
                    const error = new Error('Unknown error')
                    error.status = 500;
                    throw error;
                }

                return response.json();
            })
            .then((jsonData) => {
                const permGroup = jsonData.result;
                if (!permGroup) {
                    eof = true;
                    alert('no permission groups found')
                    // handle no perms group
                } else {
                    buildPermGroups(permGroup);
                }
                offset += 20;
                isLoading = false;
                filter == -1 ? container.addEventListener('scroll', defaultScroll) : container.addEventListener('scroll', filterScroll)
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

    // GET PERMISSIONS
    const getPerms = () => {
        fetch('/obs-admin/permission')
            .then((response) => {
                if (response.redirected) {
                    window.location.href = response.url;
                    throw new Error('redirected');
                }

                if (response.status != 200 && response.status != 404) {
                    const error = new Error('Unknown error')
                    error.status = 500;
                    throw error;
                }
                return response.json();
            })
            .then((jsonData) => {
                const perms = jsonData.result;
                if (!perms) {
                    alert('no permissions found')
                    // handle no perms
                } else {
                    buildPerms(perms);
                }
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

    getPermGroups();
    getPerms();

    // === FUNCTIONS ===

    // BUILD PERMISSION GROUPS TEMPLATE
    const buildPermGroups = async (permgroups) => {
        const template = document.getElementById("permission-group-template");
        const templateContainer = document.getElementById("insert-permission-group-template");

        await permgroups.forEach(i => {
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
        updateCheckboxes();
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
        if (document.getElementById('confirmation-delete-bulk-button')) {
            document.getElementById('confirmation-delete-bulk-button').id = 'confirmation-delete-button';

            const formLabel = document.querySelector('#confirmation-delete-button').closest('.modal-content').querySelector('.modal-body .form-label');
            formLabel.textContent = `Are you sure you want to delete this permission group? You can't undo this action.`;
        }

        // DELETE PERMISSION GROUPS
        document.getElementById('confirmation-delete-button').onclick = () => {
            console.log('singled')
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

    // BULK DELETE PERMISSION GROUPS
    const bulkDelete = (groups) => {
        if (document.getElementById('confirmation-delete-button')) {
            document.getElementById('confirmation-delete-button').id = 'confirmation-delete-bulk-button';

            const formLabel = document.querySelector('#confirmation-delete-bulk-button').closest('.modal-content').querySelector('.modal-body .form-label');
            formLabel.textContent = `Are you sure you want to delete selected permission groups? You can't undo this action.`;
        }

        // BULK DELETE PERMISSION GROUPS
        document.getElementById('confirmation-delete-bulk-button').onclick = () => {
            console.log('bulked')
            return fetch(`/obs-admin/permission/groups`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(groups)
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

    // GET NUMBER OF CHECKBOXES 
    const updateCheckboxes = () => {
        itemCheckboxes = document.querySelectorAll('.select-item-chkbox');
        itemCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateCheckedCount);
        });
    }

    // CHECKBOXES 
    const updateCheckedCount = () => {
        const checkedCount = document.querySelectorAll('.select-item-chkbox:checked').length;

        if (checkedCount == 1) {
            document.getElementById('bulk-action').style.visibility = 'visible';
            document.getElementById('bulk-delete-selected').textContent = `${checkedCount} Group Selected`
        } else if (checkedCount > 1) {
            document.getElementById('bulk-action').style.visibility = 'visible';
            document.getElementById('bulk-delete-selected').textContent = `${checkedCount} Groups Selected`
        } else if (checkedCount < 1) {
            document.getElementById('bulk-action').style.visibility = 'hidden';
        }

        checkedCount == itemCheckboxes.length ? allCheckbox.checked = true : allCheckbox.checked = false;
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
        eof = false;
        offset = 0;
        container.removeEventListener('scroll', defaultScroll)
        container.removeEventListener('scroll', filterScroll)
        searchInput.value = "";

        const templateContainer = document.getElementById("insert-permission-group-template");
        while (templateContainer.firstChild) {
            templateContainer.removeChild(templateContainer.firstChild);
        }

        getPermGroups();
    }

    // SEARCH BAR 'ENTER' KEY
    searchInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            searchFilter = searchInput.value.trim();
            eof = false;
            offset = 0;
            container.removeEventListener('scroll', defaultScroll)
            container.removeEventListener('scroll', filterScroll)

            const templateContainer = document.getElementById("insert-permission-group-template");
            while (templateContainer.firstChild) {
                templateContainer.removeChild(templateContainer.firstChild);
            }

            getPermGroups(searchFilter);
        }
    });

    // SEARCH BAR SUBMIT BUTTON
    searchBtn.onclick = () => {
        searchFilter = searchInput.value.trim();

        eof = false;
        offset = 0;
        container.removeEventListener('scroll', defaultScroll)
        container.removeEventListener('scroll', filterScroll)

        const templateContainer = document.getElementById("insert-permission-group-template");
        while (templateContainer.firstChild) {
            templateContainer.removeChild(templateContainer.firstChild);
        }

        getPermGroups(searchFilter);
    }

    // ALL CHECKBOX BUTTON
    allCheckbox.onchange = () => {
        const checked = allCheckbox.checked;

        itemCheckboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        updateCheckedCount();
    }

    // BULK DELETE
    bulkDeleteBtn.onclick = () => {
        let checkedItems = []
        document.querySelectorAll('.select-item-chkbox:checked').forEach(i => {
            checkedItems.push(i.value)
        });

        if (checkedItems.length < 1) {
            alert('Please select 1 permission group or more');
        } else {
            bulkDelete({ groupIds: checkedItems });
        }
    }

    // LAZY LOADING DEFAULT SCROLL
    const defaultScroll = () => {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        if ((scrollHeight - (scrollTop + clientHeight) <= 200) && !isLoading && !eof) {
            isLoading = true;
            getPermGroups();
        }
    }

    // LAZY LOADING SEARCHED SCROLL
    const filterScroll = () => {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        if ((scrollHeight - (scrollTop + clientHeight) <= 200) && !isLoading && !eof) {
            isLoading = true;
            getPermGroups(searchFilter);
        }
    }

    // LAZY LOADING
    container.addEventListener('scroll', defaultScroll)

})