const express = require('express');

/**
 * Intantiate the imported express function.
 * app will now act as an instance of this express function.
 */
const app = express();

/**
 * Route Handler to handle /test path.
 * This middleware will handle any type of request i.e Get, Post, Put, Patch, Delete etc.
 * To make the middleware handle any specific type of request we need to use that particular method
 * instead of 'use' method. See the middleware next to this middleware.
 */
app.use('/test', (req, res) => res.send("Hello from '/test' request handler"));

/**
 * Handler for Get specific request.
 * Similarly for POST and other method types.
 * NOTE: This won't get executed though as we have the app.use for '/test' url implemented above this
 * and since order matters in Node JS, that particular middleware is the one that'll get executed.
 */
app.get('/test', (request, response) => response.send("Hello from '/test' get type request"));

/**
 * Route Handler to handle '/hello' path.
 */
app.use('/hello', (request, response) => response.send("Hello from '/hello' request handler"));

/**
 * Fetching Query Params from the request object.
 */
app.get('/queryParams', (request, response) => {
    const queryParams = request.query;
    console.log(queryParams); // For a request like: 'http://localhost:3000/queryParams?id=1001&name=Sarthak' it prints : '{ id: '1001', name: 'Sarthak' }'
    response.send('Query Params received');
});

/**
 * Fetching Request Params from the request object.
 */
app.get('/requestParams/:name/:id', (request, response) => {
    const requestParams = request.params;
    console.log(requestParams); // For a request like 'http://localhost:3000/requestParams/Sarthak/1' it prints: '{ name: 'Sarthak', id: '1' }'
    response.send('Request Params received');
});

/**
 * Request Handler to handle routes like abdsfjhfdkjghcd using regex like urls.
 * With Express 5.0 these don't work like mentioned below.
 * Anyways these are not very important and seldom used.
 */
/* app.get('/ab?c', (request, response) => {
    console.log("I'll work with any url like abc, ac,")
})
app.get('/ab+c', (request, response) => {
    console.log("I'll work with any url like abc, abbbbbbbbbbbbc,")
})
app.get('/ab*c', (request, response) => {
    console.log("I'll work with any url like abc, abbbbbbbbbbbbc, abgjsdhfjkdshfgkc");
})
app.get('/a(bc)?d', (request, response) => {
    console.log("I'll work with any url like abcd, ad, ");
}) */

/**
 * The actual regex can also be used
 */
app.get('/.*abc$/', (request, response) => {
    console.log("I'll work with any url like xyzabc, abc etc.");
})


/**
 * Route Handler to handle the generic request. Basically domain-name:port/.
 * The generic request handler should always be the last handler as it'll match
 * any specific route case as well and return the response even if we have a route handler for the exact path implemented.
 */
app.use((request, response) => response.send('Hello from first route handler'));

// Listen to incoming requests at port 3000.
app.listen(3000, () => console.log('Server is now listening at port 3000'));
