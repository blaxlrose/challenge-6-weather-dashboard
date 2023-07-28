const myApiKey = "49d4227247ccd48a6adcc1b596b8361c";
const searchBtn = document.querySelector("#userCityButton");
const cityNameInput = document.querySelector("#userCityInput");
const cityHistoryColumn = document.querySelector("#cityHistory");
const currentWeatherDiv = document.getElementById("currentCityweather");
const fiveDayDiv = document.querySelector("#fiveDay");
let currentDate = new Date().toLocaleDateString();
let currCityLatitude;
let currCityLongitude;
let cityHistory = JSON.parse(localStorage.getItem("cityHistory")) || [];


const getCurrentWeather = function (event) {
  currentWeatherDiv.innerHTML = "";
  const cityName = cityNameInput.value.trim();
  cityNameInput.value = "";
  buildAPI(cityName);
};

const buildAPI = function(cityName){
  currentWeatherDiv.innerHTML = "";
  const currentWeatherUrl =
    "http://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&units=imperial" +
    "&appid=" +
    myApiKey;
  
  fetch(currentWeatherUrl).then(function (response) {
    if (response.ok) {
      handleCitySearch(cityName);
      response.json().then(function (data) {
        const cityNameElement = document.createElement("h2");
        const cityTempElement = document.createElement("p");
        const cityHumidityElement = document.createElement("p");
        const cityWindElement = document.createElement("p");

        cityNameElement.textContent = `${data.name}, ${currentDate}`;
        cityTempElement.textContent = `Temp: ${data.main.temp} °F`;
        cityHumidityElement.textContent = `Humidity: ${data.main.humidity} %`;
        cityWindElement.textContent = `Wind: ${data.wind.speed} MPH`;

        currentWeatherDiv.append(
          cityNameElement,
          cityTempElement,
          cityHumidityElement,
          cityWindElement
        );

        currCityLatitude = data.coord.lat;
        currCityLongitude = data.coord.lon;
        handleOneCallWeather();
      });
    }
  });
};


const handleOneCallWeather = function () {
  const oneCallApiUrl =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    currCityLatitude +
    "&lon=" +
    currCityLongitude +
    "&exclude=minutely,hourly&units=imperial&appid=" +
    myApiKey;

  fetch(oneCallApiUrl).then(function (response) {
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
      currentWeatherDiv.append(currentCityUvi);
      handleFiveDayForecast(data.daily);
    });
  });
};

const handleFiveDayForecast = function(fiveDayData) {
  fiveDayDiv.innerHTML = ""
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
    fiveDayDiv.append(newDiv);
  }
};

var handleCitySearch = function (cityName) {
  if (!cityHistory.includes(cityName)) {
    cityHistory.push(cityName);
    createCityButton(cityName);
  }

  saveCityToLocalStorage(cityHistory);
};

let saveCityToLocalStorage = function (cityHistory) {
  localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
};

let loadCityFromLocalStorage = function () {
  let loadedCityName = localStorage.getItem("cityHistory");
};

const createCityButton = function (cityName) {
  let cityHistoryBtn = document.createElement("button");
  cityHistoryBtn.type = "button";
  cityHistoryBtn.className = "btn btn-secondary btnMargin";
  cityHistoryBtn.innerText = cityName;
  cityHistoryColumn.appendChild(cityHistoryBtn);
  cityHistoryBtn.addEventListener("click", () => buildAPI(cityName));
};

const loadSearchHistoryFromLocalStorage = function () {
  const loadCityHistory = localStorage.getItem("cityHistory");
  const parsedCityHistory = JSON.parse(loadCityHistory);
  if (parsedCityHistory){
    parsedCityHistory.forEach(createCityButton);
  }
};

searchBtn.addEventListener("click", getCurrentWeather);
window.onload = loadSearchHistoryFromLocalStorage;
