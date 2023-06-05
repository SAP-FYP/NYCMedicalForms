window.addEventListener('DOMContentLoaded', () => {

    let navToggle = 0;
    const expandButton = document.querySelector("#navbar-icons-arrow");
    const navbar = document.querySelector("#nav-bar");
    const expandImg = document.querySelector("#navbar-icons-arrow");
    const navbarLabels = document.getElementsByClassName("navbar-label");
    console.log(navbarLabels)

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