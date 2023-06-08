window.addEventListener('DOMContentLoaded', () => {

    let navToggle = 0;
    const expandButton = document.getElementById("navbar-icons-arrow");
    const navbar = document.getElementById("nav-bar");
    const expandImg = document.getElementById("navbar-icons-arrow");
    const navbarLabels = document.getElementsByClassName("navbar-label");
    const headerName = document.getElementById('profile-user-name');
    const headerImg = document.getElementById('profile-user-image');

    // GET USER DATA
    fetch('/user')
        .then((response) => {
            if (response.status == 401) {
                const error = new Error("Relogin required");
                error.status = response.status;
                throw error;

            } else if (response.status != 200) {
                const error = new Error("Error fetching header data");
                error.status = response.status;
                throw error;
            }
            return response.json()
        })
        .then((jsonData) => {
            // SET HEADER DATA
            headerName.textContent = jsonData.user.name;
            if (!jsonData.user.picUrl) {
                headerImg.src = '../../../assets/images/default-user-icon.png'
            }
        })
        .catch((error) => {
            if (error.status == 401) {
                window.location.href = "/login?err=relogin"
            }

            console.log(error)
            alert(error)
            // handle error
        })

    expandButton.onclick = () => {
        if (!navToggle) {
            navToggle = 1
            navbar.style.width = "250px";
            expandImg.src = "../../../assets/images/navbar-collapse-icon.png"
            for (let i = 0; i < navbarLabels.length; i++) {
                navbarLabels[i].style.opacity = "1"
            }

        } else {
            navToggle = 0
            navbar.style.width = "70px";
            expandImg.src = "../../../assets/images/navbar-expand-icon.png"
            for (let i = 0; i < navbarLabels.length; i++) {
                navbarLabels[i].style.opacity = "0"
            }
        }
    }
})