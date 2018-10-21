// _ = helper functions
let _calculateTimeDistance = (startTime, endTime) => {
  startTime = new Date('0001-01-01 ' + startTime);
  endTime = new Date('0001-01-01 ' + endTime);
  startTime = (startTime.getHours() * 60) + startTime.getMinutes();
  endTime = (endTime.getHours() * 60) + endTime.getMinutes();
  let distance = endTime - startTime;
  // console.info(distance);
  return distance;
}

// Deze functie kan een am/pm tijd omzetten naar een 24u tijdsnotatie, deze krijg je dus al. Alsjeblieft, veel plezier ermee.
let _convertTime = (t) => {
  /* Convert 12 ( am / pm ) naar 24HR */
  let time = new Date('0001-01-01 ' + t);
  let formatted = time.getHours() + ':' + ('0' + time.getMinutes()).slice(-2);
  return formatted;
}

// 5 TODO: maak updateSun functie
let updateSun = (timePassed) => {
  let sun = document.querySelector(".js-sun");
	let bottom = 0;
	let left = 0;
  if (timePassed >= 50) {
		bottom = 100 - timePassed;
		left = timePassed;
  }
	else {
		bottom = timePassed;
		left = timePassed;
  }
  sun.style = "bottom: " + bottom + "%; left: " + left + "%;"
  if (timePassed >= 99.99){
    document.querySelector("html").classList.add("is-night");
    document.querySelector("html").classList.remove("is-day");
    sun.style.display = "none"
  }
  else{
    document.querySelector("html").classList.remove("is-night");
    document.querySelector("html").classList.add("is-day");
    sun.style.display = "block"
  }
}
// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = (totalMinutes, sunrise) => {
  // Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
  // We voegen ook de 'is-loaded' class toe aan de body-tag.
  // Vergeet niet om het resterende aantal minuten in te vullen.
	let currentDate = new Date();
	let currentTime = (currentDate.getHours() + ':' + ('0' + currentDate.getMinutes()).slice(-2));
	let timePassed = _calculateTimeDistance(sunrise, currentTime);
	let timePassedPerc = timePassed / totalMinutes * 100;
	let sunElement = document.querySelector(".js-sun");
	sunElement.setAttribute("data-time", (currentDate.getHours() + ':' + ('0' + currentDate.getMinutes()).slice(-2)));
	let timeleft = document.querySelector(".js-time-left");
	timeleft.innerHTML = totalMinutes - timePassed;
	console.log(timePassedPerc);
	updateSun(timePassedPerc);
	setInterval(function() {
		  let currentDate = new Date();
		  let currentTime = (currentDate.getHours() + ':' + ('0' + currentDate.getMinutes()).slice(-2));
		  let timePassed = _calculateTimeDistance(sunrise, currentTime);
		  let timePassedPerc = timePassed / totalMinutes * 100;
		  let sunElement = document.querySelector(".js-sun");
		  sunElement.setAttribute("data-time", (currentDate.getHours() + ':' + ('0' + currentDate.getMinutes()).slice(-2)));
			let timeleft = document.querySelector(".js-time-left");
			timeleft.innerHTML = totalMinutes - timePassed;
		  console.log(timePassedPerc);
			updateSun(timePassedPerc);
}, 5000);
}

// 3 Met de data van de API kunnen we de app opvullen
let showResult = (queryResponse) => {
  // We gaan eerst een paar onderdelen opvullen
  // Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	let data = queryResponse.query.results.channel;
  let location = document.querySelector(".js-location");
  let city = data.location.city;
  let country = data.location.country;
	location.innerHTML = city + ", " + country;
  // Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
  let sunriseHTML = document.querySelector(".js-sunrise");
  let sunrise = _convertTime(data.astronomy.sunrise);
  sunriseHTML.innerHTML = sunrise;
  let sunsetHTML = document.querySelector(".js-sunset");
  let sunset = _convertTime(data.astronomy.sunset);
  sunsetHTML.innerHTML = sunset;
	var currentDate = new Date();
  let sunElement = document.querySelector(".js-sun");
  sunElement.setAttribute("data-time", (currentDate.getHours() + ':' + ('0' + currentDate.getMinutes()).slice(-2)));
	let timeleft = document.querySelector(".js-time-left");
  let timeDistance = _calculateTimeDistance(sunrise, sunset);
	timeleft.innerHTML = timeDistance - _calculateTimeDistance(sunrise, (currentDate.getHours() + ':' + ('0' + currentDate.getMinutes()).slice(-2)));
  placeSunAndStartMoving(timeDistance, sunrise);
	};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = (lat, lon) => {
  // Eerst bouwen we onze url op
  // en doen we een query met de Yahoo query language

  // Met de fetch API proberen we de data op te halen.
  // Als dat gelukt is, gaan we naar onze showResult functie.
  fetch('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(SELECT%20woeid%20FROM%20geo.places%20WHERE%20text%3D%22(' + lat + '%2C' + lon + ')%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys')
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }

        // Examine the text in the response
        response.json().then(function(data) {
          console.log(data);
          showResult(data);
        });

      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    })
};

document.addEventListener('DOMContentLoaded', function() {
  // 1 We will query the API with longitude and latitude.
  getAPI(50.825888, 3.2507454);
});
