const apiKey = "49d4227247ccd48a6adcc1b596b8361c";
const citySearchButton = document.querySelector("#userCityButton");
const cityNameEl = document.querySelector("#userCityInput");
const cityHistoryColumnEl = document.querySelector("#cityHistory");
const currentCityWeatherEl = document.getElementById("currentCityweather");
const fiveDayEl = document.querySelector("#fiveDay");
let today = new Date().toLocaleDateString();
let currentCityLat;
let currentCityLon;
let citySearchHistory = JSON.parse(localStorage.getItem("cityHistory")) || [];
////////////////////////////////////global variables above///////////////////////////////////////////////

//////////     first API call     //////////
const getCurrentWeatherHandler = function (event) {
  currentCityWeatherEl.innerHTML = "";
  const cityName = cityNameEl.value.trim();
  //clear old content from input on screen
  cityNameEl.value = "";
  APIBuilder(cityName);
};

const APIBuilder = function(cityName){
  currentCityWeatherEl.innerHTML = "";
  const currentWeatherApiUrl =
    "http://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +"&appid=" + apiKey;
  
  fetch(currentWeatherApiUrl).then(function (response) {
    if (response.ok) {
      citySearchHandler(cityName);
      console.log(response);
      response.json().then(function (data) {
        const currentCityName = document.createElement("h2"); //creating tag for current city
        const currentCityTemp = document.createElement("p");
        const currentCityHumidity = document.createElement("p");
        const currentCityWind = document.createElement("p");

        currentCityName.textContent = `${data.name}, ${today}`; //grab the name from the data
        currentCityTemp.textContent = `Temp: ${data.main.temp} °F`;
        currentCityHumidity.textContent = `Humidity: ${data.main.humidity} %`;
        currentCityWind.textContent = `Wind: ${data.wind.speed} MPH`;

        currentCityWeatherEl.append(
          currentCityName,
          currentCityTemp,
          currentCityHumidity,
          currentCityWind
        );

        currentCityLat = data.coord.lat;
        currentCityLon = data.coord.lon;
        oneCallWeatherHandler();
      });
    }
  });
};


/////  second API call  /////
const oneCallWeatherHandler = function () {
  const oneCallApiUrl =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    currentCityLat +
    "&lon=" +
    currentCityLon +
    "&exclude=minutely,hourly&units=imperial&appid=" +
    apiKey;

  fetch(oneCallApiUrl).then(function (response) {
    console.log("one call response: " + response);
    response.json().then(function (data) {
      const currentCityUvi = document.createElement("p");

      if (data.current.uvi < 3){
        currentCityUvi.classList.add("uvLow");
      } else if (data.current.uvi > 2 && data.current.uvi < 8) {
        currentCityUvi.classList.add("uvMed");
      } else {
        currentCityUvi.classList.add("uvHigh");
      }
      currentCityUvi.textContent = `UVI: ${data.current.uvi}`;
      currentCityWeatherEl.append(currentCityUvi);
      fiveDayElHandler(data.daily);
    });
  });
};

const fiveDayElHandler = function(fiveDayData) {
  fiveDayEl.innerHTML = ""
  for (let i=1; i<6; i++){
    let newDate = new Date(fiveDayData[i].dt*1000).toLocaleDateString("en-US")
    let newDiv = document.createElement("div");
    newDiv.classList.add("col-lg")
    let newEl = `<div class="card">
        <img src="http://openweathermap.org/img/wn/${fiveDayData[i].weather[0].icon}@2x.png" class="card-img-top" alt="...">
        <div class="card-body">
          <h5 class="card-title">${newDate}</h5>
          <p class="card-text">Temp: ${fiveDayData[i].temp.day} </p>
          <p class="card-text">Wind: ${fiveDayData[i].wind_speed}</p>
          <p class="card-text">Humidity: ${fiveDayData[i].humidity}</p>
        </div>
      </div>`
newDiv.innerHTML = newEl;
fiveDayEl.append(newDiv);
  }
};

////////this captures the city name when the search button is clicked////////
var citySearchHandler = function (cityName) {
  //pushing cityName to citySearchHistory array
  if (!citySearchHistory.includes(cityName)) {
    citySearchHistory.push(cityName); //pushes to citySearchHistory array
    console.log(citySearchHistory);
    cityButtonFactory(cityName);
  }

  saveCity(citySearchHistory); //pass citySearchHistory to the saveCity function
};


/////     saving city name to local storage    /////
let saveCity = function (cityHistory) {
  //cityHistory was citySearchHistory
  localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
};

/////    load saved cities name to page(history button)    /////
let loadCity = function () {
  let loadedCityName = localStorage.getItem("cityHistory");
};

/////     create button for historical city    /////
const cityButtonFactory = function (cityName) {
  let citySearchHistoryEl = document.createElement("button");
  //add type
  citySearchHistoryEl.type = "button";
  //give it a class name
  citySearchHistoryEl.className = "btn btn-secondary btnMargin";
  //set text onto button created
  citySearchHistoryEl.innerText = cityName;
  cityHistoryColumnEl.appendChild(citySearchHistoryEl);
  citySearchHistoryEl.addEventListener("click", () => APIBuilder(cityName));
};


const loadSearchHistory = function () {
  const loadCityHistory = localStorage.getItem("cityHistory");
  const parsedCityHistory = JSON.parse(loadCityHistory);
  console.log(parsedCityHistory);
  if (parsedCityHistory){
  parsedCityHistory.forEach(cityButtonFactory);
  }
};


citySearchButton.addEventListener("click", getCurrentWeatherHandler);
window.onload = loadSearchHistory;

