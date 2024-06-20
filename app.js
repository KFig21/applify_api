require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const cors = require("cors");
const path = require("path");

// Import routes
const authRouter = require("./routes/auth");
const boardsRouter = require("./routes/boards");
const jobsRouter = require("./routes/jobs");
const utilsRouter = require("./routes/utils");

// MongoDB setup
const mongoDB = process.env.DB_CONNECTION_STRING;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// CORS middleware
const corsOptions = {
  origin: 'https://kfig21.github.io', // Update with your frontend URL
  credentials: true,
  optionSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options("*", cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// Use routes
app.use("/api/auth", authRouter);
app.use("/api/boards", boardsRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/utils", utilsRouter);

// View engine setup (if applicable)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error"); // Ensure this view exists or modify accordingly
});

// Start server (if not using Heroku to set port)
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}!`);
// });

module.exports = app;
