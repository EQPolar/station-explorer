'use strict';
// This object will manage all the stations.  It will hold the methods used
// supply other methods with the location data.

// Create and empty Stations object to hold station methods and data
var Stations = {};

// Load the stations from the JSON file if not loaded already
Stations.load = function(callback) {
  if (!Stations.data) {
    $.getJSON('../stations.json')
      .done(function(json) {
        Stations.data = json;

        // for now initilize currentStation to Huddersfield
        Stations.setLocation(APP.defaultStation);
        console.log(Stations.data.length + ' stations loaded.');

        if (callback && typeof(callback) === 'function') {
          callback();
        }
      })
      .fail(function(jqxhr, textStatus, error) {
        var err = textStatus + ', ' + error;
        console.log("Request Failed: " + err);
        //TODO: better fail and maybe log to firebase?
      });
  }

};

Stations.setLocation = function(i) {
  Stations.currentStation = {
    idx: Stations.data[i].idx,
    crsCode: Stations.data[i].crsCode,
    stationName: Stations.data[i].stationName
  };
  console.log(Stations.currentStation);
};
