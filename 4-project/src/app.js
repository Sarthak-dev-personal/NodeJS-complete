const express = require('express');
const connectToDb = require('./config/database');

// Model Imports.
const UserModel = require('./models/user');

const app = express();

app.post('/signup', async (request, response) => {
    /**
     * Just adding hardcoded data to DB for now.
     */
    try {
        const newUser = new UserModel({ // New User Document to be added to the users collection.
            "firstName": "Sarthak",
            "lastName": "Kapoor",
            "emailId": "sarthak.kapoor4@gmail.com",
            "password": "Sarthak@123",
            "age": 32
        });

        await newUser.save(); // Push Data in the collection.

        response.send("Data added successfuly");
    } catch (e) {
        response.status(500).send(e);
    };
});

connectToDb().then(
    () => {
        console.log('Connected successfuly to Cluster');
        app.listen(3000, () => {
            console.log('Server is listening at port 3000');
        });
    },
).catch(e => console.log('Error connecting to Cluster'))
