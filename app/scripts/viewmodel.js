// Get cookie from last session if exists.  If does exist set map center to last
// location and set current station to station from cookie

// Load Map

// Place Markers on the map


// Bind Click events to all markers

// Watch station name, if station name changes, update all the info in the sidebar

/* jshint devel:true */

// Map object, container for all map view functions
// center should be a lat/lng object literal

function Map(center) = {
  this.center = center;

  // init map function
  this.initialize = function() {
    Stations.load(function() {
      var s = Stations.data;

      var mapOptions = {
        zoom: 4,
        center: APP.defaultMapCenter
      };
      map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

      for (var i = 0; i < s.length; i++) {
        var myLatlng = new google.maps.LatLng(s[i].lat, s[i].long);

        var marker = new google.maps.Marker({
          position: myLatlng,
          title: "Hello World!"
        });
        marker.setMap(map);

      }
    });
  };

  this.display = function() {
    google.maps.event.addDomListener(window, 'load', Map.initialize);
  };
};

var map = new Map(APP.defaultMapCenter);
map.initialize();
map.display();
