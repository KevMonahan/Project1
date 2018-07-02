$(document).ready(function () {
  enableButtons();
  if (!window.navigator || !window.navigator.geolocation) {
    alert('Your browser doesn\'t support geolocation!');
    return;
  }

  function geolocate() {
    navigator.geolocation.getCurrentPosition(onGeolocateSuccess, onGeolocateError);
  }

  function onGeolocateSuccess(coordinates) {
    const { latitude, longitude } = coordinates.coords;
    window.localStorage.setItem('latitude', latitude);
    window.localStorage.setItem('longitude', longitude);
    console.log(latitude, longitude)
    showMap(latitude, longitude);
  }

  function onGeolocateError(error) {
    console.log(error.code, error.message);

    if (error.code === 1) {
      console.log('User declined geolocation');
    } else if (error.code === 2) {
      console.log('Geolocation position unavailable');
    } else if (error.code === 3) {
      console.log('Timeout determining geolocation');
    }
  }

  function watchLocation() {
    const watchId = navigator.geolocation.watchPosition(onLocationChange, onGeolocateError);
    window.localStorage.setItem('lastWatch', watchId);
    console.log('Set watchId', watchId);
  }

  function onLocationChange(coordinates) {
    const { latitude, longitude } = coordinates.coords;
    console.log('Changed coordinates: ', latitude, longitude);
  }

  function clearWatch() {
    const watchId = window.localStorage.getItem('lastWatch');
    navigator.geolocation.clearWatch(watchId);
    console.log('Cleared watchId: ', watchId);
  }

  function showMap(lat, lng) {
    const $map = document.getElementById('map');
    const position = { lat, lng };
    window.map = new google.maps.Map($map, {
      center: position,
      zoom: 13
    });
    window.markers = window.markers || [];
    const marker = new google.maps.Marker({ map, position });
  }

  function hideMap() {
    const $map = document.getElementById('map');
    $map.innerHTML = '';
  }

  // const mockMuseumResponse = [
  //   {
  //     id: 1,
  //     name: "Altes Museum",
  //     lat: 52.5195,
  //     lng:13.3987
  //   },
  //   {
  //     id: 2,
  //     name: "Berlin Wall Memorial",
  //     lat: 52.4861,
  //     lng: 13.4720
  //   },
  //   {
  //     id: 3,
  //     name: "DDR Museum",
  //     lat: 52.5196,
  //     lng: 13.4027
  //   },
  //   {
  //     id: 4,
  //     name: "Gemäldegalerie",
  //     lat: 51.0534,
  //     lng: 13.7347
  //   }
  // ];

  function showNearbyBars() {
    let nearbyBarArray = [];
    if (!window.map || !window.markers) { return; }
    var latitude = window.localStorage.getItem('latitude');
    var longitude = window.localStorage.getItem('longitude');
    var queryURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&rankby=distance&type=bar&key=AIzaSyCyMOn4yIpUS7txiay_jEqvmMc0oElPBGU`;
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function (response) {
      let places = response.results;

      places.forEach(place => {
        let barObject = {};

        barObject = {
          'barName': place.name,
          'lat': place.geometry.location.lat,
          'lng': place.geometry.location.lng,
          'formatted_address': place.vicinity,
          'rating': place.rating,

        }
        nearbyBarArray.push(barObject);
      })
      nearbyBarArray.forEach(bar => {
        const { lat, lng, barName, formatted_address, rating } = bar;
        const position = { lat, lng };
        const title = barName;
        const marker = new google.maps.Marker({ map, position, title });

        google.maps.event.addListener(marker, 'click', function () {
          var contentString = '<div id="content">' + '<div id="siteNotice">' + '</div>'
            + '<h1 id="firstHeading" class="firstHeading">' + title + '</h1>' +
            '<div id="bodyContent">' + '<p>' + title + "'s nearest address is " + formatted_address + "</p>" +
            '<p>' + title + "'s rating is : " + rating + '</p>' + '</div></div>';

          var infowindow = new google.maps.InfoWindow({
            'content': contentString
          });

          infowindow.open(map, this);
})

          window.markers.push(marker);
        
      })
    })
  }




  function enableButtons () {
    const $geolocateButton = document.getElementById('geolocation-button');
    const $watchButton = document.getElementById('watch-button');
    const $clearWatchButton = document.getElementById('clear-watch-button');
    const $showNearbyButton = document.getElementById('show-nearby-button');

    $geolocateButton.disabled = false;
    $watchButton.disabled = false;
    $clearWatchButton.disabled = false;
    $showNearbyButton.disabled = false;

    console.log('Google Maps API loaded');
  }

    const $geolocateButton = document.getElementById('geolocation-button');
    const $watchButton = document.getElementById('watch-button');
    const $clearWatchButton = document.getElementById('clear-watch-button');
    const $showNearbyButton = document.getElementById('show-nearby-button');

    $geolocateButton.addEventListener('click', geolocate);
    $watchButton.addEventListener('click', watchLocation);
    $clearWatchButton.addEventListener('click', clearWatch);
    $showNearbyButton.addEventListener('click', showNearbyBars);

})
