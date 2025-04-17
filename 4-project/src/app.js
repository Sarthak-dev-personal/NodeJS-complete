const express = require('express');
const bcrypt = require('bcrypt');

// Model Imports.
const UserModel = require('./models/user');

// Util method imports.
const connectToDb = require('./config/database');

const {
    validateSignUpRequestBody,
    validateLoginRequestBody,
} = require('./utils/validate-signup-request');

const encryptPassword = require('./utils/encrypt-password');

const app = express();

/**
 * Middleware to convert the data of all the requests to json format to be able to read request.body from the request object.
 * This'll run for all the incoming requests.
 */
app.use(express.json()); // Equivalent to app.use('/', express.json());

// API to add a new user to DB.
app.post('/signup', async (request, response) => {
    const {
        firstName,
        lastName,
        emailId,
        password,
        age,
        gender,
        skills,
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
            });

            const user = await newUser.save(); // Push Data in the collection.

            response.send(user); // Ideally we should return some fixed string for the password instead of returning the hash saved in the DB.
        }
    } catch (e) {
        response.status(500).send(e.message);
    };
});

// Login API.
app.post('/login', async(request, response) => {
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

            if (!isPasswordValid) {
                throw new Error("Invalid password!!");
            }

            response.send({
                message: "User logged in successfully.",
                user,
            });
        }
    } catch (error) {
        response.status(500).send(error.message);
    }
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

    const fieldsAllowedToUpdate = [
        "id", // Usually not allowed to update. Kept here for learning purpose. Could have been passed as a request param.
        "firstName",
        "lastName",
        "gender",
        "age",
        "skills",
    ];

    try {
        if (!dataToPatch) {
            /* response.status(400).send("Invalid Request");

            return; */
            throw new Error("Invalid Request");
        }

        // Eg. of applying API level validation.
        const isUpdateAllowed = Object.keys(dataToPatch).every(key => fieldsAllowedToUpdate.includes(key));

        if (!isUpdateAllowed) {
            throw new Error("Some fields present in the request are not allowed to be updated");
        }

        /**
         * The findByIdAndUpdate method takes various options as well, apart from ID and data to update.\
         * Eg. await UserModel.findByIdAndUpdate({_id: dataToPatch.id}, dataToPatch, { returnDocument: "after" }); // This'll return the updated user object post updating the data. By default it returns before updating the document i.e the old data.
         * The validtors don't run on update requests by default. To enable this we need to pass an additional
         * parameter 'runValidators' to the update method.
         */
        const updatedUser = await UserModel.findByIdAndUpdate({ _id: dataToPatch.id }, dataToPatch, { runValidators: true });

        if (updatedUser) {
            response.send({
                message: "User updated successfully!!",
                updatedUser,
            });
        } else {
            response.status(404).send("User with the selected ID not found!!");
        }
    } catch (error) {
        response.status(500).send(error.message);
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
