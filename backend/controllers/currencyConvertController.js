const axios = require('axios');

exports.getCurrency = async (req, res) => {

    try {

        const { base, to, amount } = req.query;

        // Validate Input
        if (!base || !to || !amount) {
            return res.status(400).json({
                success: false,
                message: "Missing parameters"
            });
        }

        // Validate Amount is Number
         if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be a valid positive number"
            });
        }

        const apiKey = process.env.ANYAPI_KEY;

        const url = `https://anyapi.io/api/v1/exchange/convert?base=${base}&to=${to}&amount=${amount}&apiKey=${apiKey}`;

        const response = await axios.get(url);
        const data = response.data;

        res.status(200).json({
            success: true,
            base: data.base,
            to: data.to,
            amount: data.amount,
            converted: data.converted,
            rate: data.rate
        });

    } catch (err) {
        
        // Handle Invalid/Inactive API Key
        if (err.response && err.response.status === 401) {
            return res.status(401).json({
                success: false,
                message: "Currency API key is invalid or not active."
            });
        }

        // Handle Rate limit
        if (err.response && err.response.status === 429) {
            return res.status(429).json({
                success: false,
                message: "Currency API rate limit exceeded. Please try again later."
            });
        }

        // Handle Invalid Parameters
        if (err.response && err.response.status === 400) {
            return res.status(400).json({
                success: false,
                message: "Invalid currency request. Please check base, to, and amount."
            });
        }

        // Handle Network/Unknown Error
        res.status(500).json({
            success: false,
            message: "Could not connect to currency service."
        });

    }

};