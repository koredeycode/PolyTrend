import axios from 'axios';

const home = (req, res) => {
  res.json({ message: 'Hello from the polygon endpoint!' });
};

const status = (req, res) => {
  res.json({ status: 'ok' });
};

const polygon = async (req, res) => {
  const getTicker = (type, ticker) => {
    switch (type) {
      case 'crypto':
        return `X:${ticker}`;
      case 'forex':
        return `C:${ticker}`;
      case 'options':
        return `O:${ticker}`;
      default:
        return ticker;
    }
  };
  try {
    const { type, ticker, multiplier, timespan, from, to } = req.body;
    const apiKey = process.env.POLYGON_API_KEY; // Replace with your actual Polygon API key

    // Make request to Polygon API
    const response = await axios.get(
      `https://api.polygon.io/v2/aggs/ticker/${getTicker(
        type,
        ticker.toUpperCase(),
      )}/range/${multiplier}/${timespan}/${from}/${to}?apiKey=${apiKey}`,
    );

    // Extract and send the data from Polygon API response
    const responseData = response.data;
    if (responseData.resultsCount == 0)
      return res
        .status(404)
        .json({ message: `No data found for the ticker ${ticker}` });
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'An Error occured' });
  }
};

export { home, status, polygon };
