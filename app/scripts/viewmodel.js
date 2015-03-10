// Map object, container for all map view functions
// center should be a lat/lng object literal
'use strict';

function Map(center) {
  this.center = center;

  // init map function
  this.initialize = function() {
    // call Stations.load, when Stations.load is complete it will callback
    // the rest of the initialize function

    var s = Stations.data;

    var mapOptions = {

      zoom: 6,
      center: APP.defaultMapCenter

    };
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    for (var i = 0; i < s.length; i++) {
      var myLatlng = new google.maps.LatLng(s[i].lat, s[i].long);

      var marker = new google.maps.Marker({
        position: myLatlng,
        title: s[i].stationName + ' [' + s[i].crsCode + ']'
      });
      marker.setMap(map);
      google.maps.event.addListener(marker, 'click', (function(iCopy) {
        return function() {
          Stations.setLocation(iCopy);
        }
      })(i));
    }

  };

  this.display = function() {
    google.maps.event.addDomListener(window, 'load', Map.initialize);
  };
}

function MainViewModel() {
  // to hold an object with station data formatted for autocomplete seach
  this.queryList = [];
  var self = this;
}

MainViewModel.prototype = {
  constructor: MainViewModel,

  _initializeSearch : (function() {
    console.log('TODO: build search map and then bind autocomplete.');
  }),

  launch : function () {
    this._initialize();
  },

  _initialize : function () {
    Stations.load((function () {

      Stations.initialize();

      // set the initial location on page load
      // TODO: remember last station using a cookie
      Stations.setLocation(APP.defaultStation);

      // create a new map object, init and display the map
      var map = new Map(APP.defaultMapCenter);
      map.initialize();
      map.display();

      // build a stationlist that is compatabile with jQueryUI autocompelte
      this._initializeSearch();

      // bind the view to the model
      ko.applyBindings(Stations.currentStation);
    }).bind(this));
  }
};

$( document ).ready(function() {
  var app = new MainViewModel();
  console.dir(app);
  app.launch();
});
