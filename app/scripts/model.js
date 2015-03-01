'use strict';
// This object will manage all the stations.  It will hold the methods used
// supply other methods with the location data.

// Create and empty Stations object to hold station methods and data
var Stations = {};

Stations.initialize = function(callback) {
  Stations.currentStation = {};
  Stations.currentStation.crsCode = ko.observable();
  Stations.currentStation.stationName  = ko.observable();
  Stations.currentStation.weatherLocationName  = ko.observable();
  Stations.currentStation.weatherCurrentTemp  = ko.observable();
  Stations.currentStation.weatherDescription  = ko.observable();
  callback();
};

// Load the stations from the JSON file if not loaded already
Stations.load = function(callback) {
  if (!Stations.data) {
    $.getJSON('../stations.json')
      .done(function(json) {
        Stations.data = json;

        // for now initilize currentStation to Huddersfield
        // Stations.setLocation(APP.defaultStation);
        // console.log(Stations.data.length + ' stations loaded.');

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

Stations.getCurrentStationData = function() {
  // get current weather :=:=:=:=:=:=:==:=:=:=:=:=:==:=:=:=:=:=:==:=:=:=:=:=:=:
  $.ajax({
    url: "http://api.openweathermap.org/data/2.5/weather",
    data: {
      lat: this.currentStation.lat,
      lon: this.currentStation.long
    },

    // Whether this is a POST or GET request
    type: "GET",

    // The type of data we expect back
    dataType: "json",

    // Code to run if the request succeeds;
    // the response is passed to the function
    success: function(json) {
      Stations.currentStation.weatherLocationName(json.name);
      Stations.currentStation.weatherCurrentTemp(json.main.temp - 273.5);  //convert from K to C
      Stations.currentStation.weatherDescription(json.weather[0].description);
    },

    // Code to run if the request fails; the raw request and
    // status codes are passed to the function
    error: function(xhr, status, errorThrown) {
      alert("Sorry, there was a problem!");
      console.log("Error: " + errorThrown);
      console.log("Status: " + status);
      console.dir(xhr);
    },

    // Code to run regardless of success or failure
    complete: function(xhr, status) {

    }
  });
  // get google image :=:=:=:=:=:=:==:=:=:=:=:=:==:=:=:=:=:=:==:=:=:=:=:=:=:

  // get Wikipedia article info :=:=:=:=:=:=:==:=:=:=:=:=:==:=:=:=:=:=:==:=:=:
};

Stations.setLocation = function(i) {
  // only set new Station if a change is necessary
  if ((typeof Stations.currentStation === "undefined") || (Stations.currentStation.idx !== i)) {
    Stations.currentStation.idx = Stations.data[i].idx;
    Stations.currentStation.lat = Stations.data[i].lat;
    Stations.currentStation.long = Stations.data[i].long;
    Stations.currentStation.crsCode(Stations.data[i].crsCode);
    Stations.currentStation.stationName(Stations.data[i].stationName);

    // any time the station data changes, make new json calls
    Stations.getCurrentStationData();
  }
};
