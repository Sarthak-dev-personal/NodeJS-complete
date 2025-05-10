const express = require("express");

const ConnectionRequestModel = require("../models/connectionRequest");
const UserModel = require("../models/user");
const authenticateUser = require("../middlewares/userAuth");

const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:toUserId", authenticateUser, async(request, response) => {
    try {
        const toUserId = request.params.toUserId;
        const fromUserId = request.user._id;
        const status = request.params.status;

        const isToUserIdValid = await UserModel.findById({ _id: toUserId });

        if(!isToUserIdValid) {
            throw new Error("Connection Request can't be sent to a non existent user!!");
        }

        const isConnectionRequestAlreadySent = await ConnectionRequestModel.findOne({
            $or: [{
                fromUserId, toUserId,
            }, {
                fromUserId: toUserId,
                toUserId: fromUserId,
            }],
        });

        if (isConnectionRequestAlreadySent) {
            throw new Error("A connection request already exists between the two users");
        }

        const newConnectionRequest = new ConnectionRequestModel({
            toUserId,
            fromUserId,
            status,
        });

        const connectionRequest = await newConnectionRequest.save();

        response.json({
            message: `Congratulations ${request.user.firstName}, connection request successfully sent to ${isToUserIdValid.firstName}`,
            data: connectionRequest,
        });
    } catch (error) {
        response.status(400).json({
            message: error.message,
        })
    }
});

/**
 * Api to accept/reject connection request.
 * toUserId should be same as the logged in user id.
 * The value of status params can only be accept/reject.
 * The current status of the request can only be interested.
 * Request ID should be valid.
 * Offcourse, the user should be logged in.
 */
requestRouter.post("/request/review/:status/:requestId", authenticateUser, async(request, response) => {
    try {
        const status = request.params.status;
        const requestId = request.params.requestId;
        const loggedInUser = request.user;
        const allowedStatusValues = new Set(["accept", "reject"]);

        if (!allowedStatusValues.has(status)) {
            throw new Error("Invalid Status value");
        }

        const existingConnectionRequest = await ConnectionRequestModel.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested", // Only requests with status as interested can be accepted or rejected.
        });

        if (!existingConnectionRequest) {
            throw new Error("The requested connection request doesn't exist!!");
        }

        existingConnectionRequest.status =  `${status}ed`;

        console.log(existingConnectionRequest.status);

        const data = await existingConnectionRequest.save();

        response.json({
            message: `${loggedInUser.firstName} you've successfully ${status}ed the connection request`,
            data,
        });
    } catch (error) {
        response.status(400).json({ message: error.message });
    }
});

module.exports = requestRouter;
