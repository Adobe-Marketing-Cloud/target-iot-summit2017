
$(function () {
  console.log("Socket IO client initializing...");
  var socket = io.connect();
  socket.on('reload', function(msg){
	console.log("Client received reload directive");
    location.reload();
  });
  socket.on('message', function(msg){
	console.log("Client received : " + msg);
    $('#hero-banner').append($('<li>').text(msg));
  });
});
