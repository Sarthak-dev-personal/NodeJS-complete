const validator = require('validator');

function validateSignUpRequestBody(requestBody) {
    const {
        firstName,
        emailId,
        password,
        gender,
    } = requestBody;

    if (!firstName || !emailId || !password || !gender) {
        throw new Error("Invalid request. Some mandatory fields missing from the request!!");
    }

    if (!validator.isStrongPassword(password)) {
        throw new Error("Invalid Password. Doesn't meet the security criteria!!");
    }

    return true;
}

function validateLoginRequestBody(requestBody) {
    const { emailId, password } = requestBody;

    if (!emailId || !password) {
        throw new Error("Invalid credentials");
    }

    if (!validator.isEmail(emailId)) {
        throw new Error("Invalid credentials");
    }

    return true;
}

module.exports = {
    validateSignUpRequestBody,
    validateLoginRequestBody,
};
