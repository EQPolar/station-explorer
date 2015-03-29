/* globals ko, google, $, MapView, StationModel*/

'use strict';

// :=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:
// MainViewModel
// :=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:

function MainViewModel() {
  var that = this;

  // view object to hold all knockout objects
  this.view = {
    // true when updates are happening, triggers loading animation
    weatherUpdating: false,
    wikiUpdating: false,

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

    // functions knockout needs to know about, point to functions delcared
    // on the prototype chain
    queryHandler: function(event, ui) {
      that._queryHandler(event, ui);
    },
    mapFilter: function(event, ui) {
      that._mapFilter(event, ui);
    },

    // empty because submits are ignored on the search box
    submit: function() {},

    // function to toggle the show all "list view"
    toggleShowAll: function () {
      that._toggleShowAll();
    },

    listHandler: function(i) {
      that._listHandler(i);
    }
  };
}

MainViewModel.prototype._listHandler = function(data) {
  // close list view
  this._toggleShowAll();

  // lookup the station clicked by name and then trigger a click on it's marker
  for (var i = 0, len = this.mapView.markers.length; i < len; i++) {
    if (data === this.mapView.markers[i].title) {
      google.maps.event.trigger(this.mapView.markers[i], 'click');
      break;
    }
  }
};

// this will show/hide the show all "list view" by toggling the z-index 0 or 100
MainViewModel.prototype._toggleShowAll = function() {
  ($('#list').css('z-index') < 100) ? $('#list').css('z-index', 100) :
    $('#list').css('z-index', 0);
};


// if a click event on an autocomplete search is recived, search through the
// list of markers and trigger a click event
MainViewModel.prototype._queryHandler = function(e, ui) {
  for (var i = 0, len = this.mapView.markers.length; i < len; i++) {
    if (ui.item.value === this.mapView.markers[i].title) {
      google.maps.event.trigger(this.mapView.markers[i], 'click');
      break;
    }
  }
};

// when autocomplete results are being displayed, only display map markers
// that match the results. Make the map fit the displayed markers
MainViewModel.prototype._mapFilter = function(e, ui) {
  var i, j,
    len,
    len2,
    lats = [],
    lngs = [];

  // hide all map markers - then we will just show the markers in the search
  this.mapView.hideAllMapMarkers();

  // set the markers assosicated with autocomplete results to visiable
  // here the MainViewModel instance is going to look into the mapView instances
  // data, this is for perf reasons
  for (i = 0, len = ui.content.length; i < len; i++) {
    for (j = 0, len2 = this.mapView.markers.length; j < len2; j++) {
      if (ui.content[i].label === this.mapView.markers[j].getTitle()) {
        // set the map marker to visiable
        this.mapView.setMarkerVisiable(this.mapView.markers[j].idx);

        // create an array of all the lats and longs found
        lats.push(this.mapView.markers[j].getPosition().lat());
        lngs.push(this.mapView.markers[j].getPosition().lng());
      }
    }
  }

  // set map bounds searched for using the lat and lng values found
  this.mapView.setMapBounds(lats, lngs);
};

MainViewModel.prototype.bindMapMarkers = function(map, markers) {
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

        // animate marker
        that.mapView.animateMarker(iCopy);

        // set all markers to visiable - markers might be filtered due to search
        that.mapView.setAllMarkersVisiable(iCopy);
      } // adding a semicolon here will break things
    })(i));
  }
};

MainViewModel.prototype.updateWeather = function(i) {
  // trigger hiding the weather div and clear values
  this.view.weatherUpdating = true;
  this.view.weatherDescription('');
  this.view.weatherCurrentTemp('');

  // request new weather and then update view
  this.stationModel.getWeather(i, (function(data) {
    this.view.weatherLocationName(data.locationName);
    this.view.weatherCurrentTemp(Math.round(data.temp));
    this.view.weatherDescription(data.description);
    this.weatherUpdating = false;
  }).bind(this));
};

MainViewModel.prototype.updateWikipeida = function(i) {
  // replace current data
  this.view.wikipediaText('updating...');

  // request new wikipedia summary and update view on callback
  this.stationModel.getWikipedia(i, (function(data) {
    this.view.wikipediaText(data);
  }).bind(this));
};

MainViewModel.prototype.setLocation = function(i) {
  this._setLocationByIdx(i);

  // any time the station changes, update any related data
  this.updateWeather(i);
  this.updateWikipeida(i);
};

MainViewModel.prototype._setLocationByIdx = function(i) {
  // only set new Station if a change is necessary
  if ((typeof this.view.stationName === 'undefined') || (this.view.idx !== i)) {
    this._updateView(i);
  }
};

MainViewModel.prototype._updateView = function(i) {
  // updates the view
  this.view.idx = this.stationModel.data[i].idx;
  this.view.lat = this.stationModel.data[i].lat;
  this.view.long = this.stationModel.data[i].long;
  this.view.crsCode(this.stationModel.data[i].crsCode);
  this.view.stationName(this.stationModel.data[i].stationName);
};

MainViewModel.prototype._initalizeSearch = function() {

  var d = this.stationModel.data;
  for (var i = 0, len = d.length; i < len; i++) {
    this.view.queryList.push(d[i].stationName + ' [' + d[i].crsCode + ']');
  }

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
    this._initalizeSearch();

    // bind the view to this viewmodel
    ko.applyBindings(this.view);
  }).bind(this));
};
