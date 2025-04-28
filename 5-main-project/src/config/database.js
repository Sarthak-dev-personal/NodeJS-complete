const mongoose = require('mongoose');

const connectToDb = async() => {
    await mongoose.connect('mongodb+srv://sarthakkapoor:L3tS25hbhjCjFUvW@nodejs.s6fd1.mongodb.net/dev-project');
};

module.exports = connectToDb;

/* connectToDb().then(
    () => console.log('Cluster Connection successful.'),
).catch(e => console.log('Error connecting to DB')); */
