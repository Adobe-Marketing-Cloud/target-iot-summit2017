'use strict';

const http = require('http');
const https = require('https');
const edgeHost = process.env.edgeHost;
const central = process.env.central;
const clientCode = process.env.clientCode;
const mbox = process.env.mbox;

/**
 * This lambda function powers the Adobe Target Alexa skill set
 * 
 * Supported operations are:
 * 1. Saying hello (based on the helloMbox)
 * 2. Get the mbox content (for the activity running on the mbox defined by the process.env.mbox)
 * 3. Update an offer's content (offerId is read from process.env.offerId)
 */

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `Adobe Target - ${title}`,
            content: `Adobe Target - ${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}

function getThirdPartyId(user) {
    if (user === undefined) {
        return 'amzn1.ask.skill.39f071a8-02c6-4db0-a805-7a69dbc22d9f';
    }
    var userId = user.userId;
    return userId.substring(userId.length - 128, userId.length);
}

//The method that notifies the node.js endpoint that the content has changed
function sendMessage(thirdPartyId, mboxName) {
    var requestOptions = {
        method : 'GET',
        host: process.env.amazonEndpoint,
        path: `/state?id=${thirdPartyId}&mbox=${mboxName}`
    };
    
    // Callback function used to deal with response
    var callback = function(response){
        var body = '';
        response.on('data', function(data) {
            body += data;
        });
        
        response.on('end', function() {
            console.log(body);
        });
    };
    var req = http.request(requestOptions, callback);
    req.end();
}

function updateOfferContent(session, callback, content, name, accessToken) {
    var cardTitle = 'Update Offer';
    var options = {
        method: 'PUT',
        host: 'mc.adobe.io',
        path: `/${process.env.tenantId}/target/offers/content/${process.env.offerId}`,
        headers: {
            'Content-Type': 'application/vnd.adobe.target.v1+json',
            'Authorization': `Bearer ${accessToken}`,
            'X-Api-Key': `${process.env.clientId}`
        }
    };
    
    var callbackResponse = function(response) {
        console.log('Status: ' + response.statusCode);
        var str = '';
        response.on('data', function(chunk) {
            str += chunk;
        });
        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        response.on('end', () => {
            console.log('Body: ' + JSON.stringify(str));

            var data = JSON.parse(str);
            var offerName = data.name;
            var speechOutput = 'No response';
            if (response.statusCode === 200) {
                speechOutput = `Your offer called ${offerName} has been successfully changed`;
            } else {
                speechOutput = 'Something went terribly wrong';
            }
            callback({}, buildSpeechletResponse(cardTitle, speechOutput, '', true));
            sendMessage(getThirdPartyId(session.user), mbox);
        });
    };
    
    console.log(`Name: ${name}, content: ${content}`);
    if (name === undefined) {
        name = 'Alexa updated offer';
    }
    var postData = `{"name": "${name}","content": "{\\"text\\": \\"${content}\\",\\"image\\" : \\"<img src=\\\\\\"/images/las-vegas.jpg\\\\\\"/>\\"}"}`;

    console.log(`Post data: ${postData}`);
    var req = https.request(options, callbackResponse);
    req.write(postData);
    req.end();
}

function generateTokenAndUpdateOfferContent(session, callback, content, name) {
    var requestOptions = {
      method : 'POST',
      host: 'ims-na1.adobelogin.com',
      path: `/ims/exchange/jwt/?client_id=${process.env.clientId}&client_secret=${process.env.clientSecret}&jwt_token=${process.env.jsonWebToken}`,
    };
    
    var responseCallback = function(response){
       // Continuously update stream with data
       var body = '';
       response.on('data', function(data) {
          body += data;
       });
       
       response.on('end', function() {
          // Data received completely.
          console.log(body);
          var token = JSON.parse(body);
          if (token.error_description !== undefined) {
              callback({}, buildSpeechletResponse('Error', 'Incorrect token data provided', '', true));
              return;
          }
          var accessToken = JSON.parse(body).access_token;
          
          console.log(accessToken);
          updateOfferContent(session, callback, content, name, accessToken);
       });
    };
    console.log('JWT exchange request: ' + JSON.stringify(requestOptions));
    var req = https.request(requestOptions, responseCallback);
    req.end();
}

// --------------- Functions that control the skill's behavior -----------------------
function getContent(session, callback, cardTitle, mboxName, shouldEndSession, overrideResponse) {
    let repromptText = '';
    let sessionAttributes = {};
    let speechOutput = '';
    
    var options = {
      method : 'POST',
      host: edgeHost,
      path: `/rest/v1/mbox/${session.sessionId}?client=${clientCode}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    var callbackResponse = function(response) {
      console.log('Status: ' + response.statusCode);
      var str = '';
      response.on('data', function(chunk) {
        str += chunk;
        console.log('chunk: ' + JSON.stringify(chunk));
      });

      response.on('end', () => {
        console.log('Body: ' + JSON.stringify(str));
        
        if (response.statusCode === 200) {
            console.log(`mbox response: ${str}`);
            var data = JSON.parse(str);
            var content = JSON.parse(data.content);
            
            console.log('Text: ' + JSON.stringify(content.text));
            speechOutput = overrideResponse === undefined ? content.text : overrideResponse;
        } else {
            speechOutput = 'Something went terribly wrong';
        }
        callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
      });
    };

    var thirdPartyId = getThirdPartyId(session.user);
    var postData = '{"mbox": "' + mboxName + '","thirdPartyId": "' + thirdPartyId + '"}';

    var req = http.request(options, callbackResponse);
    req.write(postData);
    req.end();
    
    sendMessage(thirdPartyId, mboxName);
}

function getWelcomeResponse(session, callback) {
    const cardTitle = 'Welcome';
    const speechOutput = 'Welcome to the Marketing Summit';
    const shouldEndSession = false;

    getContent(session, callback, cardTitle, 'helloMbox', shouldEndSession);
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Thank you for using Adobe Target!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

// --------------- Events -----------------------
/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}, user=${session.user.userId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}, user=${session.user.userId}`);

    // Dispatch to your skill's launch.
    getWelcomeResponse(session, callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    switch (intentName) {
        case 'SayHello':
            getContent(session, callback, 'Hello', 'helloMbox', true);
        break;
        case 'GetContent':
            getContent(session, callback, 'Get Content', mbox, true);
        break;
        case "UpdateOfferContent":
            generateTokenAndUpdateOfferContent(session, callback, intent.slots.content.value);
        break;
        case "UpdateOffer":
            generateTokenAndUpdateOfferContent(session, callback, intent.slots.content.value, intent.slots.name.value);
        break;
        case "Reset":
            getContent(session, callback, 'Flush', 'initialMbox', true, `OK. Let's put the past behind us and start from scratch`);
        break;
        case "IotSlide":
            getContent(session, callback, 'Show slide', 'iotMbox', true, `Here you go! I hope it's what you asked for.`);
        break;
        case "ArchitectureSlide":
            getContent(session, callback, 'Show slide', 'architectureMbox', true, `Sure. That's easy`);
        break;
        case "AMAZON.HelpIntent":
            getWelcomeResponse(session, callback);
        break;
        case "AMAZON.StopIntent":
        case "AMAZON.CancelIntent":
            handleSessionEndRequest(callback);
        break;
        default:
            throw new Error('Invalid intent');
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}

// --------------- Main handler -----------------------
// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        if (event.session.application.applicationId !== 'amzn1.ask.skill.39f071a8-02c6-4db0-a805-7a69dbc22d9f') {
             callback('Invalid Application ID');
        }

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
