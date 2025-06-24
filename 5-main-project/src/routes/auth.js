const express = require("express");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/user");

const {
    validateLoginRequestBody,
    validateSignUpRequestBody,
} = require("../utils/validate-signup-request");

const encryptPassword = require('../utils/encrypt-password');

const authRouter = express.Router();

// API to add a new user to DB.
authRouter.post('/signup', async (request, response) => {
    const {
        firstName,
        lastName,
        emailId,
        password,
        age,
        gender,
        skills,
        about,
        photoUrl,
    } = request.body;

    try {
        if (validateSignUpRequestBody(request.body)) {
            const passwordHash = await encryptPassword(password);

            // Replaced the harcoded object with the data object received as part of the request body.
            const newUser = new UserModel({
                firstName,
                lastName,
                emailId,
                password: passwordHash,
                age,
                gender,
                skills,
                about,
                photoUrl,
            });

            const user = await newUser.save(); // Push Data in the collection.

            const authToken = jwt.sign({ _id: user._id }, "Sarthak@1234", { expiresIn: "7d" });
            response.cookie("authToken", authToken, { httpOnly: true, expires: new Date(Date.now() + 60 * 60 * 1000) });

            response.json({
                message: `Congratulations ${newUser.firstName}, you're signed up sucessfully!!`,
                data: user,
            }); // Ideally we should return some fixed string for the password instead of returning the hash saved in the DB.
        }
    } catch (e) {
        response.status(500).send(e.message);
    };
});

// Login API.
authRouter.post('/login', async(request, response) => {
    const {
        emailId,
        password,
    } = request.body;

    try {
        if (validateLoginRequestBody(request.body)) {
            const user = await UserModel.findOne({ emailId });

            if (!user) {
                throw new Error("User not found!!");
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            /**
             * Ideally the activities like verifying password for a user,
             * can be offloaded to userSchema. This is the best practice when performing such operations since,
             * the particular password is linked to a particular user so it makes sense to use userSchema for this.
             * Refer to the commented code below and in the user.js file as well.
             * Same goes for creating the jwt functionality as well.
             */
            //const isPasswordValid = await user.validatePassword(password);

            if (!isPasswordValid) {
                throw new Error("Invalid password!!");
            }

            /**
             * This is not the correct way of setting password, this is just for learning purpose("Sarthak@1234").
             * In Prod Environment, this should ideally be picked up from environment.js file.
             * ID will be used to fetch the correct user post accessing the cookie and verifying the token.
             */
            const authToken = jwt.sign({ _id: user._id }, "Sarthak@1234", { expiresIn: "7d" });

            /**
             * Ideally the activities like creating a JWT token for a user,
             * can be offloaded to userSchema. This is the best practice when performing such operations since,
             * the particular jwt is linked to a particular user so it makes sense to use userSchema for this.
             * Refer to the commented code below and in the user.js file as well.
             * Same goes for verifying the password functionality as well.
             */
            // const authToken = user.createJwtToken();

            response.cookie("authToken", authToken, { httpOnly: true, expires: new Date(Date.now() + 60 * 60 * 1000) });

            response.send({
                message: "User logged in successfully.",
                user,
            });
        }
    } catch (error) {
        response.status(500).send(error.message);
    }
});

// Logout API.
authRouter.post("/logout", async(request, response) => {
    const user = await UserModel.findOne({ emailId: request.body.emailId });

    response.cookie("authToken", null, { expires: new Date(Date.now()) }).json({
        message: "User logged out successfully!!",
        user,
    });
});

module.exports = authRouter;
