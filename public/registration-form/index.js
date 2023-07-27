window.addEventListener('DOMContentLoaded', () => {
    const schoolInput = document.getElementById('form-input-applicant-school');
    const raceInput = document.getElementById('form-input-applicant-race');

    // === FETCHES ===

    const fetchSchools = fetch('/getSchools')
        .then((response) => {
            if (!response) {
                const error = new Error("No schools found");
                error.status = response.status;
                throw error;
            }
            return response.json();

        })
        .then((dataJson) => {
            populateSchool(dataJson);
        })
        .catch((error) => {
            alert(error)
        })

    const fetchRaces = fetch('/getRaces')
        .then((response) => {
            if (!response) {
                const error = new Error("No races found");
                error.status = response.status;
                throw error;
            }
            return response.json();

        })
        .then((dataJson) => {
            populateRace(dataJson.result);
        })
        .catch((error) => {
            alert(error)
        })

    // === FUNCTIONS ===

    const populateSchool = (schoolList) => {
        schoolList.forEach(school => {
            const newSchool = document.createElement("option");
            newSchool.value = school.schoolId;
            newSchool.textContent = school.schoolName;
            schoolInput.appendChild(newSchool);
        });
    }

    const populateRace = (raceList) => {
        raceList.forEach(race => {
            const newRace = document.createElement("option");
            newRace.value = race.raceId;
            newRace.textContent = race.raceName;
            raceInput.appendChild(newRace);
        });
    }

    // === OPTIONAL DIV HANDLERS ===

    document.querySelectorAll('input[name="emergency-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('emergency-contact-div');
            if (e.target.value == "1") {
                targetElement.classList.add('optional-div');
            } else if (e.target.value == "0") {
                targetElement.classList.remove('optional-div');
            }
        })
    });

    // === EVENT HANDLERS ===

    handleParallax = () => {
        const titleRow = document.querySelector(".title-row");
        const scrollValue = window.scrollY;

        titleRow.style.backgroundPositionY = -scrollValue * 0.4 + "px";
    }

    window.addEventListener("scroll", handleParallax);

})