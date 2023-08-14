const conn = require("../database");
const { query } = conn;

module.exports.submitRegForm = function submitRegForm(data) {
  const columns = [
    "raceId", "parentName", "parentEmail", "parentNo", "altParentNo", "relationToApplicant", "isYouEmergencyContact",
    "emergencyContactName", "emergencyContactNo", "relationToEmergencyContact", "altEmergencyContactNo", "applicantNRIC", "applicantName",
    "applicantSchool", "applicantClass", "applicantResidentialStatus", "applicantDOB", "applicantGender", "applicantEmail", "applicantAddr",
    "applicantDietary", "isApplicantVaccinationValid", "applicantVaccinationDate", "applicantHeight", "applicantWeight", "applicantBMI",
    "isBreathingCondition", "diagnosisBreathing", "lastDateBreathing", "isOnBreathingMeds", "stateBreathingMeds", "isBreathingSpecialist",
    "isBreathingExercise", "isHeartCondition", "stateHeartCondition", "isHeartSpecialist", "isBloodCondition", "diagnosisBlood", "isBloodSpecialist",
    "isEpilepsyCondition", "isEpliepsyEpisode", "isOnEpliepsyMeds", "isEpliepsySpecialist", "isBoneCondition", "stateBoneCondition", "dateOfBoneCondition",
    "isBoneSpecialist", "isBoneFullyRecovered", "furtherInfoOnBone", "isBehaviouralCondition", "stateBehaviouralCondition", "isBehaviouralSpecialist", "progressOfTreatingBehavioural",
    "stateBehaviouralAtHome", "stateBehaviouralHelpTips", "isAcceptSafetyRisks", "isAcceptParticipation", "isOnLongTermMeds", "stateLongTermMeds", "isInfectiousCondition",
    "stateInfectiousCondition", "isSleepWalking", "lastDateSleepWalking", "isAllergicToMeds", "stateAllergicToMeds", "isAllergicToEnvironment",
    "stateAllergicToEnvironment", "stateDetailsEnvironmentTriggers", "isMedsStopAllergic", "stateMedsStopAllergic", "isAllergicToFood",
    "stateAllergicToFood", "stateDetailsFoodTriggers", "isAbleToTakeTraces", "isMedsStopTracers", "stateMedsStopTracers", "isAcceptAllergyRisks",
    "isOtherCondition", "stateOtherCondition", "dateOfOtherCondition", "stateOtherConditionAffectsPhysical", "stateTriggerOtherCondition",
    "statePrecautionOtherCondition", "stateMedsOtherCondition", "isOtherConditionSpecialist", "isOtherConditionAffectFocus",
    "isOtherConditionAffectUnderstanding", "stateDetailsOtherConditionAffect", "isAcceptDeclartion", "isAcceptMedicalDeclaration",
    "isAcceptAllRisk", "isAcceptPersonalData", "isDeclineUseOfContactInfo", "isDeclineUseOfPhoto"
  ];

  const values = columns.map(column => {
    if (Array.isArray(data[column])) {
      // Convert array to comma-separated string
      return data[column].join(",");
    } else {
      return data[column];
    }
  });

  const valuesPlaceholder = Array(values.length).fill("?").join(", ");
  const columnsJoined = columns.join(", ");
  const sql = `INSERT INTO registrationForm (${columnsJoined}) VALUES (${valuesPlaceholder})`;

  return query(sql, values)
    .then((result) => {
      const row = result[0];
      if (row.length === 0) {
        const error = new Error("Invalid URL");
        error.status = 401;
        throw error;
      }
      return row.affectedRows;
    })
    .catch((error) => {
      console.log(error)
    });
};

