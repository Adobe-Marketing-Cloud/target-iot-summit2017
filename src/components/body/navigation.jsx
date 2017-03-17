const React = require("react");
const PROFILE = require("../profile");

const Navigation = () => {
  var img = PROFILE.getCurrentProfileImage();

  return (
      <nav className="navbar navbar-default">
        <div className="container-fluid">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"/>
              <span className="icon-bar"/>
              <span className="icon-bar"/>
            </button>
            <a className="navbar-brand" href="#">Adobe Target: IoT Demo</a>
          </div>
          <div id="navbar" className="navbar-collapse collapse">
             <ul className="nav navbar-nav navbar-right">
                <div id="img-div" dangerouslySetInnerHTML={{__html: "<img src=\"" + img + "\" height=\"50\" width=\"50\"/>"}}/>
            </ul>
          </div>
        </div>
      </nav>
  );
};

module.exports = Navigation;
