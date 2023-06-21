const moment = require('moment-timezone');

/**
* Converts epoch to local time (GMT +08:00 / computer timezone)
* @param {any} iat - iat in seconds epoch time
*/

module.exports.iatToLocale = function iatToLocale(iat) {
    let utc = moment.unix(iat).utc();
    return moment(utc).tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss');
}

/**
* Converts local time GMT +08:00 to epoch seconds time 
* @param {datetime} datetime - local date and time (GMT +08:00 / computer timezone) (YYYY-MM-DD HH:mm:ss)
*/

module.exports.localeToIat = function locateToIat(datetime) {
    return moment.utc(datetime, 'YYYY-MM-DD HH:mm:ss').unix()
}