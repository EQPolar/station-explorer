/* globals APP, google, $, MapView, noty, console */

'use strict';


// :=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:
// MapView Object will init and display the map.
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
      style: google.maps.ZoomControlStyle.LARGE,
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    }
  };

  this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

MapView.prototype.setMapBounds = function(lats, lngs) {
  var swBound, // SouthWest lat/lng bound
    neBound, // NorthEast lat/lng bound
    bounds,
    extendPoint1,
    extendPoint2;

  bounds = new google.maps.LatLngBounds();

  // SouthWest map bound is the MIN lattitude and long found in the search
  swBound = new google.maps.LatLng(Math.min.apply(Math, lats),
    Math.min.apply(Math, lngs));

  // NorthEast map bound is the MAX lattitude and long found in the search
  neBound = new google.maps.LatLng(Math.max.apply(Math, lats),
    Math.max.apply(Math, lngs));

  // create a lat/lng bound object
  bounds = new google.maps.LatLngBounds(swBound, neBound);

  /* if there is only one marker in the bounds, the zoom level will be too zoomed
   * in. Extend the view so that we don't zoom in to far. Of course, now I see that
   * .extend() could have been used to make finding the bounds above easier.
   * http://stackoverflow.com/questions/3334729/google-maps-v3-fitbounds-zoom-too-close-for-single-marker/5345708#5345708
  */
  if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
    extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.01,
      bounds.getNorthEast().lng() + 0.01);
    extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.01,
      bounds.getNorthEast().lng() - 0.01);
    bounds.extend(extendPoint1);
    bounds.extend(extendPoint2);
  }

  this.map.fitBounds(bounds);
};

MapView.prototype.hideAllMapMarkers = function() {
  this.someMarkersHidden = true;

  for (var i = 0, len = this.markers.length; i < len; i++) {
    this.markers[i].setVisible(false);
  }
};

MapView.prototype.setMarkerVisiable = function(i) {
  if ($.isNumeric(i)) {
    this.markers[i].setVisible(true);
  } else {
    // TODO: figure out best way to serch
    console.log(i);
  }
};

MapView.prototype.animateMarker = function(i) {
  var that = this;

  this.markers[i].setAnimation(google.maps.Animation.BOUNCE);

  setTimeout(function() {
    that.markers[i].setAnimation(null);
  }, APP.markerAnimateTimeout);
};

MapView.prototype.setMapMarkers = function(data) {
  for (var i = 0; i < data.length; i++) {
    var myLatlng = new google.maps.LatLng(data[i].lat, data[i].long);

    var marker = new google.maps.Marker({
      position: myLatlng,
      title: data[i].stationName + ' [' + data[i].crsCode + ']',
      // save the index and name so we can more easily manipulate each marker later
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
  // don't zoom if user has zoomed in greater then 10 already
  if (this.map.getZoom() < 10) {
    this.map.setZoom(10);
  }
  this.map.panTo(this.markers[i].getPosition());
};

MapView.prototype.displayInfoWindow = function(i) {
  // if an InfoWindow exists, use it, otherwise create an instance
  if (!this.infoWindow) {
    this.infoWindow = new google.maps.InfoWindow();
  }

  this.infoWindow.setContent(this.getInfoWindowContent(i));

  this.infoWindow.setPosition(this.markers[i].getPosition());

  this.infoWindow.open(this.map, this.markers[i]);
};

MapView.prototype.getInfoWindowContent = function(i) {
  var imgURL = APP.GoogleStreetViewURL.replace('%lat%',
    this.markers[i].getPosition().lat());

  imgURL = imgURL.replace('%long%', this.markers[i].getPosition().lng());

  // add station name
  var infoWindowContent = APP.InfoWindowContent.replace('%title%',
    this.markers[i].stationName);

  // add imgURL to the infoWindow content
  infoWindowContent = infoWindowContent.replace('%imgURL%', imgURL);

  return infoWindowContent;
};

MapView.prototype.setAllMarkersVisiable = function() {
  // only loop through markers and set visible if we have hidden markers before
  if (this.someMarkersHidden) {
    for (var i = 0, len = this.markers.length; i < len; i++) {
      this.markers[i].setVisible(true);
      this.someMarkersHidden = false;
    }
  }
};

// :=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:
// NotificationView Object will display error and warning messages using the
// noty library.
// :=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:

function NotificationView() {
  // no value to set in constructor
}

NotificationView.prototype.fatalError = function(msg) {
  var text = (msg || APP.defaultFatalMessage);

  noty({
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

NotificationView.prototype.warningError = function(msg) {
  var text = (msg || APP.defaultWarningMessage);

  // creating a noty object will dislay notification
  noty({
    layout: 'topRight',
    text: text,
    type: 'warning',
    closeWith: ['click'],
    timeout: 10000,
    animation: {
      open: 'animated bounceInRight', // Animate.css class names
      close: 'animated fadeOut', // Animate.css class names
      easing: 'swing', // unavailable - no need
      speed: 500 // unavailable - no need
    }
  });
};
