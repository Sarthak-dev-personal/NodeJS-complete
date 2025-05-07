const mongoose = require("mongoose");

const connectionRequestSchema = mongoose.Schema({
    toUserId: {
        required: true,
        type: mongoose.Types.ObjectId,
    },
    fromUserId: {
        required: true,
        type: mongoose.Types.ObjectId,
    },
    status: {
        type: String,
        enum: {
            values: ["accepted", "ignored", "interested", "rejected"],
            message: `{VALUE} is incorrect type`,
        },
        required: true,
    }
}, {
    timestamps: true,
});

connectionRequestSchema.pre("save", function(next) {
    const connectionRequest = this;

    if (connectionRequest.toUserId.equals(connectionRequest.fromUserId)) {
        throw new Error("Cannot send connection requests to yourself!!");
    }

    next();
})

/**
 * Eg. of creating a compound index. We can have singles indexes as well.
 * Those single indexes will be declared in the property itself. Fo eg. fromUserId: {
 *      required: true,
        type: mongoose.Types.ObjectId,
        index: true,
 * }
    Below, we are creating compound index as our querry will use or operator and use both fromId and toId to fetch data.
 */
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

const ConnectionRequestModel = mongoose.model("ConnectionRequest", connectionRequestSchema);

module.exports = ConnectionRequestModel;
