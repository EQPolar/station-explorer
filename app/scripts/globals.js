// Additional Methods

String.prototype.capitalizeOnlyFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

// App Globals :=:=

var APP = {};

APP.defaultMapCenter = {
  "lat": 51.5072, // London, UK
  "lng": -0.1275
};

// Make the default station Huddersfield
APP.defaultStation = 'LED';

// API Keys - I know this is bad practice to be fixed with a backend
APP.openWeatherMapAPIKey = "6557cfc9892774d312f5367ff790360b";

APP.ajaxError = 'could not load data';

APP.InfoWindowContent = '<h5>%title%</h5> <p><img src="%imgURL%" alt="Street Map Image" /></p>';
APP.GoogleStreetViewURL = "http://maps.googleapis.com/maps/api/streetview?size=300x200&location=%lat%,%long%";
