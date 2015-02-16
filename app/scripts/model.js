// This object will manage all the stations.  It will hold the methods used
// supply other methods with the location data.

// :=:=:=:=:=:= methods needed :=:=:=:=:=:=

// function load() - will load the station data from a JSON file on
// the server

// function length() - will report back the amount of stations loaded.  If undefined
// then the AJAX call has not completed.

// function getLatLong(args) - if called with a number it will return that station idx
// lat and long, useful for iterating through the list.  If passed a string of
// three letter CRS code, it will pass back the LatLong for that station.

// function getStation(args) -- will pass back an object will all the station info.
// if called with a number it will give the station by idx, useful for interating,
// if passed a string of 3 chars it will return that station by CRS code.


// Create and empty Stations object to hold station methods and data
var Stations = {};

// Load the stations from the JSON file if not loaded already
Stations.load = function(callback) {
  if (!Stations.data) {
    $.getJSON("../stations.json")
      .done(function(json) {
        Stations.data = json;
        console.log(Stations.data.length + " stations loaded.");
      })
      .fail(function(jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        console.log("Request Failed: " + err);
        //TODO: better fail and maybe log to firebase?
      });
  }
  console.log("before callback");
  if (callback && typeof(callback) === "function") {
    callback();
  }
};

Stations.load();
