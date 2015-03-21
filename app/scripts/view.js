// :=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:
// Map Object will init and display the map.
// param constructor: array of objects to map
// :=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:

function MapView() {
  // boolean to notify if any map markers have been hidden/filered
  this.someMarkersHidden = false;

  // array of all the markers we are adding to the map
  this.markers = [];

  // initialize the map and add markers
  var mapOptions = {
    zoom: 6,
    center: APP.defaultMapCenter,

    // custom control layout so that layout can be the same for all window sizes
    disableDefaultUI: true,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL,
      position: google.maps.ControlPosition.RIGHT_TOP
    }
  };

  this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

MapView.prototype.setMapMarkers = function(data) {
  for (var i = 0; i < data.length; i++) {
    var myLatlng = new google.maps.LatLng(data[i].lat, data[i].long);

    var marker = new google.maps.Marker({
      position: myLatlng,
      title: data[i].stationName + ' [' + data[i].crsCode + ']',
      // save the index and name so we can more easily manipulate this marker later
      idx: data[i].idx,
      stationName: data[i].stationName
    });

    marker.setMap(this.map);

    // push all the markers on to an array so we can access them later
    this.markers.push(marker);
  }
};

MapView.prototype.displayMap = function() {
  google.maps.event.addDomListener(window, 'load', null);
};

MapView.prototype.panAndZoomMap = function(i) {
  // don't zoon if user has zoomed in greater then 10 already
  if (this.map.getZoom() < 10) {
    this.map.setZoom(10);
  }
  this.map.panTo(this.markers[i].getPosition());
};

MapView.prototype.displayInfoWindow = function(i) {
  // if an info window already exists, close it
  if (this.infoWindow) {
    this.infoWindow.close();
  }

  // add lat & long to StreetView URL
  var imgURL = APP.GoogleStreetViewURL.replace('%lat%',
    this.markers[i].getPosition().lat());

  imgURL = imgURL.replace('%long%', this.markers[i].getPosition().lng());

  // add station name
  var infoWindowContent = APP.InfoWindowContent.replace('%title%',
    this.markers[i].stationName);

  // add imgURL to the infoWindow content
  infoWindowContent = infoWindowContent.replace('%imgURL%', imgURL);

  this.infoWindow = new google.maps.InfoWindow({
    content: infoWindowContent
  });

  this.infoWindow.open(this.map, this.markers[i]);
};

MapView.prototype.setAllMarkersVisiable = function(i) {
  // only loop through markers and set visible if we have hidden markers before
  if (this.someMarkersHidden) {
    for (var i = 0, len = this.markers.length; i < len; i++) {
      this.markers[i].setVisible(true);
      this.someMarkersHidden = false;
    }
  }
};

function NotificationView() {
  this.fatalError = function(msg) {
    var text = (msg || APP.defaultFatalMessage);

    var n = noty({
      text: text,
      type: 'error',
      closeWith: ['click'],
      animation: {
        open: 'animated slideInDown', // Animate.css class names
        close: 'animated slideOutUp', // Animate.css class names
        easing: 'swing', // unavailable - no need
        speed: 500 // unavailable - no need
      },
      // after notification is closed try to reload the page and flush cache
      callback: {
        afterClose: function() {
          location.reload(true);
        }
      }
    });
  };
}
