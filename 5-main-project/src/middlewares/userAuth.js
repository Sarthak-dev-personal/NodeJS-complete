const jwt = require("jsonwebtoken");

const UserModel = require("../models/user");

/**
 * @description
 * This file is responsible for verifying the JWT token on the incoming requests.
 * This'll act as a middleware and when written as a middleware for any api,
 * will automatically get triggered.
 */

const authenticateUser = async (request, response, next) => {
    try {
        const authenticationCookie = request.cookies;

        if (!authenticationCookie) {
            throw new Error("Valid cookie missing!");
        }

        const { authToken } = authenticationCookie;

        if (!authToken) {
            return response.status(401).json({
                message: "User not logged in!!",
            })
        }

        const decodedMessage = jwt.verify(authToken, "Sarthak@1234");

        const user = await UserModel.findById({ _id: decodedMessage._id });

        if (!user) {
            throw new Error("User not found!!");
        }

        request.user = user;

        next(); // Pass on the flow to the next request handler.
    } catch (error) {
        response.status(400).send("Error " + error.message);
    }
}

module.exports = authenticateUser;
