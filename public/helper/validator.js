import validator from "validator";

module.exports.emailValidator = function emailValidator(email) {
    return validator.isEmail(email)
}

module.exports.numberValidator = function numberValidator(number) {

    // Starts with optional +65 or 65
    // First digit begins with 6/8/9
    // Compulsory additional 7 digits

    const phoneNumberPattern = /^(\+?65)?[689]\d{7}$/;
    return phoneNumberPattern.test(phoneNumber);
}

module.exports.isStrongPassword = function isStrongPassword(password) {

    const options = {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        returnScore: false, // Set to true if you want to get the password strength score
    };

    return validator.isStrongPassword(password, options);
}