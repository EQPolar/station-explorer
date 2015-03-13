'use strict';

// :=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:
// Map Object will init and display the map.
// param constructor: array of objects to map
// :=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:

function Map(stationData, callback) {
  // s will be shorthand for an array of stationData objects
  this.s = stationData;

  // array of all the markers we are adding to the map
  this.markers = [];

  // initialize the map and add markers
  var mapOptions = {
    zoom: 6,
    center: APP.defaultMapCenter
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  for (var i = 0; i < this.s.length; i++) {
    var myLatlng = new google.maps.LatLng(this.s[i].lat, this.s[i].long);

    var marker = new google.maps.Marker({
      position: myLatlng,
      title: this.s[i].stationName + ' [' + this.s[i].crsCode + ']'
    });
    marker.setMap(map);

    // push all the markers on to an array so we can access them later
    this.markers.push(marker);


  }

  // display the map
  google.maps.event.addDomListener(window, 'load', Map.initialize);
}

// // place holder if methods need to be added in the future
// Map.prototype = {
//   constructor: Map
// }

// :=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:
// MainViewModel
// constructor will:
//    1. create Station objects
//    3. when station is ready
//      a. create a map object, passing station data
//      b. setup search
//      c. apply bindings
// :=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:

function MainViewModel() {
  // to hold an object with station data formatted for autocomplete seach
  this.queryList = [];
  var self = this;

  self.currentStation = {};
  self.currentStation.queryList = [];
  self.currentStation.query = ko.observable();
  self.currentStation.crsCode = ko.observable();
  self.currentStation.stationName = ko.observable();
  self.currentStation.weatherLocationName = ko.observable();
  self.currentStation.weatherCurrentTemp = ko.observable();
  self.currentStation.weatherDescription = ko.observable();
  self.currentStation.wikipediaText = ko.observable();

  self.currentStation.queryHandler = function(event, ui) {
    self.setLocation(ui.item.value);
  };

  // TODO: when focus leaves the search box, markers are restored...
  self.currentStation.mapFilter = function(event, ui) {
    // remove all markers
    for (var k = 0, len = self.map.markers.length; k < len; k++) {
      self.map.markers[k].setVisible(false);
    }
    console.log(ui.content);
    // for every autocompelte search result being shown
    for (var i = 0, len = ui.content.length - 1; i < len; i++) {

      // console.log("label " + i);
      // console.log(" is " + ui.content[i].label );

      for (var j = 0, len = self.map.markers.length; j < len; j++) {

        if (ui.content[i].label === self.map.markers[j].title) {
          self.map.markers[j].setVisible(true);
        }
      }
    }
  };

  // Takes the idx of
  this._updateModel = function(i) {
    self.currentStation.idx = Stations.data[i].idx;
    self.currentStation.lat = Stations.data[i].lat;
    self.currentStation.long = Stations.data[i].long;
    self.currentStation.crsCode(Stations.data[i].crsCode);
    self.currentStation.stationName(Stations.data[i].stationName);

    // This is needed if the station is updated by clicking the map so the
    // search box matches the currently selected station
    self.currentStation.query(Stations.data[i].crsCode);
  };

  // self._setLocationbyCRS = function(code) {
  //
  // };

  this._setLocationByIdx = function(i) {
    // only set new Station if a change is necessary
    if ((typeof self.currentStation === "undefined") || (self.currentStation.idx !== i)) {
      self._updateModel(i);
    }
  };

  // self.setLocation = function(i) {
  // };

  this.updateWeather = function() {
    var data = Stations.getCurrentWeather(self.currentStation, function(data) {
      self.currentStation.weatherLocationName(data.locationName);
      self.currentStation.weatherCurrentTemp(data.temp);
      self.currentStation.weatherDescription(data.description);
    });

  };
}

MainViewModel.prototype = {
  constructor: MainViewModel,

  _initializeSearch: function() {
    for (var i = 0, len = Stations.data.length; i < len; i++) {
      this.currentStation.queryList.push({
        label: Stations.data[i].stationName + ' [' + Stations.data[i].crsCode + ']',
        value: Stations.data[i].crsCode
      });


      // this.queryList.push({
      //   label: Stations.data[i].stationName + ' [' + Stations.data[i].crsCode + ']',
      //   value: Stations.data[i].crsCode
      // });
    }

    // console.log(this.queryList);
    // $("#search").autocomplete({
    //   source: this.queryList
    // });
  },

  setLocation: function(i) {

    // check to see if the location is the CRS code or index
    if ($.isNumeric(i)) {
      this._setLocationByIdx(i);
    } else {
      this._setLocationbyCRS(i);
    }
    // any time the station data changes, make new json calls
    this.updateWeather();


    // TODO: wikipedia function
    // Stations.getWikipeidaSummary(self.currentStation);
  },

  _setLocationbyCRS: function(code) {
    // only search if we have a valid CRS code, which is 3 chars
    if (code.length === 3) {

      // search for the code in our data
      for (var i = 0, len = Stations.data.length; i < len; i++) {
        if (code === Stations.data[i].crsCode) {
          this._updateModel(i);
          break;
        }
      }
    }
  },

  bindMapMarkers: function() {
    for (var i = 0; i < this.map.markers.length; i++) {

      // TODO: this will need to be moved out of the map object and to the viewmodel
      google.maps.event.addListener(this.map.markers[i], 'click', (function(iCopy) {
        return function() {
          // TODO: this will fix this coupling here
          // Stations.setLocation(iCopy);
          console.log(iCopy);
          this.setLocation.call(this, iCopy);
        }
      })(i));
    }
  },

    launch: function() {
    this._initialize();
  },

  _initialize: function() {
    Stations.load((function() {

      Stations.initialize();

      // set the initial location on page load
      // TODO: remember last station using a cookie
      this.setLocation(APP.defaultStation);

      // create a new map object, init and display the map
      // the callback function gets the id of the clicked
      // map marker
      this.map = new Map(Stations.data);

      this.bindMapMarkers();

      console.log(this.map.markers);

      // build a stationlist that is compatabile with jQueryUI autocompelte
      this._initializeSearch();

      // bind the view to the model
      // console.log(this.currentStation);
      ko.applyBindings(this.currentStation);
    }).bind(this));
  }
};

$(document).ready(function() {
  var app = new MainViewModel();
  // this.setLocation('LED');
  // console.dir(app);
  app.launch();
});
