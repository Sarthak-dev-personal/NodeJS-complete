const express = require("express");

const authenticateUser = require("../middlewares/userAuth");

const ConnectionRequestModel = require("../models/connectionRequest");
const UserModel = require("../models/user");

const userRouter = express.Router();

// Fields acceptable to return in connection response.
const ACCEPTABLE_FIELDS_IN_RESPONSE = ["firstName", "lastName", "age", "gender", "skills", "about"];

userRouter.get("/user/requests/received", authenticateUser, async(request, response) => {
    try {
        const loggedInUser = request.user;

        const connectionRequests = await ConnectionRequestModel.find({
            toUserId: loggedInUser._id,
            status: "interested",
        }).populate("fromUserId", ACCEPTABLE_FIELDS_IN_RESPONSE);
        //.populate("fromUserId", "firstName lastName age gender skills about -_id"); // Another way of populating refs. -_id is to remove id from the response.

        const responseData = {};

        if (connectionRequests && !connectionRequests.length) {
            responseData.message = "No pending reqeusts found!!";
        } else {
            responseData.connectionRequests = [...connectionRequests];
        }

        response.json({
            ...responseData,
        });
    } catch (error) {
        response.status(400).json({
            message: error.message,
        })
    }
});

userRouter.get("/user/connections", authenticateUser, async(request, response) => {
    try {
        const loggedInUser = request.user;

        const connections =  await ConnectionRequestModel.find({
            /* $or: [{
                fromUserId: loggedInUser._id
            }, {
                toUserId: loggedInUser._id,
            }],  */
            $and: [{
                $or: [{
                    fromUserId: loggedInUser._id
                }, {
                    toUserId: loggedInUser._id,
                }],                
            }, {
                status: "accepted",
            }]
        }).populate("fromUserId", ACCEPTABLE_FIELDS_IN_RESPONSE).populate("toUserId", ACCEPTABLE_FIELDS_IN_RESPONSE);


        const responseObject = {};

        if (!connections || !connections.length) {
            responseObject.message = "Oh ho!! No connections exist yet! Start swiping right away.";
        } else {
            const connectionsResponse = connections.map(connection => {
                if (connection.toUserId._id.equals(loggedInUser._id)) {

                    return connection.fromUserId;
                }

                return connection.toUserId;
            });

            responseObject.data = [ ...connectionsResponse ];
        }

        response.json({
            ...responseObject,
        });
    } catch (error) {
        response.status(400).json({
            message: error.message,
        });
    }
});

userRouter.get("/user/feed", authenticateUser, async(request, response) => {
    try {
        const loggedInUser = request.user;

        const page = request.query?.page || 1;
        let limit = request.query?.limit || 10;

        if (limit > 10) {
            limit = 10;
        }

        const countToSkip = (page -1) * 10;

        const alreadyConnectedUsers = await ConnectionRequestModel.find({
            $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
        }).select(["fromUserId", "toUserId"]);

        const hiddenUserIdsSet = new Set();

        alreadyConnectedUsers.forEach(
            alreadyConnectUser => {
                hiddenUserIdsSet.add(alreadyConnectUser.fromUserId);
                hiddenUserIdsSet.add(alreadyConnectUser.toUserId);
            }
        );

        const users = await UserModel.find({
            $and: [
                {
                    _id: {
                        $nin: Array.from(hiddenUserIdsSet)
                    }
                }, {
                    _id: {
                        $ne: loggedInUser._id,
                    }
                }
            ]
        }).skip(countToSkip).limit(limit).select(ACCEPTABLE_FIELDS_IN_RESPONSE);

        response.json({
            users,
        })
    } catch (error) {
        response.status(400).json({
            message: error.message,
        });
    }
});

module.exports = userRouter;
