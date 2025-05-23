const bcrypt = require("bcrypt");

async function encryptPassword(password) {
    try {
        const passwordHash = await bcrypt.hash(password, 10);

        return passwordHash;
    } catch (error) {
        throw error;
    }
}

module.exports = encryptPassword;
