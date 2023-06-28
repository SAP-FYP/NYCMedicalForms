module.exports.passwordGenerator = function passwordGenerator() {
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
    password += getRandomChar(symbolChars);

    // Fill remaining length with random characters
    while (password.length < length) {
        const charSet = [lowercaseChars, uppercaseChars, numberChars, symbolChars];
        const randomCharSet = charSet[Math.floor(Math.random() * charSet.length)];
        password += getRandomChar(randomCharSet);
    }

    const shuffledPassword = password.split('').sort(() => 0.5 - Math.random()).join('');
    return shuffledPassword;
}