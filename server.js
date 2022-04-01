// подгружаем модули.
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const { sendFile } = require("express/lib/response");
require("dotenv").config(); 

const app = express();

//вытаскиваем ключ api.
const apiKey = `${process.env.API_KEY}`;




//присваиваем Static & Parser & ejs.
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


// страницы по умолчанию.
app.get("/", (req, resp) => {
    resp.render("index", {weather: null, err: null});
})


app.post("/", (req, resp) => {

    //получение города с формы.
    let city = req.body.city;

    // создание ссылки для вызова.
    let url = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&cnt=8&appid=${apiKey}&units=metric`; //на 5 дней.
    
    
    //делаем вызов api, при ошибке, возвращаем текст.
    request(url, (err, response, body) => {
        if (err) {
            resp.render('index', { weather: null, err: 'Oops, an error occurred, check the title!' });
        } else {

            let weather = JSON.parse(body);

            // console.log(weather.list[0]);

            if(weather.list == undefined) {
                resp.render('index', { weather: null, err: 'Oops, an error occurred, check the title!' });
            } else {
                
                // ============== переменные ==================
                let weatherTimezone = []; //время прогназируемое
                let cityName = []; // имя + код.
                let weatherTemp = []; // температура
                let weatherFeels = []; // ощущается температура
                let weatherHumidity = []; // влажность
                let weatherSpeed = [] ; // Скорость ветра
                let weatherDescription = []; // Описание погоды
                let weatherIcon = []; // Иконка погоды
                let weatherPrecipitation = []; // Осадки %
                // ==============================================

                cityName = `${weather.city.name}, ${weather.city.country}`;

                for (const item of weather.list) {
                    weatherTimezone.push(`${item.dt_txt}`);
                    weatherTemp.push(`${Math.round(item.main.temp)}`);
                    weatherFeels.push(`${Math.round(item.main.feels_like)}`);
                    weatherHumidity.push(`${item.main.humidity}`);
                    weatherSpeed.push(`${item.wind.speed}`);
                    weatherDescription.push(`${item.weather[0].description}`);
                    weatherIcon.push(`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png `);
                    weatherPrecipitation.push(`${item.pop}`);
                }
                // console.log(weatherDescription);
                // рендер переменных на странице.
                resp.render("index", {
                    weather: weather,
                    place: cityName,
                    temp: weatherTemp,
                    icon: weatherIcon,
                    humidity: weatherHumidity,
                    timezone: weatherTimezone,
                    feels: weatherFeels,
                    speed: weatherSpeed,
                    description: weatherDescription,
                    precipitation: weatherPrecipitation,
                    err: null,
                  });
            }
        }
        
    })
})

app.listen(3000, function () {
    console.log("Weather app listening on port 3000!");
  });