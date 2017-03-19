'use strict';

/**
 * This is a sample Lambda function that sends an Email on click of a
 * button. It creates a SNS topic, subscribes an endpoint (EMAIL)
 * to the topic and publishes to the topic.
 *
 * Follow these steps to complete the configuration of your function:
 *
 * 1. Update the email environment variable with your email address.
 * 2. Enter a name for your execution role in the "Role name" field.
 *    Your function's execution role needs specific permissions for SNS operations
 *    to send an email. We have pre-selected the "AWS IoT Button permissions"
 *    policy template that will automatically add these permissions.
 */

const edgeHost = process.env.edgeHost;
const clientCode = process.env.clientCode;
const mboxName = process.env.mboxName;
const thirdPartyId = process.env.thirdPartyId;

const AWS = require('aws-sdk');
const https = require('https');
const http = require('http');

const EMAIL = process.env.email;
const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });

var profileUpdatePath = `/m2/${clientCode}/profile/update`;

function sendMessage(thirdPartyId) {
    var requestOptions = {
      method : 'GET',
      host: process.env.amazonEndpoint,
      path: `/state?id=${thirdPartyId}&mbox=${mboxName}`
    };
    
    console.log(JSON.stringify(requestOptions));
    
    // Callback function is used to deal with response
    var callback = function(response){
       // Continuously update stream with data
       var body = '';
       response.on('data', function(data) {
          body += data;
       });
       
       response.on('end', function() {
          // Data received completely.
          console.log(body);
       });
    };
    // Make a request to the server
    var req = http.request(requestOptions, callback);
    req.end();
}

/**
 * The following JSON template shows what is sent as the payload:
{
    "serialNumber": "GXXXXXXXXXXXXXXXXX",
    "batteryVoltage": "xxmV",
    "clickType": "SINGLE" | "DOUBLE" | "LONG"
}
 *
 * A "LONG" clickType is sent if the first press lasts longer than 1.5 seconds.
 * "SINGLE" and "DOUBLE" clickType payloads are sent for short clicks.
 *
 * For more documentation, follow the link below.
 * http://docs.aws.amazon.com/iot/latest/developerguide/iot-lambda-rule.html
 */
exports.handler = (event, context, callback) => {
    console.log('Received event:', event.clickType);
    
    var options = {
      method : 'GET',
      host: edgeHost,
      path: profileUpdatePath + `?mbox3rdPartyId=${thirdPartyId}&profile.button=${event.clickType}`
    };
    
    var responseBody = '';
    https.get(options, (response) => {
      response.on('data', (chunk) => {
        responseBody += chunk;
      });
      response.on('end', () => {
        console.log('Response:', responseBody);
        sendMessage(thirdPartyId);
      });
    });
};