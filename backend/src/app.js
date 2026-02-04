const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// middleware to read JSON
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("E-Commerce backend is running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
