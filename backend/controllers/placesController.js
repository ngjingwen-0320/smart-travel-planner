const axios = require('axios');

exports.getPlaces = async (req, res) => {
    try {
        const { city } = req.params;
        const apiKey = process.env.TOMTOM_API_KEY;

        const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(city)}.json?key=${apiKey}&limit=20&idxSet=POI`;

        const response = await axios.get(url);

        // Map the results (TomTom's POI structure)
        const formattedPlaces = response.data.results.map(item => ({
            name: item.poi?.name || "Unknown Landmark",
            category: item.poi?.classifications?.[0]?.code || 'POI',
            address: item.address?.freeformAddress || 'Address not available'
        }));

        res.status(200).json({
            success: true,
            city: city,
            places: formattedPlaces
        });

    } catch (err) {
        console.error("TomTom Final Debug:", err.response?.data || err.message);
        
        res.status(err.response?.status || 500).json({
            success: false,
            message: "TomTom service error - verify your API key and path."
        });
    }
};