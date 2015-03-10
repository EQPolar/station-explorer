// Map object, container for all map view functions
// center should be a lat/lng object literal
'use strict';

function MapController(center) {
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
  this.launch = function() {
    this.initializeResources();
  }

  // load resources
  this.initializeResources = function() {
    Stations.load(this.initializeDisplay);
    Stations.initialize(function() {

    });

  };

  this.initializeDisplay = function() {
    Stations.setLocation(APP.defaultStation);

    var map = new MapController(APP.defaultMapCenter);
    map.initialize();
    map.display();
    ko.applyBindings(Stations.currentStation);
  };
}

$( document ).ready(function() {
  var app = new MainViewModel();
  app.launch();
});
