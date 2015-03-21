// :=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:
// Map Object will init and display the map.
// param constructor: array of objects to map
// :=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:=:

function MapView() {
  // s will be shorthand for an array of stationData objects
  // var s = stationData;

  // array of all the markers we are adding to the map
  // var markers = [];

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

  // var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  // console.log(map);
  //
  // for (var i = 0; i < s.length; i++) {
  //   var myLatlng = new google.maps.LatLng(s[i].lat, s[i].long);
  //
  //   var marker = new google.maps.Marker({
  //     position: myLatlng,
  //     title: s[i].stationName + ' [' + s[i].crsCode + ']'
  //   });
  //   marker.setMap(map);
  //
  //   // push all the markers on to an array so we can access them later
  //   markers.push(marker);
  //
  //
  // }
  //
  // // display the map
  // google.maps.event.addDomListener(window, 'load', Map.initialize);
  //
  // return {
  //   map: map,
  //   markers: markers
  // }
}

// // place holder if methods need to be added in the future
// Map.prototype = {
//   constructor: Map
// }
