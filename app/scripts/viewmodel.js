'use strict';


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
  var self = this;

  // view object to hold all knockout objects
  self.view = {
    query: ko.observable(),
    crsCode: ko.observable(),
    stationName: ko.observable(),
    weatherLocationName: ko.observable(),
    weatherCurrentTemp: ko.observable(),
    weatherDescription: ko.observable(),
    wikipediaText: ko.observable(),

    // an array to hold the list of stations, does not need to be obervable
    // because will not change
    stationList: [],

    // an array to hold objects formatted in 'StationName [CRSCode]' for
    // the autocomplete search.
    queryList: [],

    // functions called from knockout, they point to functions on the prototype
    // chain
    queryHandler: function() {},
    mapFilter: function() {}
  };
};

MainViewModel.prototype.bindMapMarkers = function(map, markers) {
  // we need the current this scope in the closure
  var that = this;

  for (var i = 0, len = markers.length; i < len; i++) {
    google.maps.event.addListener(markers[i], 'click', (function(iCopy) {
      return function() {
        // set the current location for all item on the view
        that.setLocation(iCopy);

        // pan and zoom the map to the clicked location
        that.mapView.panAndZoomMap(iCopy);

        // display an info window with a street view location
        that.mapView.displayInfoWindow(iCopy);

        // set all markers to visiable - markers might be filtered due to search
        that.mapView.setAllMarkersVisiable(iCopy);
      }
    })(i));
  }
};

MainViewModel.prototype.setLocation = function(i) {
  // check to see if the location is the CRS code or index
  $.isNumeric(i) ? this._setLocationByIdx(i) : this._setLocationbyCRS(i);

  // any time the station data changes, make new json calls
  // this.updateWeather(self.currentStation);
  // this.updateWikipeida();
};

MainViewModel.prototype._setLocationByIdx = function(i) {
  // only set new Station if a change is necessary
  if ((typeof self.stationName === "undefined") || (self.idx !== i)) {
    this._updateModel(i);
  }
};

MainViewModel.prototype._updateModel = function(i) {
  this.view.idx = this.stationModel.data[i].idx;
  this.view.lat = this.stationModel.data[i].lat;
  this.view.long = this.stationModel.data[i].long;
  this.view.crsCode(this.stationModel.data[i].crsCode);
  this.view.stationName(this.stationModel.data[i].stationName);

  // This is needed if the station is updated by clicking the map so the
  // search box matches the currently selected station
  this.view.query(this.stationModel.data[i].crsCode);
};

MainViewModel.prototype.launch = function() {
  this._initialize();
};

MainViewModel.prototype._initialize = function() {
  // get a Map View
  this.mapView = new MapView();

  // get a model that will station data
  this.stationModel = new StationModel();

  // have stationModel load the data and then callback the rest of our init
  this.stationModel.load((function() {

    // display markers
    this.mapView.setMapMarkers(this.stationModel.data);

    // display map
    this.mapView.displayMap();

    // bind marker click events
    this.bindMapMarkers(this.mapView.map, this.mapView.markers);

    // init search autocomplete
    // this._initalizeSearch();

    // bind the view to this viewmodel
    // console.log(self.view);
    ko.applyBindings(this.view);
  }).bind(this));
};





/*

  // self.map = {};

  this.queryHandler = function(event, ui) {
    // TODO: have to get the text between [...] as the parm below
    // self.setLocation(ui.item.value);

    // trigger a click event on the map
    // console.log(self.map.markers[0].title);
    // console.log(ui.item.value);
    // console.log(this);
    for (var i = 0, len = this.map.markers.length; i < len; i++) {
      // console.log(this.map.markers[i]);
      if (ui.item.value === this.map.markers[i].title) {
        google.maps.event.trigger(this.map.markers[i], 'click');
        break;
      }
    }
  };

  // TODO: when focus leaves the search box, markers are restored...
  self.mapFilter = function(event, ui) {
    // hide all the markers
    for (var k = 0, len1 = self.map.markers.length; k < len1; k++) {
      self.map.markers[k].setVisible(false);
    }

    // set map bounds to searched results
    // console.log(ui.content);
    // console.log(this);

    // find the max bounds of the currently searched markers
    var southWestBound,
      northEastBound,
      bounds,
      lats = [],
      lngs = [],
      i, j, len, len2;

    for (i = 0, len2 = ui.content.length; i < len2; i++) {

      for (var j = 0, len = self.map.markers.length; j < len; j++) {

        if (ui.content[i].label === self.map.markers[j].getTitle()) {
          self.map.markers[j].setVisible(true);

          // create an array of all the lats and longs found
          lats.push(self.map.markers[j].getPosition().lat());
          lngs.push(self.map.markers[j].getPosition().lng());
        }
      }
    }

    // SouthWest map bound is the MIN lattitude and long found in the search
    southWestBound =  new google.maps.LatLng(Math.min.apply(Math,lats),
      Math.min.apply(Math,lngs));

    // NorthEast map bound is the MAX lattitude and long found in the search
    northEastBound = new google.maps.LatLng(Math.max.apply(Math,lats),
      Math.max.apply(Math,lngs));

    // create a latlng bounds object and then use that to fit the map to the
    // bounds of the search
    // self.map.fitBounds(new google.maps.LatLngBounds(southWestBound, northEastBound));
    console.log(self.map.getZoom());
  };

  this.updateWeather = function() {
    Stations.getCurrentWeather(self, function(data) {
      self.weatherLocationName(data.locationName);
      self.weatherCurrentTemp(data.temp);
      self.weatherDescription(data.description);
    });
  };

  this.updateWikipeida = function() {
    Stations.getWikipeidaSummary(this, function(data) {
      self.wikipediaText(data);
    });
  };
}

MainViewModel.prototype = {
  constructor: MainViewModel,
  self: this,

  _initializeSearch: function() {
    for (var i = 0, len = Stations.data.length; i < len; i++) {
      this.queryList.push(Stations.data[i].stationName + ' [' + Stations.data[i].crsCode + ']');
    }
  },

  setLocation: function(i) {
    // check to see if the location is the CRS code or index
    $.isNumeric(i) ? this._setLocationByIdx(i) : this._setLocationbyCRS(i);

    // this.autocomplete('');

    // any time the station data changes, make new json calls
    this.updateWeather();
    this.updateWikipeida();
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

  bindMapMarkers: function(prevThis) {
    ,

  launch: function() {
    this._initialize();
  },

  _initialize: function() {
    // get a Map View
    var mapView = new MapView();

    // get a model that will station data
    var stationModel = new StationModel();

    // have stationModel load the data and then callback the rest of our init
    stationModel.load(function() {

      // display markers
      // this.setMapMarkers(stationModel.data);

      // bind marker click events
      // this.bindMapMarkers();

      // init search autocomplete
      // this._initalizeSearch();

      // bind the view to this viewmodel
      console.log(self.view);
      ko.applyBindings(self.view);
    });


    // Stations.load((function() {
    //   // set the initial location on page load
    //   // TODO: remember last station using a cookie
    //   this.setLocation(APP.defaultStation);
    //
    //   // create a map and display markers with the data passed in
    //   var m = Map(Stations.data);
    //   var map = m.map;
    //   var markers = m.markers;
    //
    //   this.bindMapMarkers(this);
    //
    //   // build a stationlist that is compatabile with jQueryUI autocompelte
    //   this._initializeSearch();
    //
    //   // bind the view to the model
    //   ko.applyBindings(this);
    // }).bind(this));
  }
};
*/
