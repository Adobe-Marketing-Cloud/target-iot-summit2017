const express = require("express");
const app = express();
const ab = require("./src/routes/ab");

// const xt = require("./src/routes/xt");
// const mboxParameters = require("./src/routes/mbox-parameters");
// const profileParameters = require("./src/routes/profile-parameters");
// const jsonOffer = require("./src/routes/json-offer");
// const thirdPartyId = require("./src/routes/third-party-id");
// const customerAttributes = require("./src/routes/customer-attributes");
// const recommendations = require("./src/routes/recommendations");
const PROFILE = require("./src/components/profile.js");

const PORT = process.env.PORT || 5000;

app.use(express.static("public"));

app.get("/", ab);
app.get("/ab", ab);
// app.get("/xt", xt);
// app.get("/mbox-parameters", mboxParameters);
// app.get("/profile-parameters", profileParameters);
// app.get("/json-offer", jsonOffer);
// app.get("/third-party-id", thirdPartyId);
// app.get("/customer-attributes", customerAttributes);
// app.get("/recommendations", recommendations);

server = app.listen(PORT, function () {
  console.log("Target Node Client React App is Running on Port", PORT);
});

var io = require('socket.io').listen(server);

io.on('connection', function(socket){
  console.log('Client browser connected');
  socket.on('disconnect', function(){
    console.log('Client browser disconnected');
  });
});

app.get('/socket-debug', function(req, res){
  var message = req.query.message;
  console.log("message received : " + message);
  if (!message) {
     message = "default";	
  }
  io.sockets.emit("message",message);
  res.send("Finished pushing to socket. Message=" + message);
});

app.get('/state', function(req, res){
  var thirdPartyId = req.query.id;
  console.log("ID received : " + thirdPartyId);
  if (thirdPartyId) {
	PROFILE.setThirdPartyId(thirdPartyId);
  }
  var mbox = req.query.mbox;
  console.log("mbox received : " + mbox);
  if (mbox) {
     PROFILE.setMbox(mbox);	
  }
  var messageStr = "";
  if (io.sockets) {
	  messageStr = "Websocket connection found, pushed reload directive. ";
	  io.sockets.emit("reload","reload");
  }
  messageStr+="Current State: 3rdPartyId=" + PROFILE.getThirdPartyId() + " , mbox= " + PROFILE.getMbox();
  res.send(messageStr);
});
