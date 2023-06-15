document.addEventListener('DOMContentLoaded', function () {
    var dropdownMenuStayOpen = document.querySelectorAll('.dropdown-menu-stay');

    for (var i = 0; i < dropdownMenuStayOpen.length; i++) {
        dropdownMenuStayOpen[i].addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }
});