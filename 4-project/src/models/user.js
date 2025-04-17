const mongoose = require('mongoose');
const validator = require('validator'); // This is an external library tasked with providing common inbuilt validator functions.

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        validate(email) {
            if (!validator.isEmail(email)) {
                throw new Error("Invalid Email ID");
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        min: 18
    },
    gender: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(genderValue) {
            if (!["male", "female","others"].includes(genderValue)) {
                throw new Error("Invalid Gender input");
            }
        }
    },
    skills: {
        type: [String],
        // default: undefined This flag is required if we want to prevent Mongo from creating a default empty array [] in the document.
        validate(skills) {
            if (skills.length > 10) {
                throw new Error("Invalid skills count. Count shouldn't be grater than 10");
            }
        }
    }
}, {
    timestamps: true, // This option allows Mongo DB to add a createdAt and updatedAt properties to a document. This helps in returning sorted response.
});

/**
 * Create a Mongoose model.
 * Individual middlewares will instantiate this model whenver required to add data to DB.
 */
const User = mongoose.model('User', userSchema)

module.exports = User;
