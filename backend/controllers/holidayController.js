const axios = require("axios");

exports.getHolidays = async (req, res) => {
  try {
    const { year, country } = req.params;

    const response = await axios.get(
      `https://calendarific.com/api/v2/holidays`,
      {
        params: {
          api_key: process.env.CALENDARIFIC_API_KEY,
          country,
          year
        }
      }
    );

    res.json({
      success: true,
      holidays: response.data.response.holidays
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};