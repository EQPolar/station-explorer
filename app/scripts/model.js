'use strict';

function StationModel() {
  // will hold our model data
  this.data = {};
}

StationModel.prototype.load = function(callback) {
  // load the list of train statins from local JSON file
  $.getJSON(APP.urlStationJSON)
    .done((function(json) {
      this.data = json;
      
      if (callback && typeof(callback) === 'function') {
        callback();
      }
    }).bind(this))
    .fail(function(jqxhr, textStatus, error) {
      var err = textStatus + ', ' + error;
      if (APP.debug) {
        console.log("Request Failed: " + err);
      }

      // notification window
      var notify = new NotificationView();
      notify.fatalError();
    });



};
/*




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
        // Stations.setLocation(APP.defaultStation);
        // console.log(Stations.data.length + ' stations loaded.');

        if (callback && typeof(callback) === 'function') {
          callback.apply(this);
        }
      })
      .fail(function(jqxhr, textStatus, error) {
        var err = textStatus + ', ' + error;
        console.log("Request Failed: " + err);
        //TODO: better fail and maybe log to firebase?
      });
  }

};

Stations.getCurrentWeather = function(station, callback) {
  // get current weather :=:=:=:=:=:=:==:=:=:=:=:=:==:=:=:=:=:=:==:=:=:=:=:=:=:
  var weatherData = {};

  $.ajax({
    url: "http://api.openweathermap.org/data/2.5/weather",
    data: {
      lat: station.lat,
      lon: station.long,
      APPID: APP.openWeatherMapAPIKey
    },

    // Whether this is a POST or GET request
    type: "GET",

    // The type of data we expect back
    dataType: "json",

    timeout: 7000,

    // Code to run if the request succeeds;
    // the response is passed to the function
    success: function(json) {
      weatherData = {
        locationName: json.name,
        temp: json.main.temp - 273.5,
        description: json.weather[0].description
      };
      callback(weatherData);

    },

    // Code to run if the request fails; the raw request and
    // status codes are passed to the function
    error: function(xhr, status, errorThrown) {
      // alert("Sorry, there was a problem!");
      console.log("Error: " + errorThrown);
      console.log("Status: " + status);
      console.dir(xhr);
    },

    // Code to run regardless of success or failure
    complete: function(xhr, status) {

    }
  });
}
  // get google image :=:=:=:=:=:=:==:=:=:=:=:=:==:=:=:=:=:=:==:=:=:=:=:=:=:=:

  // get Wikipedia article info :=:=:=:=:=:=:==:=:=:=:=:=:==:=:=:=:=:=:==:=:=:

  // TODO: this needs it's own function
  // TODO: have to implement a way to more reliabile pull the articles.
  // Probably need to map all article ids and get results that way.
Stations.getWikipeidaSummary = function(station, callback) {
  // console.log(station);
  $.ajax({

    // The URL for the request
    url: "http://en.wikipedia.org/w/api.php",

    // The data to send (will be converted to a query string)
    data: {
      action: 'query',
      format: 'json',
      // wikipedia article
      titles: decodeURI(station.stationName().capitalizeOnlyFirstLetter()),
      prop: 'extracts',
      exintro: null,
      continue: null,
      redirects: null
    },

    // Whether this is a POST or GET request
    type: "GET",

    // The type of data we expect back
    dataType: "jsonp",

    timeout: 10000,

    // Code to run if the request succeeds;
    // the response is passed to the function
    success: function(json) {
      var i, extract;
      var keys = [];
      // console.log(json);

      for (var i in json.query.pages) {
        keys.push(i);
      }
      // console.log(keys);

      // if keys contains more than one item this means wikiepdia sent back
      // more than one article when we are expecting 1, log to console for now
      if (keys.length > 1) {
        console.log("More than one article key.");
      }

      // if the first key in not -1, we callback with the summary.  Otherwise
      // callback with the error message.
      (keys[0] != -1) ? callback(json.query.pages[keys[0]].extract) : callback(APP.ajaxError);
    },

    // Code to run if the request fails; the raw request and
    // status codes are passed to the function
    error: function(xhr, status, errorThrown) {

      console.log("Error: " + errorThrown);
      console.log("Status: " + status);
      console.dir(xhr);
    },

    // Code to run regardless of success or failure
    complete: function(xhr, status) {
      // alert("The request is complete!");
    }
  });
};

// // Takes the idx of
// Stations._updateModel = function(i) {
//   Stations.currentStation.idx = Stations.data[i].idx;
//   Stations.currentStation.lat = Stations.data[i].lat;
//   Stations.currentStation.long = Stations.data[i].long;
//   Stations.currentStation.crsCode(Stations.data[i].crsCode);
//   Stations.currentStation.stationName(Stations.data[i].stationName);
//
//   // This is needed if the station is updated by clicking the map so the
//   // search box matches the currently selected station
//   Stations.currentStation.query(Stations.data[i].crsCode);
// };
//
// Stations._setLocationbyCRS = function(code) {
//   // only search if we have a valid CRS code, which is 3 chars
//   if (code.length === 3) {
//
//     // search for the code in our data
//     for (var i = 0, len = Stations.data.length; i < len; i++) {
//       if (code === Stations.data[i].crsCode) {
//         Stations._updateModel(i);
//         break;
//       }
//     }
//   }
// };
//
// Stations._setLocationByIdx = function(i) {
//   // only set new Station if a change is necessary
//   if ((typeof Stations.currentStation === "undefined") || (Stations.currentStation.idx !== i)) {
//     Stations._updateModel(i);
//   }
// };
//
// Stations.setLocation = function(i) {
//   // check to see if the location is the CRS code or index
//   if ($.isNumeric(i)) {
//     Stations._setLocationByIdx(i);
//   } else {
//     Stations._setLocationbyCRS(i);
//   }
//     // any time the station data changes, make new json calls
//     Stations.getCurrentStationData();
// };

// TODO: when a station is clicked on, information has to be cleared and replaced
// with a ajax waiting request indication.
*/
