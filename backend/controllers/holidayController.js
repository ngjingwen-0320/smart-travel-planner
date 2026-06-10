const axios = require('axios');

exports.getHolidays = async (req, res) => {
  try {
    const { year, country } = req.params;

    const response = await axios.get(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`
    );

    res.status(200).json({
      success: true,
      holidays: response.data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch holidays",
      error: err.message
    });
  }
};