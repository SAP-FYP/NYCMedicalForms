const { query } = require('./database'); // Import from db.js

//////////////////////////////////////////////////////
// CREATE TABLES
//////////////////////////////////////////////////////
const CREATE_TABLE_SQL = `
    CREATE TABLE IF NOT EXISTS user (
    email VARCHAR(255) NOT NULL,
    nameOfUser VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    contactNo INT NOT NULL,
    groupId INT NOT NULL,
    created_at DATETIME NOT NULL,
    isDisabled BOOLEAN NOT NULL DEFAULT FALSE,
    isDeleted BOOLEAN NOT NULL DEFAULT FALSE,
    invalidationDate DATETIME,
    passwordUpdated DATETIME,
    roleId INT NOT NULL,
    PRIMARY KEY (email)
    );

    CREATE TABLE IF NOT EXISTS role (
    roleId INT NOT NULL AUTO_INCREMENT,
    roleName VARCHAR(255) NOT NULL,
    PRIMARY KEY (roleId)
    );

    CREATE TABLE IF NOT EXISTS \`group\` (
    groupId INT NOT NULL AUTO_INCREMENT,
    groupName VARCHAR(255) NOT NULL UNIQUE,
    PRIMARY KEY (groupId)
    );

    CREATE TABLE IF NOT EXISTS groupPerm (
    groupId INT NOT NULL ,
    permsId INT NOT NULL,
    PRIMARY KEY (groupId, permsId)
    );

    CREATE TABLE IF NOT EXISTS permission (
    permsId INT NOT NULL AUTO_INCREMENT,
    permsName VARCHAR(255) NOT NULL UNIQUE,
    permsDescription VARCHAR(255) NOT NULL,
    PRIMARY KEY (permsId)
    );

    CREATE TABLE IF NOT EXISTS doctor (
    doctorMCR VARCHAR(255) NOT NULL,
    nameOfDoctor VARCHAR(255) NOT NULL,
    signature BLOB NOT NULL,
    nameOfClinic VARCHAR(255) NOT NULL,
    clinicAddress VARCHAR(255) NOT NULL,
    contactNo INT NOT NULL,
    PRIMARY KEY (doctorMCR)
    );

    CREATE TABLE IF NOT EXISTS student (
    studentId INT NOT NULL AUTO_INCREMENT,
    studentNRIC VARCHAR(9) NOT NULL,
    nameOfStudent VARCHAR(255) NOT NULL,
    class VARCHAR(255) NOT NULL,  
    school VARCHAR(255) NOT NULL,
    dateOfBirth DATE NOT NULL,
    dateOfVaccination VARCHAR(255) NOT NULL,
    PRIMARY KEY (studentId)  
    );

    CREATE TABLE IF NOT EXISTS parentAcknowledgement (
    studentId INT NOT NULL AUTO_INCREMENT,
    parentNRIC VARCHAR(9) NULL,
    nameOfParent VARCHAR(255) NULL,
    parentEmail VARCHAR(255) NOT NULL,
    parentSignature BLOB NULL,
    dateOfAcknowledgement DATE NULL,
    parentContactNo INT NULL,
    statusOfAcknowledgement VARCHAR(50) NOT NULL  DEFAULT 'Pending Parent',
    PRIMARY KEY (studentId)
    );

    CREATE TABLE IF NOT EXISTS form (
    formId INT NOT NULL AUTO_INCREMENT,
    studentId INT NOT NULL,
    courseDate DATE NOT NULL,
    doctorMCR VARCHAR(255) NOT NULL,
    eligibility VARCHAR(5) NOT NULL,
    comments VARCHAR(255) NOT NULL,
    formStatus VARCHAR(50) NOT NULL DEFAULT 'Pending',
    examinationDate DATE NOT NULL,
    review VARCHAR(255) NOT NULL,
    PRIMARY KEY (formId)
    );

     CREATE TABLE IF NOT EXISTS registrationForm (
    regFormId INT NOT NULL AUTO_INCREMENT,
    raceId INT NOT NULL,
    parentName VARCHAR(100) NOT NULL,
    parentEmail VARCHAR(100) NOT NULL,
    parentNo VARCHAR(50) NOT NULL,
    altParentNo VARCHAR(50) NOT NULL,
    relationToApplicant VARCHAR(100) NOT NULL,
    isYouEmergencyContact VARCHAR(3) NOT NULL,
    emergencyContactName VARCHAR(100) NULL,
    emergencyContactNo VARCHAR(50) NULL,
    relationToEmergencyContact VARCHAR(100) NULL,
    altEmergencyContactNo VARCHAR(50) NULL,
    applicantNRIC VARCHAR(9) NOT NULL,
    applicantName VARCHAR(100) NOT NULL,
    applicantSchool VARCHAR(100) NOT NULL,
    applicantClass VARCHAR(100) NOT NULL,
    applicantResidentialStatus VARCHAR(100) NOT NULL,
    applicantDOB VARCHAR(100) NOT NULL,
    applicantGender VARCHAR(100) NOT NULL,
    applicantEmail VARCHAR(100) NOT NULL,
    applicantAddr VARCHAR(100) NOT NULL,
    applicantDietary VARCHAR(100) NULL,
    isApplicantVaccinationValid VARCHAR(3) NOT NULL,
    applicantVaccinationDate VARCHAR(100) NULL,
    applicantHeight VARCHAR(50) NOT NULL,
    applicantWeight VARCHAR(50) NOT NULL,
    applicantBMI VARCHAR(50) NOT NULL,
    isBreathingCondition VARCHAR(3) NOT NULL,
    diagnosisBreathing VARCHAR(255) NULL,
    lastDateBreathing VARCHAR(100) NULL,
    isOnBreathingMeds VARCHAR(3) NULL,
    stateBreathingMeds VARCHAR(255) NULL,
    isBreathingSpecialist VARCHAR(3) NULL,
    isBreathingExercise VARCHAR(3) NULL,
    isHeartCondition VARCHAR(3) NOT NULL,
    stateHeartCondition VARCHAR(100) NULL,
    isHeartSpecialist VARCHAR(3) NULL,
    isBloodCondition VARCHAR(3) NOT NULL,
    diagnosisBlood VARCHAR(255) NULL,
    isBloodSpecialist VARCHAR(3) NULL,
    isEpilepsyCondition VARCHAR(3) NOT NULL,
    isEpliepsyEpisode VARCHAR(3) NULL,
    isOnEpliepsyMeds VARCHAR(3) NULL,
    isEpliepsySpecialist VARCHAR(3) NULL,  
    isBoneCondition VARCHAR(3) NOT NULL,
    stateBoneCondition VARCHAR(255) NULL,
    dateOfBoneCondition VARCHAR(100) NULL,
    isBoneSpecialist VARCHAR(3) NULL,
    isBoneFullyRecovered VARCHAR(3) NULL,
    furtherInfoOnBone VARCHAR(255) NULL,
    isBehaviouralCondition VARCHAR(3) NOT NULL,
    stateBehaviouralCondition VARCHAR(255) NULL,
    isBehaviouralSpecialist VARCHAR(3) NULL,
    progressOfTreatingBehavioural VARCHAR(255) NULL,
    stateBehaviouralAtHome VARCHAR(255) NULL, 
    stateBehaviouralHelpTips VARCHAR(255) NULL, 
    isAcceptSafetyRisks VARCHAR(3) NOT NULL,
    isAcceptParticipation VARCHAR(3) NOT NULL,
    isOnLongTermMeds VARCHAR(3) NOT NULL,
    stateLongTermMeds VARCHAR(255) NULL,
    isInfectiousCondition VARCHAR(3) NOT NULL,
    stateInfectiousCondition VARCHAR(255) NULL,
    isSleepWalking VARCHAR(3) NOT NULL,
    lastDateSleepWalking VARCHAR(100) NULL,
    isAllergicToMeds VARCHAR(3) NOT NULL,
    stateAllergicToMeds VARCHAR(255) NULL,
    isAllergicToEnvironment VARCHAR(3) NOT NULL,
    stateAllergicToEnvironment VARCHAR(255) NULL,
    stateDetailsEnvironmentTriggers VARCHAR(255) NULL,
    isMedsStopAllergic VARCHAR(3) NULL,
    stateMedsStopAllergic VARCHAR(255) NULL,
    isAllergicToFood VARCHAR(3) NOT NULL,
    stateAllergicToFood VARCHAR(255) NULL,
    stateDetailsFoodTriggers VARCHAR(255) NULL,
    isAbleToTakeTraces VARCHAR(3) NULL,
    isMedsStopTracers VARCHAR(3) NULL,
    stateMedsStopTracers VARCHAR(255) NULL,
    isAcceptAllergyRisks VARCHAR(3) NOT NULL,
    isOtherCondition VARCHAR(3) NOT NULL,
    stateOtherCondition VARCHAR(255) NULL,
    dateOfOtherCondition VARCHAR(100) NULL,
    stateOtherConditionAffectsPhysical VARCHAR(255) NULL,
    stateTriggerOtherCondition VARCHAR(255) NULL,
    statePrecautionOtherCondition VARCHAR(255) NULL,
    stateMedsOtherCondition VARCHAR(255) NULL,
    isOtherConditionSpecialist VARCHAR(3) NULL,
    isOtherConditionAffectFocus VARCHAR(3) NULL,
    isOtherConditionAffectUnderstanding VARCHAR(3) NULL,
    stateDetailsOtherConditionAffect VARCHAR(255) NULL,
    isAcceptDeclartion VARCHAR(3) NOT NULL,
    isAcceptMedicalDeclaration VARCHAR(3) NOT NULL,
    isAcceptAllRisk VARCHAR(3) NOT NULL,
    isAcceptPersonalData VARCHAR(3) NOT NULL,
    isDeclineUseOfContactInfo VARCHAR(3) NULL,
    isDeclineUseOfPhoto VARCHAR(3) NULL,
    PRIMARY KEY (regFormId)
    )

    CREATE TABLE IF NOT EXISTS race (
    raceId INT NOT NULL AUTO_INCREMENT,
    raceName VARCHAR(255) NOT NULL,
    PRIMARY KEY (raceId)
    )
    
    CREATE TABLE IF NOT EXISTS school (
    schoolId INT NOT NULL AUTO_INCREMENT,
    schoolName VARCHAR(255) NOT NULL,
    PRIMARY KEY (schoolId)
    )

`;

    return query(CREATE_TABLE_SQL)
    .then(function (result) {
        console.log('Tables created');
    })
    .catch(function (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            throw new Error('Table already exists');
        }    
        throw error;
    });