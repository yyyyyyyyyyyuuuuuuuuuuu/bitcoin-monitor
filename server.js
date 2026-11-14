
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const BINANCE = "https://data-api.binance.vision/api/v3";

app.get("/", (req, res) => {
  res.json({
    status: "ONLINE",
    message: "Bitcoin Monitor Server Running"
  });
});

// LIVE BITCOIN PRICE
app.get("/api/price", async (req, res) => {
  try {
    const response = await fetch(
      `${BINANCE}/ticker/price?symbol=BTCUSDT`
    );

    if (!response.ok) {
      throw new Error("Binance price request failed");
    }

    const data = await response.json();

    res.json({
      symbol: "BTCUSDT",
      price: Number(data.price),
      timestamp: Date.now()
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// BITCOIN CANDLE DATA
app.get("/api/candles", async (req, res) => {
  try {
    const allowed = ["1m", "5m", "15m"];
    const interval = req.query.interval || "1m";

    if (!allowed.includes(interval)) {
      return res.status(400).json({
        error: "Invalid interval"
      });
    }

    const response = await fetch(
      `${BINANCE}/klines?symbol=BTCUSDT&interval=${interval}&limit=100`
    );

    if (!response.ok) {
      throw new Error("Binance candle request failed");
    }

    const data = await response.json();

    // INCLUDE THE CURRENTLY FORMING CANDLE
    const candles = data.map(c => ({
      time: Number(c[0]),
      open: Number(c[1]),
      high: Number(c[2]),
      low: Number(c[3]),
      close: Number(c[4]),
      volume: Number(c[5]),
      closed: Number(c[6]) < Date.now()
    }));

    res.json({
      symbol: "BTCUSDT",
      interval,
      timestamp: Date.now(),
      candles
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Bitcoin server running on port ${PORT}`);
});
