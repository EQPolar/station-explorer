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

StationModel.prototype.getWeather = function(i, callback) {
  var that = this;

  var weatherData = {};

  $.ajax({
    url: "http://api.openweathermap.org/data/2.5/weather",
    data: {
      lat: this.data[i].lat,
      lon: this.data[i].long,
      APPID: APP.openWeatherMapAPIKey
    },

    timeout: APP.defaultAjaxTimeOut,

    success: function(json) {
      weatherData = {
        locationName: json.name,
        temp: json.main.temp - 273.5,
        description: json.weather[0].description
      };

      callback(weatherData);
    },

    error: function(xhr, status, errorThrown) {
      if (APP.debug) {
        console.log("Error: " + errorThrown);
        console.log("Status: " + status);
        console.dir(xhr);
      }

      var notify = new NotificationView();
      notify.warningError('Could not get weather for ' + that.data[i].stationName);
    }
  });
};

StationModel.prototype.getWikipedia = function(i, callback) {
  var that = this;
  
  $.ajax({

    // The URL for the request
    url: "http://en.wikipedia.org/w/api.php",

    // The data to send (will be converted to a query string)
    data: {
      action: 'query',
      format: 'json',
      // wikipedia article
      titles: decodeURI(this.data[i].stationName.capitalizeOnlyFirstLetter()),
      prop: 'extracts',
      exintro: null,
      continue: null,
      redirects: null
    },

    // Whether this is a POST or GET request
    type: "GET",

    // The type of data we expect back
    dataType: "jsonp",

    timeout: 5000,

    // Code to run if the request succeeds;
    // the response is passed to the function
    success: function(json) {
      var j, extract;
      var keys = [];
      // console.log(json);

      for (j in json.query.pages) {
        keys.push(j);
      }
      // console.log(keys);

      // if keys contains more than one item this means wikiepdia sent back
      // more than one article when we are expecting 1, log to console for now
      if (keys.length > 1) {
        console.log("More than one article key.");
      }

      // if the first key in not -1, we callback with the summary.  Otherwise
      // callback with the error message.
      if (keys[0] != -1) {
        callback(json.query.pages[keys[0]].extract);
      } else {
        var notify = new NotificationView();
        notify.warningError('Could not get Wikipedia summary for ' +
          that.data[i].stationName);

        // TODO: sending blank callback, have to trap that
        callback();
      }
    },

    // Code to run if the request fails; the raw request and
    // status codes are passed to the function
    error: function(xhr, status, errorThrown) {
      if (APP.debug) {
        console.log("Error: " + errorThrown);
        console.log("Status: " + status);
        console.dir(xhr);
      }

      var notify = new NotificationView();
      notify.warningError('Could not get Wikipedia summary for ' +
        that.data[i].stationName);
    },

    // Code to run regardless of success or failure
    complete: function(xhr, status) {
      // alert("The request is complete!");
    }
  });
};

// TODO: when a station is clicked on, information has to be cleared and replaced
// with a ajax waiting request indication.
