const React = require("react");


const Hero = ({customization}) => {
  const hero = customization && customization["data.mbox"];
  const img = hero ? hero.image : `<img src="../../../../images/adobe_summit.png" height="545" width="1024"/>`;
  const txt = hero ? hero.text : "Adobe Target IoT Demo";
  console.log("Customization call : " + JSON.stringify(hero));
  return (
    <div id="hero2">
      <div id="hero-banner" dangerouslySetInnerHTML={{__html: "<h1>" + txt + "</h1>" + img}}/>
    </div>
  );
};

module.exports = Hero;