const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
    },
    password: {
        type: String,
    },
    age: {
        type: Number,
    }
});

/**
 * Create a Mongoose model.
 * Individual middlewares will instantiate this model whenver required to add data to DB.
 */
const User = mongoose.model('User', userSchema)

module.exports = User;
