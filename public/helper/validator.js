module.exports.numberValidator = function numberValidator(number) {

    // Starts with optional +65 or 65
    // First digit begins with 6/8/9
    // Compulsory additional 7 digits

    const phoneNumberPattern = /^(\+?65)?[689]\d{7}$/;
    return phoneNumberPattern.test(phoneNumber);
}