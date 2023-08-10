window.addEventListener('DOMContentLoaded', () => {
    const schoolInput = document.getElementById('form-input-applicant-school');
    const raceInput = document.getElementById('form-input-applicant-race');
    const alertContainer = document.getElementById('alertbox');

    // === FETCHES ===

    fetch('/getSchools')
        .then((response) => {
            if (!response) {
                const error = new Error("Failed to load schools. Please try again later.");
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

    fetch('/getRaces')
        .then((response) => {
            if (!response) {
                const error = new Error("Failed to load races. Please try again later.");
                error.status = response.status;
                throw error;
            }
            return response.json();

        })
        .then((dataJson) => {
            populateRace(dataJson.result);
        })
        .catch((error) => {
            alertBox(error.message, 'danger');
        })

    // === FUNCTIONS ===

    const alertBox = (message, type) => {
        const alertIcon = document.getElementById('alert-icon');
        const alertMessage = document.getElementById('alert-message');
        let alertColor;

        if (type === 'danger') {
            alertIcon.setAttribute('xlink:href', '#exclamation-triangle-fill');
            alertColor = 'alert-danger';
        } else if (type === 'success') {
            alertIcon.setAttribute('xlink:href', '#check-circle-fill');
            alertColor = 'alert-success';
        } else if (type === 'warn') {
            alertIcon.setAttribute('xlink:href', '#exclamation-triangle-fill');
            alertColor = 'alert-warning';
        } else if (type === 'info') {
            alertIcon.setAttribute('xlink:href', '#info-fill');
            alertColor = 'alert-primary';
        }

        alertMessage.textContent = message;
        alertContainer.classList.add(alertColor)
        alertContainer.classList.add('alert-visible');
        alertContainer.classList.remove('alert-hidden');

        setTimeout(() => {
            alertContainer.classList.add('alert-hidden');
            alertContainer.classList.remove('alert-visible');
            alertContainer.classList.remove(alertColor);
        }, 5000);
    };

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

    const submitForm = (data) => {
        fetch('/obs-reg-form/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data })
        }).then((response) => {
            if (response.status != 200) {
                const error = new Error("Failed to submit form. Please try again later.");
                error.status = response.status
                throw error;
            }
            displayLanding();
        }).catch((error) => {
            alertBox(error.message, 'danger');
        })
    }

    const displayLanding = () => {
        const template = document.querySelector("#landing-template");
        const landingTemplateDiv = document.getElementsByClassName("container-fluid")[0];
        landingTemplateDiv.classList.add('landing')

        if (landingTemplateDiv) {
            while (landingTemplateDiv.firstChild) {
                landingTemplateDiv.removeChild(landingTemplateDiv.firstChild);
            }
        }

        const content = template.content.cloneNode(true);
        landingTemplateDiv.appendChild(content);
    }

    // PARENT VALIDATIONS
    const validateParentSection = () => {
        let sectionIsValid = true;

        let parentSectionInputs = {
            parentName: "form-input-name",
            parentEmail: "form-input-email",
            parentNumber: "form-input-contact",
            parentAltNumber: "form-input-alt-contact", // OPTIONAL
            parentRelation: "form-input-relation",
            parentIsEmergencyContact: "form-input-isEmergencyContact",
            emergencyName: "form-input-emergency-name", // *OPTIONAL
            emergencyNumber: "form-input-emergency-contact", // *OPTIONAL
            emergencyRelation: "form-input-emergency-relation", // *OPTIONAL
            emergencyAltNumber: "form-input-emergency-alt-contact" // OPTIONAL
        }

        let optionalFields = []
        let parentSectionValues = {};

        // SET VALUES
        for (const input in parentSectionInputs) {
            const inputEl = document.getElementById(parentSectionInputs[input]);
            inputEl.classList.remove("is-invalid");

            // YES-NO RADIO INPUT
            if (input == "parentIsEmergencyContact") {
                const radioButtons = document.querySelectorAll('input[name="emergency-radio"]');
                for (const radioButton of radioButtons) {
                    if (radioButton.checked) {
                        parentSectionValues[input] = radioButton.value;
                        break;
                    } else {
                        parentSectionValues[input] = "";
                    }
                }
            } else {
                parentSectionValues[input] = inputEl.value;
            }
        }

        // FILTER OPTIONAL FIELDS
        if (parentSectionValues.parentIsEmergencyContact != 0) {
            optionalFields.push("emergencyName", "emergencyNumber", "emergencyRelation", "emergencyAltNumber")
        }

        if (parentSectionValues.parentIsEmergencyContact == 0 && !parentSectionValues.emergencyAltNumber) {
            optionalFields.push("emergencyAltNumber")
        }

        if (!parentSectionValues.parentAltNumber) {
            optionalFields.push("parentAltNumber")
        }

        // VALIDATE FIELDS
        for (const input in parentSectionInputs) {
            const value = parentSectionValues[input]
            const inputEl = document.getElementById(parentSectionInputs[input]);
            inputEl.classList.remove("is-invalid");

            if (optionalFields.includes(input)) {
                parentSectionValues[input] = "";
            }

            if (input == "parentEmail") {
                if (!validator.isEmail(value)) {
                    inputEl.classList.add("is-invalid");
                    sectionIsValid = false;
                }
            }

            if (input == "parentNumber" || (input == "emergencyNumber" && !optionalFields.includes(input))) {
                let numberRegex = /^[986]\d{7}$/
                parentSectionValues[input] = value.replace(/\s/g, '');
                if (!numberRegex.test(value.replace(/\s/g, ''))) {
                    inputEl.classList.add("is-invalid");
                    sectionIsValid = false;
                }
            }

            if (!value && !optionalFields.includes(input)) {
                inputEl.classList.add("is-invalid");
                sectionIsValid = false;
            }
        }

        if (!sectionIsValid) {
            return sectionIsValid
        } else {
            return parentSectionValues
        }
    }

    // APPLICANT'S PERSONAL INFORMATION VALIDATIONS
    const validateApplicantSection = () => {
        let sectionIsValid = true;

        let applicantSectionInputs = {
            applicantId: "form-input-applicant-id",
            applicantName: "form-input-applicant-name",
            applicantSchool: "form-input-applicant-school",
            applicantClass: "form-input-applicant-class",
            applicantResidential: "form-input-applicant-residential",
            applicantDob: "form-input-applicant-dob",
            applicantRace: "form-input-applicant-race",
            applicantGender: "form-input-applicant-gender",
            applicantEmail: "form-input-applicant-email",
            applicantAddress: "form-input-applicant-address",
            applicantDiet: "form-input-applicant-diet",
        }

        let optionalFields = ["applicantDiet"]
        let applicantSectionValues = {};

        // SET VALUES
        for (const input in applicantSectionInputs) {
            const inputEl = document.getElementById(applicantSectionInputs[input]);
            inputEl.classList.remove("is-invalid");

            if (input == "applicantResidential") {
                const residentialRadioButtons = document.querySelectorAll('input[name="residential-radio"]');
                for (const radioButton of residentialRadioButtons) {
                    if (radioButton.checked) {
                        applicantSectionValues[input] = radioButton.value;
                        break;
                    } else {
                        applicantSectionValues[input] = "";
                    }
                }
            } else if (input == "applicantGender") {
                const genderRadioButtons = document.querySelectorAll('input[name="gender-radio"]');
                for (const radioButton of genderRadioButtons) {
                    if (radioButton.checked) {
                        applicantSectionValues[input] = radioButton.value;
                        break;
                    } else {
                        applicantSectionValues[input] = "";
                    }
                }
            } else if (input == "applicantDiet") {
                const dietCheckboxes = document.querySelectorAll('#form-input-applicant-diet input[type="checkbox"]');
                let dietArr;
                for (const checkbox of dietCheckboxes) {
                    if (checkbox.checked) {
                        if (!dietArr) { dietArr = []; }
                        dietArr.push(checkbox.value);
                    }
                }
                applicantSectionValues[input] = dietArr;
            } else {
                applicantSectionValues[input] = inputEl.value;
            }
        }

        // VALIDATE FIELDS
        for (const input in applicantSectionInputs) {
            const value = applicantSectionValues[input]
            const inputEl = document.getElementById(applicantSectionInputs[input]);

            if (input == "applicantEmail") {
                if (!validator.isEmail(value)) {
                    inputEl.classList.add("is-invalid");
                    sectionIsValid = false;
                }
            }

            if (!value && !optionalFields.includes(input)) {
                inputEl.classList.add("is-invalid");
                sectionIsValid = false;
            }
        }

        if (!sectionIsValid) {
            return sectionIsValid
        } else {
            return applicantSectionValues
        }
    }

    // APPLICANT'S HEALTH INFORMATION VALIDATIONS
    const validateHealthSection = () => {
        let sectionIsValid = true;

        let healthSectionInputs = {
            // HEALTH SECTION
            tetanusStatus: "form-input-hasTetanus",
            tetanusDate: "form-input-tetanus-date", //*OPTIONAL
            applicantHeight: "form-input-applicant-height",
            applicantWeight: "form-input-applicant-weight",
            applicantBmi: "form-input-applicant-bmi",

            //BREATHING SECTION
            breathingStatus: "form-input-hasBreathingCondi", //
            breathingCondition: "form-input-breathing-condition", //*OPTIONAL
            breathingDate: "form-input-breathing-date", //*OPTIONAL
            breathingMedicineStatus: "form-input-hasBreathingMedication", //*OPTIONAL
            breathingMedicineDetails: "form-input-medication-details", //*SUB OPTIONAL 
            breathingFollowup: "form-input-breathing-followup", //*OPTIONAL
            breathingExercise: "form-input-breathing-exercise", //*OPTIONAL

            //HEART SECTION
            heartStatus: "form-input-hasHeartCondi",
            heartCondition: "form-input-heart-condition", //*OPTIONAL
            heartFollowup: "form-input-heart-followup", //*OPTIONAL

            //BLOOD SECTION
            bloodStatus: "form-input-hasBloodCondi",
            bloodCondition: "form-input-blood-condition", //*OPTIONAL
            bloodOther: "form-input-blood-other", //*OPTIONAL
            bloodFollowup: "form-input-blood-followup", //*SUB OPTIONAL

            //EPILEPSY SECTION
            epilepsyStatus: "form-input-hasEpilepsyCondi",
            epilepsyEpisode: "form-input-epilepsy-past-months", //*OPTIONAL
            epilepsyMedication: "form-input-epilepsy-medication", //*OPTIONAL
            epilepsyFollowup: "form-input-epilepsy-followup", //*OPTIONAL

            //BONE SECTION
            boneStatus: "form-input-hasBoneCondi",
            boneCondition: "form-input-bone-condition", //*OPTIONAL
            boneDate: "form-input-bone-date", //*OPTIONAL
            boneFollowup: "form-input-bone-followup", //*OPTIONAL
            boneRecovered: "form-input-bone-recovered", //*SUB OPTIONAL
            boneInformation: "form-input-bone-information", //*SUB INNER OPTIONAL

            // BEHAVIOURAL SECTION
            behaviouralStatus: "form-input-hasBehaviouralCondi",
            behaviouralCondition: "form-input-behavioural-condition", //*OPTIONAL
            behaviouralFollowup: "form-input-behavioural-followup", //*OPTIONAL
            specialistProgress: "form-input-behavioural-specialist-progress", //*SUB OPTIONAL
            homeBehaviour: "form-input-behavioural-home", //*SUB OPTIONAL
            outdoorExperience: "form-input-behavioural-experience", //*SUB OPTIONAL
            riskAcknowledgement: "form-input-behavioural-risk-acknowledgement",  //*OPTIONAL
            participationAcknowledgement: "form-input-participation-risk-acknowledgement",  //*OPTIONAL

            // LONG TERM MEDICATION SECTION
            longMedicationStatus: "form-input-hasMedication",
            longMedicationDetails: "form-input-medication", //*OPTIONAL

            // LONG TERM MEDICATION SECTION
            diseaseStatus: "form-input-hasDisease",
            diseaseDetails: "form-input-disease", //*OPTIONAL

            // SLEEP WALK SECTION
            sleepwalkStatus: "form-input-hasSleepWalk",
            sleepwalkDate: "form-input-sleepwalk-date", //*OPTIONAL

            // ALLERGY RISK ACKNOWLEDGEMENT
            allergyRiskAcknowledgement: "form-input-allergy-risk-acknowledgement",

            // MEDICATION ALLERGIES
            medicationAllergyStatus: "form-input-hasMedicationAllergy",
            medicationName: "form-input-medication-name", //*OPTIONAL

            // ENVIRONMENTAL ALLERGIES
            environmentAllergyStatus: "form-input-hasEnvironmentalAllergy",
            environmentCondition: "form-input-environmental-allergy", //*OPTIONAL
            environmentOther: "form-input-environment-other", //*OPTIONAL
            environmentDetails: "form-input-environment-details", //*OPTIONAL
            environmentMedicineStatus: "form-input-hasAllergyMedication", //*OPTIONAL
            environmentMedicineDetails: "form-input-allergy-medication", //*SUB OPTIONAL

            // FOOD ALLERGIES
            foodAllergyStatus: "form-input-hasFoodAllergy",
            foodCondition: "form-input-food-allergy", //*OPTIONAL
            foodOther: "form-input-food-other", //*OPTIONAL
            foodDetails: "form-input-food-details", //*OPTIONAL
            foodTraces: "form-input-food-traces", //*OPTIONAL
            foodMedicineStatus: "form-input-hasFoodAllergyMedication", //*OPTIONAL
            foodMedicineDetails: "form-input-food-allergy-medication", //*SUB OPTIONAL

            // NOT LISTED CONDITIONS
            otherConditionStatus: "form-input-hasOtherConditions",
            otherConditionDetails: "form-input-other-details", //*OPTIONAL
            otherDiagnosedDate: "form-input-diagnosed-date", //*OPTIONAL
            otherPhysicalEngagement: "form-input-physical-engagement", //*OPTIONAL
            otherTriggerFactor: "form-input-condition-trigger", //*OPTIONAL
            otherMeasures: "form-input-precautionary-measures", //*OPTIONAL
            otherMedication: "form-input-medical-equipment", //*OPTIONAL
            otherFollowup: "form-input-other-followup", //*OPTIONAL
            otherFocusAbility: "form-input-affect-focus", //*OPTIONAL
            otherUnderstandAbility: "form-input-affect-understand", //*OPTIONAL
            otherHelp: "form-input-focus-understand" //*SUB OPTIONAL
        }

        let optionalFields = []
        let healthSectionValues = {};

        // SET VALUES
        for (const input in healthSectionInputs) {
            const inputEl = document.getElementById(healthSectionInputs[input]);
            inputEl.classList.remove("is-invalid");

            if (input == "tetanusStatus" || input == "breathingStatus" || input == "breathingMedicineStatus" || input == "breathingFollowup" ||
                input == "breathingExercise" || input == "heartStatus" || input == "heartFollowup" || input == "bloodStatus" || input == "bloodFollowup" ||
                input == "epilepsyStatus" || input == "epilepsyEpisode" || input == "epilepsyMedication" || input == "epilepsyFollowup" || input == "boneStatus" ||
                input == "boneFollowup" || input == "boneRecovered" || input == "behaviouralStatus" || input == "behaviouralFollowup" || input == "longMedicationStatus" || input == "diseaseStatus" ||
                input == "sleepwalkStatus" || input == "medicationAllergyStatus" || input == "environmentAllergyStatus" || input == "environmentMedicineStatus" ||
                input == "foodAllergyStatus" || input == "foodMedicineStatus" || input == "otherConditionStatus" || input == "otherFollowup" || input == "otherFocusAbility" ||
                input == "otherUnderstandAbility") {
                const radioButtons = document.querySelectorAll(`.${input} input[type="radio"]`);

                for (const radioButton of radioButtons) {
                    if (radioButton.checked) {
                        healthSectionValues[input] = radioButton.value;
                        break;
                    } else {
                        healthSectionValues[input] = "";
                    }
                }
            } else if (input == "bloodCondition" || input == "foodTraces") {
                const radioButtons = document.querySelectorAll(`#${healthSectionInputs[input]} input[type="radio"]`);
                for (const radioButton of radioButtons) {
                    if (radioButton.checked) {
                        healthSectionValues[input] = radioButton.value;
                        break;
                    } else {
                        healthSectionValues[input] = "";
                    }
                }
            } else if (input == "riskAcknowledgement" || input == "participationAcknowledgement" || input == "allergyRiskAcknowledgement") { // ack checkboxes
                const checkBoxes = document.querySelectorAll(`.${input} input[type="checkbox"]`);
                for (const checkbox of checkBoxes) {
                    if (checkbox.checked) {
                        healthSectionValues[input] = checkbox.value;
                        break;
                    } else {
                        healthSectionValues[input] = "";
                    }
                }
            } else if (input == "environmentCondition" || input == "foodCondition") { //multi checkboxes
                const checkBoxes = document.querySelectorAll(`#${healthSectionInputs[input]} input[type="checkbox"]`);
                let checkboxArr;
                for (const checkbox of checkBoxes) {
                    if (checkbox.checked) {
                        if (!checkboxArr) { checkboxArr = []; }
                        checkboxArr.push(checkbox.value);
                    }
                }
                healthSectionValues[input] = checkboxArr;
            } else {
                healthSectionValues[input] = inputEl.value;
            }
        }

        if (healthSectionValues.bloodCondition == "Others" && healthSectionValues.bloodOther) {
            healthSectionValues.bloodCondition = healthSectionValues.bloodOther;
        }

        if (healthSectionValues.environmentCondition && (healthSectionValues.environmentCondition.includes("Others") && healthSectionValues.environmentOther)) {
            const index = healthSectionValues.environmentCondition.indexOf("Others");
            if (index !== -1) {
                healthSectionValues.environmentCondition.splice(index, 1);
            }
            healthSectionValues.environmentCondition.push(healthSectionValues.environmentOther);
        }

        if (healthSectionValues.foodCondition && (healthSectionValues.foodCondition.includes("Others") && healthSectionValues.foodOther)) {
            const index = healthSectionValues.foodCondition.indexOf("Others");
            if (index !== -1) {
                healthSectionValues.foodCondition.splice(index, 1);
            }
            healthSectionValues.foodCondition.push(healthSectionValues.foodOther);
        }

        // FILTER OPTIONAL FIELDS
        if (healthSectionValues.tetanusStatus != 1) {
            optionalFields.push("tetanusDate")
        }

        if (healthSectionValues.breathingStatus != 1) {
            optionalFields.push("breathingCondition", "breathingDate", "breathingMedicineStatus", "breathingMedicineDetails", "breathingFollowup", "breathingExercise")
        } else if (healthSectionValues.breathingMedicineStatus == 0) {
            optionalFields.push("breathingMedicineDetails")
        }

        if (healthSectionValues.heartStatus != 1) {
            optionalFields.push("heartCondition", "heartFollowup")
        }

        if (healthSectionValues.bloodStatus == 1 && healthSectionValues.bloodCondition.includes("Thalassaemia")) {
            optionalFields.push("bloodOther", "bloodFollowup")
        } else if (healthSectionValues.bloodStatus == 1 && !healthSectionValues.bloodCondition.includes("Other")) {
            optionalFields.push("bloodOther")
        } else if (healthSectionValues.bloodStatus != 1) {
            optionalFields.push("bloodCondition", "bloodOther", "bloodFollowup")
        }

        if (healthSectionValues.epilepsyStatus != 1) {
            optionalFields.push("epilepsyEpisode", "epilepsyMedication", "epilepsyFollowup")
        } else if (healthSectionValues.epilepsyStatus == 1 && !(healthSectionValues.epilepsyEpisode == 0 && healthSectionValues.epilepsyMedication == 0)) {
            optionalFields.push("epilepsyFollowup")
        }

        if (healthSectionValues.boneStatus != 1) {
            optionalFields.push("boneCondition", "boneDate", "boneFollowup", "boneRecovered", "boneInformation")
        } else if (healthSectionValues.boneFollowup == 1) {
            optionalFields.push("boneRecovered", "boneInformation")
        } else if (healthSectionValues.boneRecovered == 1) {
            optionalFields.push("boneInformation")
        }

        if (healthSectionValues.behaviouralStatus != 1) {
            optionalFields.push("behaviouralCondition", "behaviouralFollowup", "specialistProgress", "homeBehaviour",
                "outdoorExperience", "riskAcknowledgement", "participationAcknowledgement")
        } else if (healthSectionValues.behaviouralStatus == 1 && healthSectionValues.behaviouralFollowup == 0) {
            optionalFields.push("specialistProgress", "homeBehaviour", "outdoorExperience")
        }

        if (healthSectionValues.longMedicationStatus != 1) {
            optionalFields.push("longMedicationDetails")
        }

        if (healthSectionValues.diseaseStatus != 1) {
            optionalFields.push("diseaseDetails")
        }

        if (healthSectionValues.sleepwalkStatus != 1) {
            optionalFields.push("sleepwalkDate")
        }

        if (healthSectionValues.medicationAllergyStatus != 1) {
            optionalFields.push("medicationName")
        }

        if (healthSectionValues.environmentAllergyStatus != 1) {
            optionalFields.push("environmentCondition", "environmentOther", "environmentDetails", "environmentMedicineStatus",
                "environmentMedicineDetails")
        } else if (!healthSectionValues.environmentCondition || !healthSectionValues.environmentCondition.includes("Others")) {
            optionalFields.push("environmentOther");
        }

        if (healthSectionValues.environmentAllergyStatus == 1 && healthSectionValues.environmentMedicineStatus == 0) {
            optionalFields.push("environmentMedicineDetails")
        }

        if (healthSectionValues.foodAllergyStatus != 1) {
            optionalFields.push("foodCondition", "foodOther", "foodDetails", "foodTraces", "foodMedicineStatus", "foodMedicineDetails")
        } else if (!healthSectionValues.foodCondition || !healthSectionValues.foodCondition.includes("Others")) {
            optionalFields.push("foodOther");
        }

        if (healthSectionValues.foodAllergyStatus == 1 && healthSectionValues.foodMedicineStatus == 0) {
            optionalFields.push("foodMedicineDetails")
        }

        if (healthSectionValues.environmentAllergyStatus == 0 && healthSectionValues.medicationAllergyStatus == 0 && healthSectionValues.foodAllergyStatus == 0) {
            optionalFields.push("allergyRiskAcknowledgement")
        }

        if (healthSectionValues.otherConditionStatus != 1) {
            optionalFields.push("otherConditionDetails", "otherDiagnosedDate", "otherPhysicalEngagement", "otherTriggerFactor", "otherMeasures", "otherFollowup",
                "otherFocusAbility", "otherUnderstandAbility", "otherHelp", "otherMedication")
        } else if (!healthSectionValues.otherFocusAbility && !healthSectionValues.otherUnderstandAbility) {
            optionalFields.push("otherHelp")
        }

        if (healthSectionValues.otherConditionStatus == 1 && !healthSectionValues.otherMedication) {
            optionalFields.push("otherMedication")
        }

        // VALIDATE FIELDS
        for (const input in healthSectionInputs) {
            const value = healthSectionValues[input]
            const inputEl = document.getElementById(healthSectionInputs[input]);
            if (optionalFields.includes(input)) {
                healthSectionValues[input] = "";
            }

            if (!value && !optionalFields.includes(input)) {
                inputEl.classList.add("is-invalid");
                sectionIsValid = false;
            }
        }

        delete healthSectionValues.bloodOther;
        delete healthSectionValues.environmentOther;
        delete healthSectionValues.foodOther;

        if (!sectionIsValid) {
            return sectionIsValid
        } else {
            return healthSectionValues
        }
    }

    // DECLARATION AND ACKNOWLEDGEMENT VALIDATIONS
    const validateDeclaration = () => {
        let sectionIsValid = true;

        let declarationSectionInputs = {
            informationDeclaration: "form-input-information-declaration",
            medicalDeclaration: "form-input-medical-declaration",
            allRiskAcknowledgement: "form-input-risk-acknowledgement",
            contentDisclosure: "form-input-collection-acknowledgement",
            disagreeEvents: "form-input-events-declaration",
            disagreeMedia: "form-input-photo-declaration"
        }

        let optionalFields = ["disagreeEvents", "disagreeMedia"]
        let declarationSectionValues = {};

        // SET VALUES
        for (const input in declarationSectionInputs) {
            const inputEl = document.getElementById(declarationSectionInputs[input]).closest('.checkbox-check');
            const checkbox = document.getElementById(declarationSectionInputs[input])
            checkbox.checked ? declarationSectionValues[input] = 1 : declarationSectionValues[input] = 0;
            inputEl.classList.remove("is-invalid");
        }

        // VALIDATE FIELDS
        for (const input in declarationSectionInputs) {
            const value = declarationSectionValues[input]
            const inputEl = document.getElementById(declarationSectionInputs[input]).closest('.checkbox-check');
            if (!value && !optionalFields.includes(input)) {
                inputEl.classList.add("is-invalid");
                sectionIsValid = false;
            }
        }

        if (!sectionIsValid) {
            return sectionIsValid
        } else {
            return declarationSectionValues
        }
    }

    // === INPUT VALIDATIONS ===

    const validateEmail = (target) => {
        if (!target.value && target.classList.contains("required-field") || !validator.isEmail(target.value)) {
            target.classList.add("is-invalid");
        } else {
            target.classList.remove("is-invalid");
        }
    }

    const validateContact = (target) => {
        let numberRegex = /^[986]\d{7}$/
        let value = target.value.replace(/\s/g, '');
        if (!value && target.classList.contains("required-field") ||
            (!numberRegex.test(value) && target.classList.contains("required-field"))) {
            target.classList.add("is-invalid");
        } else {
            target.classList.remove("is-invalid");
        }

        const inputValue = target.value;
        const digitsOnly = inputValue.replace(/\D/g, '');
        const formattedValue = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
        target.value = formattedValue;
    }

    const validateInputTextNumbers = (target) => {
        if (!target.value && target.classList.contains("required-field")) {
            target.classList.add("is-invalid");
        } else {
            target.classList.remove("is-invalid");
        }
    }

    const validateRadio = (target) => {
        if (target.classList.contains("yesno-radio")) {
            if (!target.value) {
                target.closest('.btn-group').classList.add("is-invalid");
            } else {
                target.closest('.btn-group').classList.remove("is-invalid");
            }

        } else if (!target.value) {
            target.closest('.radio-field').classList.add("is-invalid");
        } else {
            target.closest('.radio-field').classList.remove("is-invalid");;
        }


    }

    const validateDate = (target) => {
        if (!target.value && target.classList.contains("required-field")) {
            target.classList.add("is-invalid");
        } else {
            target.classList.remove("is-invalid");
        }
    }

    const validateInputSelect = (target) => {
        if (!target.value && target.classList.contains("required-field")) {
            target.classList.add("is-invalid");
        } else {
            target.classList.remove("is-invalid");
        }
    }

    const validateCheckbox = (target) => {
        if (!target.checked) {
            const checkboxField = target.closest('.checkbox-field');
            if (checkboxField) {
                const getChecked = checkboxField.querySelectorAll('input[type="checkbox"]:checked');
                if (getChecked.length < 1) {
                    target.closest('.checkbox-field').classList.add("is-invalid");
                }
            }
        } else {
            const checkboxField = target.closest('.checkbox-field');
            if (checkboxField) {
                checkboxField.classList.remove("is-invalid");;
            }
        }
    }

    // === EVENT HANDLERS ===

    document.getElementById('submit-button').onclick = (e) => {
        e.preventDefault();
        let parentValidation = validateParentSection();
        let applicantValidation = validateApplicantSection();
        let healthValidation = validateHealthSection();
        let declarationValidation = validateDeclaration();

        // console.log(parentValidation)
        // console.log(applicantValidation)
        // console.log(healthValidation)
        // console.log(declarationValidation)

        if (!parentValidation || !applicantValidation || !healthValidation || !declarationValidation) {
            const yOffset = -400;
            const element = document.getElementsByClassName("is-invalid")[0]
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'instant' });
        } else {
            let formData = {
                parentData: parentValidation,
                applicantData: applicantValidation,
                healthData: healthValidation,
                declarationData: declarationValidation
            }
            submitForm(formData);
        }
    }

    document.querySelectorAll('input[type=text]').forEach(element => {
        if (element.id.includes('email')) {
            element.addEventListener('input', (e) => {
                validateEmail(e.target)
            })
        } else if (element.id.includes('contact')) {
            element.addEventListener('input', (e) => {
                validateContact(e.target)
            })
        } else {
            element.addEventListener('input', (e) => {
                validateInputTextNumbers(e.target)
            })
        }

    });

    document.querySelectorAll('input[type=number]').forEach(element => {
        element.addEventListener('input', (e) => {
            validateInputTextNumbers(e.target)
        })
    });

    document.querySelectorAll('input[type=radio]').forEach(element => {
        element.addEventListener('change', (e) => {
            validateRadio(e.target)
        })
    });

    document.querySelectorAll('input[type=date]').forEach(element => {
        element.addEventListener('input', (e) => {
            validateDate(e.target)
        })
    });

    document.querySelectorAll('select').forEach(element => {
        element.addEventListener('change', (e) => {
            validateInputSelect(e.target)
        })
    });

    document.querySelectorAll('input[type=checkbox]').forEach(element => {
        element.addEventListener('change', (e) => {
            validateCheckbox(e.target)
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

    // RADIO DOT EVENT HANDLER 
    document.querySelectorAll('.radio-others input[type="radio"]').forEach(button => {
        button.addEventListener("click", (e) => {
            const containerDiv = e.target.closest('.radio-others');
            if (e.target.checked) {
                setTimeout(() => {
                    containerDiv.querySelector('input[type="text"]').focus();
                }, 0);
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
                const checkboxElement = containerDiv.querySelector('input[type="checkbox"]');
                if (checkboxElement && !checkboxElement.checked) {
                    checkboxElement.checked = true;
                } else if (checkboxElement && checkboxElement.checked) {
                    checkboxElement.checked = false;
                    setTimeout(() => {
                        containerDiv.querySelector('input[type="text"]').blur();
                    }, 0);
                }
                checkboxElement.dispatchEvent(new Event('change'));
            }
        })
    });

    // CHECKBOX BOX EVENT HANDLER
    document.querySelectorAll('.checkbox-others input[type="checkbox"]').forEach(button => {
        button.addEventListener("change", (e) => {
            const containerDiv = e.target.closest('.checkbox-others');
            if (!e.target.checked) {
                containerDiv.querySelector('input[type="text"]').classList.remove("is-invalid");
            } else {
                setTimeout(() => {
                    containerDiv.querySelector('input[type="text"]').focus();
                }, 0);
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
                checkboxElement.dispatchEvent(new Event('change'));
            }
        })
    });

    const handleParallax = () => {
        const titleRow = document.querySelector(".title-row");
        const scrollValue = window.scrollY;

        titleRow.style.backgroundPositionY = -scrollValue * 0.4 + "px";
    }

    window.addEventListener("scroll", handleParallax);


    // === OPTIONAL DIV HANDLERS ===

    // EMERGENCY CONTACT
    document.querySelectorAll('input[name="emergency-radio"]').forEach(button => {
        const subFields = ["form-input-emergency-name", "form-input-emergency-contact", "form-input-emergency-relation"]
        button.addEventListener("change", (e) => {

            const targetElement = document.getElementById('emergency-contact-div');

            if (e.target.value == "1") {
                targetElement.classList.add('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });

            } else if (e.target.value == "0") {
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // TETANUS VACCINATION
    document.querySelectorAll('input[name="tetanus-radio"]').forEach(button => {
        const subFields = ["form-input-tetanus-date"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('tetanus-date-div');
            const targetElement2 = document.getElementById('tetanus-note-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');
                targetElement2.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });

            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
                targetElement2.classList.add('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // BREATHING CONDITION
    document.querySelectorAll('input[name="breathing-condition-radio"]').forEach(button => {
        const subFields = ["form-input-breathing-date", "form-input-breathing-condition"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('breathing-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // > BREATHING CONDITION - MEDICATION
    document.querySelectorAll('input[name="hasBreathingMedication-radio"]').forEach(button => {
        const subFields = ["form-input-medication-details"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('breathing-medication-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // BREATHING CONDITION - FOLLOWUP CONDITION
    document.querySelectorAll('input[name="breathing-followup-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            if (e.target.value == "0") {
                // remove template
                displayNote(document.getElementById('breathing-condition-div'), "", 0)
            } else if (e.target.value == "1") {
                // add template
                displayNote(document.getElementById('breathing-condition-div'), "specialist memo", 1)
            }
        })
    });

    // HEART CONDITION
    document.querySelectorAll('input[name="heart-condition-radio"]').forEach(button => {
        const subFields = ["form-input-heart-condition", "form-input-heart-followup"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('heart-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // > HEART CONDITION - FOLLOWUP CONDITION
    document.querySelectorAll('input[name="heart-followup-radio"]').forEach(button => {
        button.addEventListener("change", (e) => {
            if (e.target.value == "0") {
                // remove template
                displayNote(document.getElementById('heart-condition-div'), "", 0)
            } else if (e.target.value == "1") {
                // add template
                displayNote(document.getElementById('heart-condition-div'), "specialist memo", 1)
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
        const subFields = ["form-input-blood-other"]

        button.addEventListener("change", (e) => {
            if (e.target.value == "Anaemia" || e.target.value == "Others") { // ANAEMIA / OTHERS
                displayNote(document.getElementById('blood-condition-div'), "", 0)
                if (document.querySelector('input[name="blood-followup-radio"]:checked') != null &&
                    document.querySelector('input[name="blood-followup-radio"]:checked').value == 1) {
                    displayNote(document.getElementById('blood-condition-div'), "specialist memo", 1)
                }
                document.getElementById('blood-followup-div').classList.remove('optional-div');
            } else if (e.target.value == "Thalassaemia major") { // T MAJOR
                displayNote(document.getElementById('blood-condition-div'), "unable to enrol", 1)
                document.getElementById('blood-followup-div').classList.add('optional-div');
            } else if (e.target.value == "Thalassaemia minor") { // T MINOR
                displayNote(document.getElementById('blood-condition-div'), "", 0)
                document.getElementById('blood-followup-div').classList.add('optional-div');
            }

            if (e.target.value != "Others") {
                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.remove('required-field')
                });
            } else {
                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
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
        const subFields = ["form-input-bone-date", "form-input-bone-condition", "form-input-bone-followup"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('bone-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // > BONE / JOINT/ TENDON CONDITION - FOLLOW UP CONDITION
    document.querySelectorAll('input[name="bone-followup-radio"]').forEach(button => {
        const subFields = ["form-input-bone-information"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('bone-followup-div');
            if (e.target.value == "0") {
                // remove template
                displayNote(document.getElementById('bone-condition-div'), "", 0)
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });
            } else if (e.target.value == "1") {
                // add template
                displayNote(document.getElementById('bone-condition-div'), "physiotherapist memo", 1)
                targetElement.classList.add('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // > > BONE / JOINT/ TENDON CONDITION - RECOVERED DETAILS
    document.querySelectorAll('input[name="bone-recovered-radio"]').forEach(button => {
        const subFields = ["form-input-bone-information"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('bone-recovered-div');
            if (e.target.value == "0") {
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            } else if (e.target.value == "1") {
                targetElement.classList.add('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });
            }
        })
    });

    // BEHAVIOURAL OR PSYCHOLOGICAL CONDITION
    document.querySelectorAll('input[name="behavioural-condition-radio"]').forEach(button => {
        const subFields = ["form-input-behavioural-condition"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('behavioural-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // > BEHAVIOURAL OR PSYCHOLOGICAL CONDITION - FOLLOW UP CONDITION
    document.querySelectorAll('input[name="behavioural-followup-radio"]').forEach(button => {
        const subFields = ["form-input-behavioural-experience", "form-input-behavioural-specialist-progress", "form-input-behavioural-home"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('behavioural-specialist-progress-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // LONG TERM PRESCRIBTION MEDICATION
    document.querySelectorAll('input[name="medication-condition-radio"]').forEach(button => {
        const subFields = ["form-input-medication"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('medication-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // CARRIER STATUS FOR ANY INFECTIOUS DISEASE
    document.querySelectorAll('input[name="disease-condition-radio"]').forEach(button => {
        const subFields = ["form-input-disease"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('disease-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // SLEEP WALKING
    document.querySelectorAll('input[name="sleepwalk-condition-radio"]').forEach(button => {
        const subFields = ["form-input-sleepwalk-date"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('sleepwalk-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // ALLERGY OR ADVERSE REACTIONS TO MEDICATIONS
    document.querySelectorAll('input[name="medication-allergy-condition-radio"]').forEach(button => {
        const subFields = ["form-input-medication-name"]
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

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });

            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
                riskAcknowledgement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // ALLERGY TO ENVIRONMENTAL FACTOR(S)
    document.querySelectorAll('input[name="environmental-allergy-condition-radio"]').forEach(button => {
        const subFields = ["form-input-environmental-allergy", "form-input-environment-other", "form-input-environment-details",
            "form-input-hasAllergyMedication"]
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

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
                riskAcknowledgement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // > ALLERGY TO ENVIRONMENTAL FACTOR(S) - ALLERGY MEDICATION
    document.querySelectorAll('input[name="environmental-medication-condition-radio"]').forEach(button => {
        const subFields = ["form-input-allergy-medication"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('allergy-medication-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // ALLERGY TO FOOD ITEM(S) / INGREDIENT(S)
    document.querySelectorAll('input[name="food-allergy-condition-radio"]').forEach(button => {
        const subFields = ["form-input-food-allergy", "form-input-food-other", "form-input-food-details", "form-input-food-traces",
            "form-input-hasFoodAllergyMedication"]
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

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');
                riskAcknowledgement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // > ALLERGY TO FOOD ITEM(S) - ALLERGY MEDICATION
    document.querySelectorAll('input[name="food-medication-condition-radio"]').forEach(button => {
        const subFields = ["form-input-food-allergy-medication"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('food-allergy-medication-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // OTHER KIND OF CONDITION(S) OR ISSUE(S)
    document.querySelectorAll('input[name="other-condition-radio"]').forEach(button => {
        const subFields = ["form-input-other-details", "form-input-diagnosed-date", "form-input-physical-engagement", "form-input-condition-trigger", "form-input-precautionary-measures"
            , "form-input-other-followup", "form-input-affect-focus", "form-input-affect-understand"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('other-condition-div');
            if (e.target.value == "0") {
                targetElement.classList.add('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove('required-field')
                });
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
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
        const subFields = ["form-input-focus-understand"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('focus-understand-div');
            if (e.target.value == "0") {
                if (document.querySelector('input[name="affect-focus-radio"]:checked') &&
                    document.querySelector('input[name="affect-focus-radio"]:checked').value == 0) {
                    targetElement.classList.add('optional-div');

                    subFields.forEach(element => {
                        document.getElementById(element).classList.remove('required-field')
                    });
                }
            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });

    // > OTHER KIND OF CONDITION(S) OR ISSUE(S) - PROVIDE MEASURES
    document.querySelectorAll('input[name="affect-focus-radio"]').forEach(button => {
        const subFields = ["form-input-focus-understand"]
        button.addEventListener("change", (e) => {
            const targetElement = document.getElementById('focus-understand-div');
            if (e.target.value == "0") {
                if (document.querySelector('input[name="affect-understand-radio"]:checked') &&
                    document.querySelector('input[name="affect-understand-radio"]:checked').value == 0) {
                    targetElement.classList.add('optional-div');

                    subFields.forEach(element => {
                        document.getElementById(element).classList.remove('required-field')
                    });
                }

            } else if (e.target.value == "1") {
                targetElement.classList.remove('optional-div');

                subFields.forEach(element => {
                    document.getElementById(element).classList.remove("is-invalid");
                    document.getElementById(element).classList.add('required-field')
                });
            }
        })
    });
})