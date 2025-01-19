const http = require('http');

const server = http.createServer((request, response) => {

    /**
     * The end method sends back the response to the client.
     */
    response.end('Hello World');
});

// Listen to incoming request at port number 3000.
server.listen(3000); // Send the request from the localhost in browser at port 300 to receive the Hello World in the response.
