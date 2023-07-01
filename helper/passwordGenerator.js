module.exports.generatePassword = function generatePassword() {
    const length = Math.floor(Math.random() * 9) + 8; // Random length between 8 and 16

    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const symbolChars = '-#!$@%^&*()_+|~=`{}[]:";\'<>?,./';

    const getRandomChar = (charSet) => {
        const randomIndex = Math.floor(Math.random() * charSet.length);
        return charSet[randomIndex];
    };

    let password = '';

    // Ensure minimum requirements are met
    password += getRandomChar(lowercaseChars);
    password += getRandomChar(uppercaseChars);
    password += getRandomChar(numberChars);

    const specialCharCount = Math.floor(Math.random() * 2) + 1; // Random number of special characters between 1 and 2
    for (let i = 0; i < specialCharCount; i++) {
        password += getRandomChar(symbolChars);
    }

    // Fill remaining length with random characters
    while (password.length < length) {
        const charSet = [lowercaseChars, uppercaseChars, numberChars];
        const randomCharSet = charSet[Math.floor(Math.random() * charSet.length)];
        password += getRandomChar(randomCharSet);
    }

    const shuffledPassword = password.split('').sort(() => 0.5 - Math.random()).join('');
    console.log('Generated Password: ' + shuffledPassword)
    return shuffledPassword;
};