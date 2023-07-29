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

    const displayNote = (callingEl, note, type) => {
        const template = document.querySelector("#note-template");

        if (note == "specialist memo") {
            note = "A specialist memo is needed for further assessment. Complete this registration and get in touch with the Teacher Coordinator."
        } else if (note == "physiotherapist memo") {
            note = "A specialist/physiotherapist memo is needed for further assessment. Complete this registration and get in touch with the Teacher Coordinator."
        } else if (note == "treating memo") {
            note = "A specialist/treating doctor memo is needed for further assessment. Complete this registration and get in touch with the Teacher Coordinator."
        } else if (note == "unable to enrol") {
            note = "OBS is unable to enrol the Applicant with the stated condition. Complete this registration and get in touch with the Teacher Coordinator for advice."
        }

        // Check for the child element with class "insert-note-template"
        const insertNoteTemplateDiv = callingEl.querySelector('.insert-note-template');

        if (insertNoteTemplateDiv) {
            while (insertNoteTemplateDiv.firstChild) {
                insertNoteTemplateDiv.removeChild(insertNoteTemplateDiv.firstChild);
            }

            if (type) {
                const content = template.content.cloneNode(true);
                content.querySelector("h3").textContent = `Note: ${note}`;
                insertNoteTemplateDiv.appendChild(content);
            }
        }
    }
    // === OPTIONAL DIV HANDLERS ===

    // EMERGENCY CONTACT
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

    // TETANUS VACCINATION
    document.querySelectorAll('input[name="tetanus-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('tetanus-date-div');
            const targetElement2 = document.getElementById('tetanus-note-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');
                targetElement2.classList.remove('optional-div');
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
                targetElement2.classList.add('optional-div');
            }
        })
    });

    // BREATHING CONDITION
    document.querySelectorAll('input[name="breathing-condition-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('breathing-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
            }
        })
    });

    // HEART CONDITION
    document.querySelectorAll('input[name="heart-condition-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('heart-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
            }
        })
    });

    // BLOOD CONDITION
    document.querySelectorAll('input[name="blood-condition-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('blood-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
            }
        })
    });

    // > CHOOSE BLOOD CONDITION
    document.querySelectorAll('input[name="blood-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            if (e.target.value == "0" || e.target.value == "3") { // ANAEMIA / OTHERS
                displayNote(document.getElementById('blood-condition-div'), "", 0)
                if (document.querySelector('input[name="blood-followup-radio"]:checked') != null &&
                    document.querySelector('input[name="blood-followup-radio"]:checked').value == 1) {
                    displayNote(document.getElementById('blood-condition-div'), "specialist memo", 1)
                }
                document.getElementById('blood-followup-div').classList.remove('optional-div');
            } else if (e.target.value == "2") { // T MAJOR
                displayNote(document.getElementById('blood-condition-div'), "unable to enrol", 1)
                document.getElementById('blood-followup-div').classList.add('optional-div');
            } else if (e.target.value == "1") { // T MINOR
                displayNote(document.getElementById('blood-condition-div'), "", 0)
                document.getElementById('blood-followup-div').classList.add('optional-div');
            }
        })
    });

    // > > BLOOD CONDITION(OTHERS / ANAEMIA) - FOLLOWUP CONDITION
    document.querySelectorAll('input[name="blood-followup-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            if (e.target.value == "0") {
                // remove template
                displayNote(document.getElementById('blood-condition-div'), "", 0)
            } else if (e.target.value == "1") {
                // add template
                displayNote(document.getElementById('blood-condition-div'), "specialist memo", 1)
            }
        })
    });

    // EPILEPSY, FITS OR SEIZURE CONDITION
    document.querySelectorAll('input[name="epilepsy-condition-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('epilepsy-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
            }
        })
    });

    // > EPILEPSY, FITS OR SEIZURE IN THE PAST 24 MONTHS
    document.querySelectorAll('input[name="epilepsy-past-months-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            if (e.target.value == "0") {
                // remove template
                if (!(document.querySelector('input[name="epilepsy-medication-radio"]:checked') != null &&
                    document.querySelector('input[name="epilepsy-medication-radio"]:checked').value == 1)) {
                    displayNote(document.getElementById('epilepsy-condition-div'), "", 0)

                    if (document.querySelector('input[name="epilepsy-medication-radio"]:checked') != null) {
                        document.getElementById('epilepsy-followup-div').classList.remove('optional-div');

                        if (document.querySelector('input[name="epilepsy-followup-radio"]:checked') != null &&
                            document.querySelector('input[name="epilepsy-followup-radio"]:checked').value == 1) {
                            displayNote(document.getElementById('epilepsy-condition-div'), "specialist memo", 1)
                        }
                    }

                }
            } else if (e.target.value == "1") {
                // add template
                document.getElementById('epilepsy-followup-div').classList.add('optional-div');
                displayNote(document.getElementById('epilepsy-condition-div'), "unable to enrol", 1)
            }
        })
    });

    // > EPILEPSY, FITS OR SEIZURE MEDICATION IN THE PAST 24 MONTHS
    document.querySelectorAll('input[name="epilepsy-medication-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            if (e.target.value == "0") {
                // remove template
                if (!(document.querySelector('input[name="epilepsy-past-months-radio"]:checked') != null &&
                    document.querySelector('input[name="epilepsy-past-months-radio"]:checked').value == 1)) {
                    displayNote(document.getElementById('epilepsy-condition-div'), "", 0)

                    if (document.querySelector('input[name="epilepsy-past-months-radio"]:checked') != null) {
                        document.getElementById('epilepsy-followup-div').classList.remove('optional-div');

                        if (document.querySelector('input[name="epilepsy-followup-radio"]:checked') != null &&
                            document.querySelector('input[name="epilepsy-followup-radio"]:checked').value == 1) {
                            displayNote(document.getElementById('epilepsy-condition-div'), "specialist memo", 1)
                        }
                    }

                }
            } else if (e.target.value == "1") {
                // add template
                document.getElementById('epilepsy-followup-div').classList.add('optional-div');
                displayNote(document.getElementById('epilepsy-condition-div'), "unable to enrol", 1)
            }
        })
    });

    // > > EPILEPSY, FITS OR SEIZURE - FOLLOWUP CONDITION
    document.querySelectorAll('input[name="epilepsy-followup-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            if (e.target.value == "0") {
                // remove template
                displayNote(document.getElementById('epilepsy-condition-div'), "", 0)

            } else if (e.target.value == "1") {
                // add template
                displayNote(document.getElementById('epilepsy-condition-div'), "specialist memo", 1)
            }
        })
    });

    // BONE / JOINT/ TENDON CONDITION
    document.querySelectorAll('input[name="bone-condition-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('bone-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
            }
        })
    });

    // > BONE / JOINT/ TENDON CONDITION - FOLLOW UP CONDITION
    document.querySelectorAll('input[name="bone-followup-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            if (e.target.value == "0") {
                // remove template
                displayNote(document.getElementById('bone-condition-div'), "", 0)

            } else if (e.target.value == "1") {
                // add template
                displayNote(document.getElementById('bone-condition-div'), "physiotherapist memo", 1)
            }
        })
    });

    // BEHAVIOURAL OR PSYCHOLOGICAL CONDITION
    document.querySelectorAll('input[name="behavioural-condition-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('behavioural-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
            }
        })
    });

    // > BEHAVIOURAL OR PSYCHOLOGICAL CONDITION - FOLLOW UP CONDITION
    document.querySelectorAll('input[name="behavioural-followup-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('behavioural-specialist-progress-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
            }
        })
    });

    // LONG TERM PRESCRIBTION MEDICATION
    document.querySelectorAll('input[name="medication-condition-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('medication-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
            }
        })
    });

    // CARRIER STATUS FOR ANY INFECTIOUS DISEASE
    document.querySelectorAll('input[name="disease-condition-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('disease-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
            }
        })
    });

    // SLEEP WALKING
    document.querySelectorAll('input[name="sleepwalk-condition-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('sleepwalk-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
            }
        })
    });

    // ALLERGY OR ADVERSE REACTIONS TO MEDICATIONS
    document.querySelectorAll('input[name="medication-allergy-condition-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('medication-allergy-condition-div');
            const riskAcknowledgement = document.getElementById('allergy-acknowledgement-div');

            const foodAllergyRadio = document.querySelector('input[name="food-allergy-condition-radio"]:checked');
            const environmentalAllergyRadio = document.querySelector('input[name="environmental-allergy-condition-radio"]:checked');

            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');

                if ((!foodAllergyRadio || foodAllergyRadio.value == "0") && (!environmentalAllergyRadio || environmentalAllergyRadio.value == "0")) {
                    riskAcknowledgement.classList.add('optional-div');
                }

            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
                riskAcknowledgement.classList.remove('optional-div');
            }
        })
    });

    // ALLERGY TO ENVIRONMENTAL FACTOR(S)
    document.querySelectorAll('input[name="environmental-allergy-condition-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('environmental-allergy-condition-div');
            const riskAcknowledgement = document.getElementById('allergy-acknowledgement-div');

            const foodAllergyRadio = document.querySelector('input[name="food-allergy-condition-radio"]:checked');
            const medicationAllergyRadio = document.querySelector('input[name="medication-allergy-condition-radio"]:checked');

            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');

                if ((!foodAllergyRadio || foodAllergyRadio.value == "0") && (!medicationAllergyRadio || medicationAllergyRadio.value == "0")) {
                    riskAcknowledgement.classList.add('optional-div');
                }

            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
                riskAcknowledgement.classList.remove('optional-div');
            }
        })
    });

    // > ALLERGY TO ENVIRONMENTAL FACTOR(S) - ALLERGY MEDICATION
    document.querySelectorAll('input[name="environmental-medication-condition-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('allergy-medication-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
            }
        })
    });

    // ALLERGY TO FOOD ITEM(S) / INGREDIENT(S)
    document.querySelectorAll('input[name="food-allergy-condition-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('food-allergy-condition-div');
            const riskAcknowledgement = document.getElementById('allergy-acknowledgement-div');

            const environmentalAllergyRadio = document.querySelector('input[name="environmental-allergy-condition-radio"]:checked');
            const medicationAllergyRadio = document.querySelector('input[name="medication-allergy-condition-radio"]:checked');

            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');

                if ((!environmentalAllergyRadio || environmentalAllergyRadio.value == "0") && (!medicationAllergyRadio || medicationAllergyRadio.value == "0")) {
                    riskAcknowledgement.classList.add('optional-div');
                }

            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
                riskAcknowledgement.classList.remove('optional-div');
            }
        })
    });

    // > ALLERGY TO FOOD ITEM(S) - ALLERGY MEDICATION
    document.querySelectorAll('input[name="food-medication-condition-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('food-allergy-medication-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
            }
        })
    });

    // OTHER KIND OF CONDITION(S) OR ISSUE(S)
    document.querySelectorAll('input[name="other-condition-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('other-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
            }
        })
    });

    // > OTHER KIND OF CONDITION(S) OR ISSUE(S) - FOLLOW UP CONDITION
    document.querySelectorAll('input[name="other-followup-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            if (e.target.value == "0") {
                displayNote(document.getElementById('other-condition-div'), "", 0)
            } else if (e.target.value == "1") {
                displayNote(document.getElementById('other-condition-div'), "treating memo", 1)
            }
        })
    });

    // > OTHER KIND OF CONDITION(S) OR ISSUE(S) - PROVIDE MEASURES
    document.querySelectorAll('input[name="affect-understand-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('focus-understand-div');
            if (e.target.value == "0") {
                if (document.querySelector('input[name="affect-focus-radio"]:checked') &&
                    document.querySelector('input[name="affect-focus-radio"]:checked').value == 0) {
                    targetElement.classList.add('optional-div');
                }
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
            }
        })
    });

    // > OTHER KIND OF CONDITION(S) OR ISSUE(S) - PROVIDE MEASURES
    document.querySelectorAll('input[name="affect-focus-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('focus-understand-div');
            if (e.target.value == "0") {
                if (document.querySelector('input[name="affect-understand-radio"]:checked') &&
                    document.querySelector('input[name="affect-understand-radio"]:checked').value == 0) {
                    targetElement.classList.add('optional-div');
                }

            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
            }
        })
    });

    // RADIO OTHER LABEL EVENT HANDLER
    document.querySelectorAll('.radio-other-label').forEach(button => {
        button.addEventListener("click", (e) => {
            const containerDiv = e.target.closest('.radio-others');
            if (containerDiv) {
                // Find the radio button within the container div
                const radioElement = containerDiv.querySelector('input[type="radio"]');
                if (radioElement && !radioElement.checked) {
                    radioElement.checked = true;
                    radioElement.dispatchEvent(new Event('change'));
                }
            }
        })
    });

    // RADIO OTHER INPUT EVENT HANDLER
    document.querySelectorAll('.radio-other-input').forEach(button => {
        button.addEventListener("input", (e) => {
            const containerDiv = e.target.closest('.radio-others');
            if (containerDiv) {
                // Find the radio button within the container div
                const radioElement = containerDiv.querySelector('input[type="radio"]');
                if (radioElement && !radioElement.checked) {
                    radioElement.checked = true;
                    radioElement.dispatchEvent(new Event('change'));
                }
            }
        })
    });

    // CHECKBOX OTHER LABEL EVENT HANDLER
    document.querySelectorAll('.checkbox-other-label').forEach(button => {
        button.addEventListener("click", (e) => {
            const containerDiv = e.target.closest('.checkbox-others');
            if (containerDiv) {
                // Find the checkbox button within the container div
                const checkboxElement = containerDiv.querySelector('input[type="checkbox"]');
                if (checkboxElement && !checkboxElement.checked) {
                    checkboxElement.checked = true;
                } else if (checkboxElement && checkboxElement.checked) {
                    checkboxElement.checked = false;
                    setTimeout(() => {
                        containerDiv.querySelector('input[type="text"]').blur();
                    }, 0);
                }
            }
        })
    });

    // CHECKBOX OTHER INPUT EVENT HANDLER
    document.querySelectorAll('.checkbox-other-input').forEach(button => {
        button.addEventListener("input", (e) => {
            const containerDiv = e.target.closest('.checkbox-others');
            if (containerDiv) {
                // Find the checkbox button within the container div
                const checkboxElement = containerDiv.querySelector('input[type="checkbox"]');
                if (checkboxElement && !checkboxElement.checked) {
                    checkboxElement.checked = true;
                }
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