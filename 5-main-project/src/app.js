const express = require("express");
const cookieParser = require("cookie-parser");

// Model Imports.
const UserModel = require('./models/user');

// Util method imports.
const connectToDb = require('./config/database');

// Middleware imports.
const authenticateUser = require("./middlewares/userAuth");

// Router imports.
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

const app = express();

/**
 * Middleware to convert the data of all the requests to json format to be able to read request.body from the request object.
 * This'll run for all the incoming requests.
 */
app.use(express.json()); // Equivalent to app.use('/', express.json());

// Middleware to parse the cookies sent for all the requests from the client.
app.use(cookieParser());

// Route all the requests through defined routers instead of having all the methods in the app.js.
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

/**
 * API to delete a particular user.
 * We can use various Mongoose methods like, findOneAndDelete(findByIdAndDelete is an optimised version of it.)
 * deleteOne, deleteMany with different querying options.
 */
app.delete('/user', async (request, response) => {
    const id = request.body.id;

    try {
        if (!id) {
            response.status(400).send("Invalid request");

            return;
        }

        // Eg. using deleteOne method.
        /* const deletedUser = await UserModel.deleteOne({
            _id: id,
        }); */
       const deletedUser = await UserModel.findByIdAndDelete(id);

        if (deletedUser) {
            response.send({
                message: 'User deleted sucessfully',
                deletedUser,
            });
        } else {
            response.status(404).send("User with the matching user id not found!!");
        }
    } catch (error) {
        console.log(error);
        response.status(500).send("Something went wrong!!");
    }
});

// API to get the list of all the users.
app.get('/feed', async(request, response) => {
    try {
        const users = await UserModel.find();

        if (users?.length) {
            response.send(usersNew);

            return;
        }

        response.status(404).send("No Users added yet!!");
    } catch (error) {
        response.status(500).send("Something went wrong!!");
    }
});

// Sample API demostrating use of authenticateUser middleware across multiple APIs.
app.post('/connectionRequest', authenticateUser, async(request, response) => {
    try {
        const user = request.user;

        console.log("Connection Request sent!!");

        response.send(user);
    } catch (error) {
        response.status(400).send("Error " + error.message);
    }
});

connectToDb().then(
    () => {
        console.log('Connected successfuly to Cluster');
        app.listen(3000, () => {
            console.log('Server is listening at port 3000');
        });
    },
).catch(e => console.log('Error connecting to Cluster'))
