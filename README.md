# Station Explorer

The project will create a mashup of various APIs to create allow the user to explorer information about UK train stations.

To view a production version of this project go to: http://se.builtprecise.io

To run the development version of this project, you will need to clone it to your machine
and then downloaded the project dependancies using bower.  Then you can use gulp to serve the project locally.

The main interface will consist of a map with place markers for various UK train stations.  The user will be able to click on the map indicator to bring up a window that shows the following:
* Station name
* Current weather
* Wikipedia blurb
* Image

### APIs Used
* Google Maps
* OpenWeather API
* Wikipedia API
* Google Image API

### Tools Used
* [yeoman](http://yeoman.io/) - web scaffolding tool
* [bower](http://bower.io/) - dependancy management tool
* [gulp](http://gulpjs.com/) - build tool
* [jQuery](http://jquery.com/) - needs no introduction
* [knockoutJS](http://knockoutjs.com/) - a MVC library with two way data binding
* [noty](http://ned.im/noty/) - a jquery plugin that makes is easy to create notifications

### Future Improvements:
While this project meets the spec, of course there are always things that could be done better, such as:
* redesign the interface to make it more stylish
* use a library to cluster the map markers
* offer a tour on first view
* offer the option to change between C and F
* move the wikipedia summary and weather info to the infowindow.  The reason it isn't there now is that it turns out that having dynamic content in the infowindow using knockout is quite difficult.  
* live departure/arrival info for stations.  This API requries approval from network rail to access
