const axios = require('axios');
const Trip = require('../models/Trip'); 

exports.getCombinedPlanner = async (req, res) => {
    try {
        const { tripId } = req.params;

        // 1. Get Trip details from MongoDB
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found" });
        }

        const city = trip.destination;
        const weatherKey = process.env.OPENWEATHER_API_KEY;
        const tomtomKey = process.env.TOMTOM_API_KEY;

        // 2. Prepare API calls
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${weatherKey}`;
        const attractionsUrl = `https://api.tomtom.com/search/2/search/${encodeURIComponent(city)}.json?key=${tomtomKey}&limit=20&idxSet=POI`;

        // 3. Execute both API calls simultaneously
        const [weatherRes, attractionsRes] = await Promise.all([
            axios.get(weatherUrl),
            axios.get(attractionsUrl)
        ]);

        // 4. Extract data
        const weatherData = {
            // temperature: Math.round(weatherRes.data.main.temp),
            temperature: weatherRes.data.main.temp,
            condition: weatherRes.data.weather[0].main,
            humidity: weatherRes.data.main.humidity,
            windSpeed: weatherRes.data.wind.speed
        };

        const attractionsData = attractionsRes.data.results.map(item => ({
            name: item.poi.name,
            category: item.poi.classifications[0]?.code || 'Landmark',
            address: item.address.freeformAddress
        }));

        // 5. Generate Dynamic Recommendation
        // let recommendation = "Enjoy your trip!";
        // if (weatherData.condition === "Rain") {
        //     recommendation = "It looks like rain; consider indoor museums or shopping centers.";
        // } else if (weatherData.temperature > 30) {
        //     recommendation = "It's quite hot! Stay hydrated and visit attractions early in the morning.";
        // } else if (weatherData.condition === "Clouds") {
        //     recommendation = "Cloudy weather is great for walking tours and outdoor photography.";
        // }

        // 1. Start with a default sentiment
        let adviceParts = ["Enjoy your trip!"];

        // 2. Weather Condition Logic (Specific scenarios)
        const condition = weatherData.condition.toLowerCase();

        if (condition.includes("rain") || condition.includes("drizzle")) {
            adviceParts.push("It looks like rain; consider indoor spots like museums or shopping centers.");
        } else if (condition.includes("cloud")) {
            adviceParts.push("Cloudy weather is actually the best lighting for travel photography.");
        } else if (condition.includes("clear")) {
            adviceParts.push("The sky is clear—perfect for outdoor sightseeing and panoramic views.");
        }

        // 3. Temperature Logic (Safety & Comfort)
        if (weatherData.temperature > 32) {
            adviceParts.push("Warning: Extreme heat! Stay hydrated and avoid heavy walking during midday.");
        } else if (weatherData.temperature < 10) {
            adviceParts.push("It's quite chilly; make sure to bundle up in layers.");
        }

        // 4. Activity Specific Advice
        if (weatherData.humidity > 80 && weatherData.temperature > 25) {
            adviceParts.push("It's quite humid, so take it easy and find some shade.");
        }

        // 5. Join them into one natural sentence
        const recommendation = adviceParts.join(" ");

        // 6. Send Combined Response
        res.status(200).json({
            success: true,
            city: city,
            trip: trip,
            weather: weatherData,
            attractions: attractionsData,
            recommendation
        });

    } catch (err) {
        console.error("Planner Error:", err.message);
        res.status(500).json({ success: false, message: "Error building your travel plan." });
    }
};