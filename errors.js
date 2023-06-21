module.exports.TABLE_ALREADY_EXISTS_ERROR = class TABLE_ALREADY_EXISTS_ERROR extends Error {
    constructor(tableName) {
        super(`Table ${tableName} already exists!`);
    }
};
module.exports.UserNotFoundError = class UserNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "UserNotFoundError";
    }
}
module.exports.ClassNotFoundError = class ClassNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "ClassNotFoundError";
    }
}
module.exports.EMPTY_RESULT_ERROR = class EMPTY_RESULT_ERROR extends Error {};
module.exports.DUPLICATE_ENTRY_ERROR = class DUPLICATE_ENTRY_ERROR extends Error {};
module.exports.MYSQL_ERROR_CODE = {
    TABLE_ALREADY_EXISTS: 1050,
    DUPLICATE_ENTRY: 1062,
};
