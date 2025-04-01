/**
 * This file is tasked with connecting to the Mongo DB server hosted on cloud.
 * Just for learning we have written some basic CRUD operations queries as well.
 * This file doesn't create a new DB or a new collection instead,
 * it fetches and adds data in various ways in the existing DB 'HelloWorld' and existing collection 'User' under this DB.
 */

const { MongoClient } = require('mongodb');

// This is the connection string you get when you configure your cluster on Mongo DB website.
const uri = 'mongodb+srv://sarthakkapoor:L3tS25hbhjCjFUvW@nodejs.s6fd1.mongodb.net/?retryWrites=true&w=majority&appName=NodeJS';

// mongodb returns the MongoClient class hence, we need to instantiate it.
const client = new MongoClient(uri);

async function main() {
    try {
        await client.connect();

        console.log('Hello2');

        const db = client.db('HelloWorld'); // Name of the DB we created in the Node JS connection.
        const collection = db.collection('User'); // Name of the collection we created in this particular DB. There can be multiple collections.

        // Insert single document.
        await collection.insertOne({
            firstname: 'Sarthak',
            lastname: 'Kapoor1',
            city: 'Pune',
            phoneNumber: '0987654321',
        });

        // Insert multiple documents.
        await collection.insertMany([{
            firstname: 'Sarthak-New',
            lastname: 'Kapoor1',
            city: 'Pune1',
            phoneNumber: '9087654321',
        }]);

        // To find one document from the collection.
        const oneUser = await collection.findOne({firstname: 'Sarthak'}); // No need to conver to array since we'll get a single object.

        // To find all the documents without matching any criteria.
        const allUsers = await collection.find().toArray();

        // To find all the documents matching the criteria.
        const allSarthaks = await collection.find({firstname: 'Sarthak'}).toArray();

        console.log('Connected to DB client');
        console.log('oneUser', oneUser);
        console.log('allUsers', allUsers);
        console.log('allSarthaks', allSarthaks);
        return 'Done';
    } catch (error) {
        return error;
    }
}

main().then(data => console.log(data)).finally(() => {
    client.close()
    console.log('Connection Closed');
});
 