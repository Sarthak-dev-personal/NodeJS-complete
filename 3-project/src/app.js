const express = require('express');

/**
 * Intantiate the imported express function.
 * app will now act as an instance of this express function.
 */
const app = express();

/**
 * Route Handler to handle /test path.
 */
app.use('/test', (req, res) => res.send("Hello from '/test' request handler"));

/**
 * Route Handler to handle '/hello' path.
 */
app.use('/hello', (request, response) => response.send("Hello from '/hello' request handler"));

/**
 * Route Handler to handle the generic request. Basically domain-name:port/.
 * The generic request handler should always be the last handler as it'll match
 * any specific route case as well and return the response even if we have a route handler for the exact path implemented.
 */
app.use((request, response) => response.send('Hello from first route handler'));

// Listen to incoming requests at port 3000.
app.listen(3000, () => console.log('Server is now listening at port 3000'));
