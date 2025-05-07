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

module.exports = requestRouter;
