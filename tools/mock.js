// const http = require('http');
// const server = http.createServer(handleRequest);
// const PORT = 5001;
// //const PROFILE = require("../components/profile");
// const PROFILE = require("../src/components/profile.js");
// 
// function getData() {
//   return {content: "<img src=\"https://dummyimage.com/940x400/fff/000.png&text=Image+from+mock+server\"/>"}
// }
// 
// function handleRequest(request, response){
//   const data = getData();
//   //Set the profile id if present in req
//   var parts = url.parse(request.url, true);
//   var query = parts.query;
//   thirdPartyId = query.id;
//   console.log("Mock received : " + thirdPartyId);
// 
//   PROFILE.setThirdPartyId(thirdPartyId);
// 
//   response.writeHead(200);
//   response.end("ThirdParty id = " + PROFILE.getThirdPartyId());
// }
// 
// server.listen(PORT, function(){
//   console.log('Server listening on: http://localhost:%s', PORT);
// });
var express = require('express');
const PROFILE = require("../src/components/profile.js");
var app = express();

app.get('/', function(req, res){
  var thirdPartyId = req.query.id;
  console.log("Mock received : " + thirdPartyId);
  PROFILE.setThirdPartyId(thirdPartyId);
  res.send("ThirdParty id received = " + PROFILE.getThirdPartyId());
});

app.listen(5001);
