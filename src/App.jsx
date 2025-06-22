import { useState, useEffect } from "react";

export default function App() {

  function getDay(offset) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + offset); // Go to next day
  return tomorrow.toLocaleDateString('en-IN', { weekday: 'long' });
 }


  function getTime() {
    const now = new Date();
    return now.toLocaleTimeString();
  }

  const [time, setTime] = useState(getTime());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(getTime());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const place = {
    city: "Vijayawada",
    state: "AP",
    country: "IN",
  };

  const [weather, setWeather] = useState({
    climate: "",
    wind: "",
    sunrise: "",
    sunset: "",
    humidity: "",
    difference: "",
    rain: "",
    weathercode: "",
    feelslike:"",
  });
  const [forecast, setForecast] = useState([]);


  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=16.5062&longitude=80.6480&current_weather=true&daily=sunrise,sunset&hourly=apparent_temperature,precipitation_probability,relativehumidity_2m&timezone=auto")
      .then(res => res.json())
      .then(data => {
        if (data.current_weather) {
          const sunriseTime = new Date(data.daily.sunrise[0]).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          const sunsetTime = new Date(data.daily.sunset[0]).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });

          const sunrisedateTime = new Date(data.daily.sunrise[0]);
          const sunsetdateTime = new Date(data.daily.sunset[0]);
          const diffMs = sunsetdateTime - sunrisedateTime;
          const totalMinutes = Math.floor(diffMs / (1000 * 60));
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          const daylightDuration = `${hours} h ${minutes} m`;

          const present = data.current_weather.weathercode;
          let issunny = false;
          let iscloudy = false;
          let israiny = false;

          if (present === 0) {
            issunny = true;
          } else if (present > 0 && present < 4) {
            iscloudy = true;
          } else {
            israiny = true;
          }

          setWeather({
            climate: data.current_weather.temperature,
            wind: data.current_weather.windspeed,
            sunrise: sunriseTime,
            sunset: sunsetTime,
            humidity: data.hourly.relativehumidity_2m[0],
            difference: daylightDuration,
            rain: data.hourly.precipitation_probability[0],
            weathercode: issunny ? "☀️" : (iscloudy ? "⛅" : (israiny ? "🌧️" : "")),
            feelslike:data.hourly.apparent_temperature[0],
          });
        }
      })
      .catch(error => console.error("Weather API error:", error));
  }, []);


  return (
    <>
<div class="body-wrapper min-h-screen flex justify-center items-center p-4">

    <div class="weather-widget-container relative w-full max-w-sm sm:max-w-md">
        <div class="weather-widget relative text-white bg-gradient-to-br from-purple-700/70 via-indigo-800/60 to-blue-900/70 backdrop-blur-lg shadow-2xl rounded-3xl p-6 overflow-hidden border border-white/10">
            <div id="cloud-container" class="absolute top-0 right-0 w-36 h-36 sm:w-40 sm:h-40 z-30 cursor-pointer rounded-tr-3xl overflow-hidden">
                <div id="cloud-tooltip" class="tooltip absolute top-20 right-2 sm:top-24 sm:right-4 bg-black/70 text-white px-3 py-1.5 rounded-md text-xs opacity-0 transition-opacity duration-300 pointer-events-none z-40 shadow-lg">
                    Click clouds for a surprise!
                    <div class="absolute -top-1 right-3 w-3 h-3 bg-black/70 transform rotate-45"></div>
                </div>
            </div>

            <div class="relative z-20">
                <div class="date-time text-sm font-light opacity-80 mb-2.5 tracking-wide animate-fadeInUp" id="dateTime">{getDay(0)}, {time}</div>

                <div class="current-weather flex items-center mb-2">
                    <div class="weather-icon-main text-5xl mr-3">{weather.weathercode}</div>
                    <div class="temp text-5xl font-semibold">
                        <span class="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 animate-fadeInScaleUp delay-100" id="temperature">{weather.climate}°C</span>
                    </div>
                </div>

                <div class="location text-lg opacity-90 mb-4 tracking-wide animate-fadeInUp delay-200" id="location">{place.city}, {place.state}, {place.country}</div>

                <div class="sun-info bg-black/30 backdrop-blur-sm rounded-2xl p-3 sm:p-4 flex justify-between items-center mb-4 border border-white/10 shadow-md animate-fadeInUp delay-300">
                    <div class="sunrise text-center">
                        <div class="sun-icon text-xl mb-1">☀️</div>
                        <div class="text-xs opacity-80" id="sunriseTime">{weather.sunrise}</div>
                    </div>
                    <div class="day-length text-center text-sm opacity-90" id="dayLength">{weather.difference}</div>
                    <div class="sunset text-center">
                        <div class="sun-icon text-xl mb-1">🌙</div>
                        <div class="text-xs opacity-80" id="sunsetTime">{weather.sunset}</div>
                    </div>
                </div>

                <div class="precipitation bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center mb-4 border border-white/5 shadow-sm animate-fadeInUp delay-400">
                    <div class="precip-icon text-2xl mr-2 text-blue-300 drop-shadow-lg animate-gentleBob">🌧️</div>
                    <div class="text-sm opacity-90" id="precipitationChance">Rain {weather.rain}%</div>
                </div>

                <div class="humidity-wind flex justify-between text-sm opacity-90 mb-5 animate-fadeInUp delay-500">
                    <div id="humidity">Humidity: {weather.humidity}%</div>
                    <div id="windSpeed">Wind: {weather.wind} km/h</div>
                </div>

                <div class="forecast flex flex-nowrap justify-between pb-2">
                    <div class="forecast-day bg-white/5 backdrop-blur-sm rounded-xl p-3 w-20 text-center border border-white/10 shadow-sm hover:bg-white/10 transition-all duration-200 cursor-pointer transform hover:-translate-y-1 animate-fadeInUp delay-100">
                        <div class="day-name text-xs font-medium mb-1 opacity-80">Today</div>
                        <div class="forecast-icon text-2xl my-1 drop-shadow-md">{weather.weathercode}</div>
                        <div class="high-temp text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">{weather.climate}°</div>
                        <div class="low-temp text-xs opacity-70">{weather.feelslike}°</div>
                    </div>
                    <div class="forecast-day bg-white/5 backdrop-blur-sm rounded-xl p-3 w-20 text-center border border-white/10 shadow-sm hover:bg-white/10 transition-all duration-200 cursor-pointer transform hover:-translate-y-1 animate-fadeInUp delay-100">
                        <div class="day-name text-xs font-medium mb-1 opacity-80">{getDay(1)}</div>
                        <div class="forecast-icon text-2xl my-1 drop-shadow-md">🌧️</div>
                        <div class="high-temp text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">23.7°</div>
                        <div class="low-temp text-xs opacity-70">21.6°</div>
                    </div>
                    <div class="forecast-day bg-white/5 backdrop-blur-sm rounded-xl p-3 w-20 text-center border border-white/10 shadow-sm hover:bg-white/10 transition-all duration-200 cursor-pointer transform hover:-translate-y-1 animate-fadeInUp delay-100">
                        <div class="day-name text-xs font-medium mb-1 opacity-80">{getDay(2)}</div>
                        <div class="forecast-icon text-2xl my-1 drop-shadow-md">☀️</div>
                        <div class="high-temp text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">39.4°</div>
                        <div class="low-temp text-xs opacity-70">38.2°</div>
                    </div>
                    <div class="forecast-day bg-white/5 backdrop-blur-sm rounded-xl p-3 w-20 text-center border border-white/10 shadow-sm hover:bg-white/10 transition-all duration-200 cursor-pointer transform hover:-translate-y-1 animate-fadeInUp delay-100">
                        <div class="day-name text-xs font-medium mb-1 opacity-80">{getDay(3)}</div>
                        <div class="forecast-icon text-2xl my-1 drop-shadow-md">🌧️</div>
                        <div class="high-temp text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">27.1°</div>
                        <div class="low-temp text-xs opacity-70">25.9°</div>
                    </div>
                    
                </div>
            </div>
        </div>
    </div>
</div>
    </>
  )
}
