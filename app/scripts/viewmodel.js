// Map object, container for all map view functions
// center should be a lat/lng object literal
'use strict';

function Map(stationData) {
  // s will be shorthand for an array of stationData objects to create map
  // markers for
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

    // TODO: this will need to be moved out of the map object and to the viewmodel
    google.maps.event.addListener(marker, 'click', (function(iCopy) {
      return function() {
        // TODO: this will fix this coupling here
        Stations.setLocation(iCopy);
      }
    })(i));
  }

  // display the map
  google.maps.event.addDomListener(window, 'load', Map.initialize);
}

function MainViewModel() {
  // to hold an object with station data formatted for autocomplete seach
  this.queryList = [];
  var self = this;
}

MainViewModel.prototype = {
  constructor: MainViewModel,

  _initializeSearch: function() {
    for (var i = 0, len = Stations.data.length; i < len; i++) {
      Stations.currentStation.queryList.push({
        label: Stations.data[i].stationName + ' [' + Stations.data[i].crsCode + ']',
        value: Stations.data[i].crsCode
      });


      // this.queryList.push({
      //   label: Stations.data[i].stationName + ' [' + Stations.data[i].crsCode + ']',
      //   value: Stations.data[i].crsCode
      // });
    }

    console.log(this.queryList);
    // $("#search").autocomplete({
    //   source: this.queryList
    // });
  },

  launch: function() {
    this._initialize();
  },

  _initialize: function() {
    Stations.load((function() {

      Stations.initialize();

      // set the initial location on page load
      // TODO: remember last station using a cookie
      Stations.setLocation(APP.defaultStation);

      // create a new map object, init and display the map
      var map = new Map(Stations.data);
      // map.initialize();
      // map.display();
      // console.log(map.markers);

      // build a stationlist that is compatabile with jQueryUI autocompelte
      this._initializeSearch();

      // bind the view to the model
      ko.applyBindings(Stations.currentStation);
    }).bind(this));
  }
};

$(document).ready(function() {
  var app = new MainViewModel();
  console.dir(app);
  app.launch();
});
