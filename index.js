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
    appId: '',
    appPassword: ''
});

rserver.post('http://127.0.0.1:3978/api/messages',connector.listen());
const bot = new botbuilder.UniversalBot(connector);
//const botHandler = connector.listen();
//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', function (session) {
    session.send("Hello World");
});

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