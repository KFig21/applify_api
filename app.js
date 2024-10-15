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

// cors middleware
const corsOptions = {
  origin: "https://kfig21.github.io/",
  credentials: true, // This is optional, only needed if you are using cookies or HTTP authentication
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Use this before your routes
app.options("*", cors(corsOptions)); // This will handle preflight requests

// mongoDB setup
const mongoDB = process.env.DB_CONNECTION_STRING;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// import routes
const authRouter = require("./routes/auth");
const boardsRouter = require("./routes/boards");
const jobsRouter = require("./routes/jobs");
const utilsRouter = require("./routes/utils");

// use routes
app.use("/api/auth", authRouter);
app.use("/api/boards", boardsRouter);
app.use("/api/jobs", jobsRouter);
// app.use("/api/utils", utilsRouter);

// view engine setup needed to keep from erroring out - ignore
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
