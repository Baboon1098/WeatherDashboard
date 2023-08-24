const apiKey = 'f5bf95abb0464b637bc44c46c459808d';
const getForecastButton = document.getElementById('getForecast');
const cityInput = document.getElementById('city');
const currentWeather = document.getElementById('current-weather');
const forecastInfo = document.getElementById('forecast-info');
const clearDataButton = document.getElementById('clearData');

function getStoredCity() {
  return localStorage.getItem('savedCity');
}

function saveCityToStorage(city) {
  localStorage.setItem('savedCity', city);
}

function clearStoredCity() {
  localStorage.removeItem('savedCity');
  document.getElementById('city').value = ''; 
  document.getElementById('current-weather').textContent = ''; 
  document.getElementById('forecast-info').innerHTML = ''; 
}

window.onload = function () {
  const savedCity = getStoredCity();
  if (savedCity) {
    document.getElementById('city').value = savedCity;
    getForecast(savedCity);
  }
};

getForecastButton.addEventListener('click', () => {
  const cityName = cityInput.value;
  if (cityName) {
    saveCityToStorage(cityName);
    getForecast(cityName);
  }
});

clearDataButton.addEventListener('click', () => {
  clearStoredCity(); 
});

function getForecast(city) {
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`;

  fetch(currentWeatherUrl)
    .then(response => response.json())
    .then(data => {
      const currentTemperature = data.main.temp;
      const currentWeatherDescription = data.weather[0].description;
      const currentWeatherIcon = data.weather[0].icon;
      const currentDate = new Date().toLocaleDateString();

      currentWeather.innerHTML = `
        <p>Current City: ${city} - ${currentDate}</p>
        <p>Current Temperature: ${currentTemperature}°F</p>
        <p>Current Weather: ${currentWeatherDescription}</p>
        <img class="weather-icon" src="http://openweathermap.org/img/w/${currentWeatherIcon}.png" alt="${currentWeatherDescription}">
      `;

      return fetch(forecastUrl);
    })
    .then(response => response.json())
    .then(data => {
      const forecasts = data.list;
      let forecastHtml = '';

      const dailyForecasts = {};

      forecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString();

        if (!dailyForecasts[day]) {
          dailyForecasts[day] = {
            temperature: forecast.main.temp,
            weatherDescription: forecast.weather[0].description,
            weatherIcon: forecast.weather[0].icon
          };
        }
      });

      forecastHtml += '<div class="forecast-box">';
      for (const day in dailyForecasts) {
        const { temperature, weatherDescription, weatherIcon } = dailyForecasts[day];

        forecastHtml += `
          <div class="forecast-item">
            <p>Date: ${day}</p>
            <p>Temperature: ${temperature}°F</p>
            <p>Description: ${weatherDescription}</p>
            <img class="weather-icon" src="http://openweathermap.org/img/w/${weatherIcon}.png" alt="${weatherDescription}">
          </div>
        `;
      }
      forecastHtml += '</div>';

      forecastInfo.innerHTML = forecastHtml;
    })
    .catch(error => {
      console.error('Error fetching forecast data:', error);
      currentWeather.innerHTML = '<p>Failed to fetch weather data. Please try again later.</p>';
      forecastInfo.innerHTML = '';
    });
}
