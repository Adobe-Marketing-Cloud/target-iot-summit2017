const CONFIG = require("../../config.json");
const PROFILE_IMAGES = CONFIG.profileImages;
var id = "name";
var mbox = "helloMbox";

function setThirdPartyId(ident) {
  id = ident;
}

function getThirdPartyId(){
	return id;
}

function getMbox(){
	return mbox;
}

function setMbox(mb){
	mbox = mb;
}

function getCurrentProfileImage(){
	var img = PROFILE_IMAGES[id];
	console.log("Image found = " + img);
	return img ? "./images/" + img : "./images/adobeTarget.png";
}

module.exports.setThirdPartyId = setThirdPartyId;
module.exports.getThirdPartyId = getThirdPartyId;
module.exports.getMbox = getMbox;
module.exports.setMbox = setMbox;
module.exports.getCurrentProfileImage = getCurrentProfileImage;