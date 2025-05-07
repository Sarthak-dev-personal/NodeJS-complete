const express = require("express");

const validator = require("validator");
const bcrypt = require("bcrypt");

const authenticateUser = require("../middlewares/userAuth");
const encryptPassword = require("../utils/encrypt-password");

const profileRouter = express.Router();

/**
 * We can chain multiple middlewares by wrapping them inside an array.
 * Eg. app.get('/profile', [aythenticateUser, middleware2, middleware3], async(request, response) => {});
 */
profileRouter.get('/profile/view', authenticateUser, async (request, response) => {
    /* try {
        const authenticationCookie = request.cookies;

        const { authToken } = authenticationCookie;

        if (!authToken) {
            throw new Error("Authentication token missing!!");
        }

        const decodedMessage = jwt.verify(authToken, "Sarthak@1234");

        if (!decodedMessage) {
            throw new Error("Invalid Authentication token!!");
        }
        
        const user = await UserModel.findById({ _id: decodedMessage._id });

        if (!user) {
            throw new Error("No User found!!");
        }

        response.send(user); 
        
    } */ 
    try {
        /**
         * The more efficient way of doing this is by creating a middleware,
         * since, this token validation will be required for all the incoming API requests (barring login & signup)
         * We can utilize this middleware across all those APIs.
         */
        const user = request.user; // We are adding the user object to the request body in the userAuth middleware code.

        response.json({ data: user });
    } catch (error) {
        response.send(error.message);
    }
});

// API to update the profile sans password.
profileRouter.patch("/profile/edit", authenticateUser, async(request, response) => {
    const fieldsAllowedToEdit = [
        "firstName",
        "lastName",
        "emailId",
        "gender",
        "age",
        "skills",
        "about",
        "photoUrl",
    ];

    const dataToPatch = request.body;

    // Note: This validation can be offloaded to a utils method in the utils folder just like the validate-signup-request.
    const isEditAllowed = Object.keys(dataToPatch).every(
        key => fieldsAllowedToEdit.includes(key),
    );

    try {
        if (!isEditAllowed) {
            throw new Error("Some fields present in the request are not allowed to be edited!!");
        }

        const loggedInUser = request.user;

        Object.keys(dataToPatch).every(
            key => loggedInUser[key] = dataToPatch[key],
        );

        const updatedUser = await loggedInUser.save();

        if (!updatedUser) {
            throw new Error("Something went wrong. Please try again after some time!!");
        }

        response.json({
            message: "Profile Edited successfully!",
            data: updatedUser,
        })
    } catch (error) {
        response.status(400).send(error.message);
    }
});

// API to update/reset the password.
profileRouter.patch("/profile/password", authenticateUser, async(request, response) => {
    try {
        const newPassword = request.body.password;
        const existingPassword = request.body.existingPassword;

        if (!existingPassword) {
            throw new Error("Existing Password missing!!");
        }

        if (!validator.isStrongPassword(newPassword)) {
            throw new Error("New Password not strong enough!!");
        }

        const loggedInUser = request.user;

        const isExistingPasswordCorrect = loggedInUser.validatePassword(existingPassword);

        if (!isExistingPasswordCorrect) {
            throw new Error("Existing password is incorrect!!");
        }

       loggedInUser.password = await encryptPassword(newPassword);

       const updatedUser = await loggedInUser.save();

        response.json({
            message: "Profile password updated successfully!!",
            data: updatedUser,
        });
    } catch(error) {
        response.status(400).send(error.message);
    }
});

module.exports = profileRouter;
