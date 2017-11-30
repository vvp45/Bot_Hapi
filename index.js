'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
server.connection({ port: 3000 });

const botbuilder = require('botbuilder');

var restify = require('restify');
var rserver = restify.createServer();
rserver.listen( 3978, function () {
   console.log('%s listening to %s', rserver.name, rserver.url); 
});


function responseWrapper(res) {
    return {
        end() {
            res.end();
            return this;
        },

        send(statusOrBody, maybeBody, callback) {
            var responseCode = 200;
            var responseBody = maybeBody;

            if (typeof statusOrBody == 'number') {
                responseCode = statusOrBody;
                responseBody = maybeBody;
            } else {
                responseBody = statusOrBody;
            }

            if (typeof responseBody != 'string') {
                responseBody = JSON.stringify(responseBody);
            }

            res.writeHead(responseCode);
            res.setHeader("Content-Type", "application/json");
            res.write(responseBody, callback);
            res.end();
            return this;
        },

        status(code) {
            res.writeHead(code);
            return this;
        }
    }
}


function requestWrapper(request) {
    return {
        body: request.payload,
        headers: request.headers,
        on(event, listener) {
            request.raw.req.on(event, listener)
            return this;
        }
    }
}

// Initialize your connector
const connector = new botbuilder.ChatConnector({
    appId: '4228ae1d-0379-4ab3-b964-b697ca066846',
    appPassword: 'gulLZV7617_+=orvjJKMX4|'
});

rserver.post('http://127.0.0.1:3978/api/messages',connector.listen());
const bot = new botbuilder.UniversalBot(connector, [
//const botHandler = connector.listen();
//=========================================================
// Bots Dialogs
//=========================================================

//const bot = new builder.UniversalBot(connector, [
    function (session) {
        session.send("Welcome to the TKIET College.");
        //session.send("What is your name?");
        botbuilder.Prompts.text(session, "How can I help You?");
    },

    function (session, results) {
       // var msg = "How much department in your college?";
     //if(msg == botbuilder.Prompts.text ) 
       botbuilder.Prompts.text("6 departments in my college.");
      //  break;
    
       //else 
        //session.send("Sorry, I can not recognize.");
        session.send(session, "Sorry, I can not recognize.");
    }
]);

server.route({
    method: 'POST',
    path: '/api/messages',
    handler: function (request, reply) {
        var wrappedResponse = responseWrapper(request.raw.res);
        var wrappedRequest = requestWrapper(request);
        botHandler(wrappedRequest, wrappedResponse); // Forwarded!!!
    }
});

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        var req = request.raw.req, 
            res = request.raw.res;
        reply('Hello, world!');
    }
});

server.start((err) => {
    if (err) {
        throw err;
    }

    console.log(`Server running at: ${server.info.uri}`);
});