window.addEventListener('DOMContentLoaded', () => {

    let navToggle = 0;
    const navbar = document.getElementById("nav-bar");
    const expandImg = document.getElementById("navbar-icons-arrow");
    const navbarLabels = document.getElementsByClassName("navbar-label");

    const collapseNav = document.getElementById("collapse-li");
    const logoutNav = document.getElementById("logout-li");

    const profileContainer = document.getElementById('profile-container');
    const headerName = document.getElementById('profile-user-name');
    const headerImg = document.getElementById('profile-user-image');

    // === FETCHES ===

    // GET USER DATA - AUTHORIZATION
    const getUser = fetch('/user')
        .then((response) => {
            if (response.redirected) {
                window.location.href = response.url;
                throw new Error('redirected');
            }

            if (response.status != 200) {
                const error = new Error("Error fetching header data");
                error.status = response.status;
                throw error;
            }
            return response.json()
        })
        .then((jsonData) => {
            // SET HEADER DATA
            headerName.textContent = jsonData.user.name;
            headerImg.src = jsonData.user.picUrl || '../../../assets/images/default-user-icon.png';

            document.querySelectorAll('#permission-li, #user-li, #form-li')
                .forEach(li => {
                    li.addEventListener('mouseenter', () => {
                        if (jsonData.user.role === 1) {
                            if (li.id === 'permission-li' || li.id === 'user-li') {
                                navToggle ? li.style.padding = '0px 0px 0px 10px' : null;
                                li.classList.add('hovered');
                            }
                        } else {
                            if (li.id === 'form-li') {
                                navToggle ? li.style.padding = '0px 0px 0px 10px' : null;
                                li.classList.add('hovered');
                            }
                        }
                    });

                    li.addEventListener('mouseleave', () => {
                        li.classList.remove('hovered');
                        li.style.padding = '0px';
                    });
                });

        })
        .catch((error) => {
            if (error && error.message != 'redirected') {
                if (error.message !== "Failed to fetch") {
                    console.log(error);
                    alert(error);
                }
            }
        })


    // === EVENT HANDLERS ===

    logoutNav.onclick = () => {

        return fetch('/logout')
            .then((response) => {
                if (response.status != 200) {
                    const error = new Error("Cleanup failure")
                    error.status = response.status;
                    throw error;
                }
                window.location.href = '/obs-admin/login';
            })
            .catch((error) => {
                document.cookie = "jwt=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                window.location.href = `/login?err=${error.status}`;
            })
    }

    collapseNav.onclick = () => {
        if (!navToggle) {
            navToggle = 1
            navbar.style.width = "250px";
            expandImg.src = "../../../assets/images/navbar-collapse-icon.png"
            for (let i = 0; i < navbarLabels.length; i++) {
                navbarLabels[i].style.visibility = "visible"
                navbarLabels[i].style.opacity = "1"
            }

        } else {
            navToggle = 0
            navbar.style.width = "70px";
            expandImg.src = "../../../assets/images/navbar-expand-icon.png"
            for (let i = 0; i < navbarLabels.length; i++) {
                navbarLabels[i].style.opacity = "0"
                navbarLabels[i].style.visibility = "hidden"
            }
        }
    }

    profileContainer.onclick = () => {
        window.location.href = '/obs-admin/profile'
    }

})