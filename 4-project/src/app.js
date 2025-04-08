const express = require('express');
const connectToDb = require('./config/database');

// Model Imports.
const UserModel = require('./models/user');

const app = express();

/**
 * Middleware to convert the data of all the requests to json format to be able to read request.body from the request object.
 * This'll run for all the incoming requests.
 */
app.use(express.json()); // Equivalent to app.use('/', express.json());

// API to add a new user to DB.
app.post('/signup', async (request, response) => {
    try {
        const newUser = new UserModel(request.body); // Replaced the harcoded object with the data object received as part of the request body.

        await newUser.save(); // Push Data in the collection.

        response.send(request.body);
    } catch (e) {
        response.status(500).send(e);
    };
});

// API to get a particular user from the DB.
app.get('/user', async (request, response) => {
    const emailId = request.body?.emailId;

    try {
        if (!emailId) { // Invalid request assuming no request params were sent from the client.
            response.status(400).send("Invalid request!!");

            return;
        }

        const user = await UserModel.findOne({ emailId }); // Find one user with this email ID. Can use find as well, it'll find all the users with this email ID.

        if (user) {
            response.send(user); // Return the user object if the user is found.
        } else {
            response.status(404).send("No User with the matching email ID found!!"); // No user with the matching email ID found case.
        }
    } catch (error) {
        response.status(500).send("Something went wrong!");
    }
});

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

/**
 * API to update the document using patch method.
 * There are various methods like findByIdAndUpdate, findOneAndUpdate, updateOne.
 */
app.patch('/user', async (request, response) => {
    const dataToPatch = request.body;

    try {
        if (!dataToPatch) {
            response.status(400).send("Invalid Request");

            return;
        }

        /**
         * The findByIdAndUpdate method takes various options as well, apart from ID and data to update.\
         * Eg. await UserModel.findByIdAndUpdate({_id: dataToPatch.id}, dataToPatch, { returnDocument: "after" }); // This'll return the updated user object post updating the data. By default it returns before updating the document i.e the old data.
         */
        const updatedUser = await UserModel.findByIdAndUpdate({ _id: dataToPatch.id }, dataToPatch);

        if (updatedUser) {
            response.send({
                message: "User updated successfully!!",
                updatedUser,
            });
        } else {
            response.status(404).send("Used with the selected ID not found!!");
        }
    } catch (error) {
        response.status(500).send("Something went wrong, please try again!!");
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
})

connectToDb().then(
    () => {
        console.log('Connected successfuly to Cluster');
        app.listen(3000, () => {
            console.log('Server is listening at port 3000');
        });
    },
).catch(e => console.log('Error connecting to Cluster'))
