const axios = require('axios');

exports.getWeather = async (req, res) => {
  try {
    const { city } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    // Call OpenWeatherMap API
    // units=metric gives Celsius instead of Kelvin
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    
    const response = await axios.get(url);
    const data = response.data;

    // Format the response exactly as required by Step 9
    res.status(200).json({
      success: true,
      city: data.name,
      temperature: data.main.temp,
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed
    });

  } catch (err) {
    // Handle 404 (City not found)
    if (err.response && err.response.status === 404) {
      return res.status(404).json({
        success: false,
        message: `City '${req.params.city}' not found.`
      });
    }

    // Handle 401 (Invalid/Inactive API Key)
    if (err.response && err.response.status === 401) {
      return res.status(401).json({
        success: false,
        message: "Weather API key is invalid or not yet active."
      });
    }

    // Handle generic network failures
    res.status(500).json({
      success: false,
      message: "Could not connect to weather service."
    });
  }
};