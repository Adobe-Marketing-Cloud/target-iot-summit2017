const Component = require("../components/catalog").AB;
const PROFILE = require("../components/profile");
const render = require("../services/rendering-service");

module.exports = (req, res) => {
  
  tId = PROFILE.getThirdPartyId();
  mboxName = PROFILE.getMbox();	
  const payload = {
    mbox: mboxName,
    thirdPartyId: tId 
  };

  render(Component, payload, req, res);
};
