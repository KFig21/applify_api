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
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use((req, res, next) => {
  // Set the Access-Control-Allow-Origin to allow your front-end origin
  res.setHeader("Access-Control-Allow-Origin", "https://kfig21.github.io");
  
  // Specify the methods that are allowed
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  
  // Specify the headers that can be sent in the requests
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Allow credentials (e.g., cookies, authentication headers)
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // If the request is an OPTIONS request (preflight), respond with 200
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  // Proceed to the next middleware or route handler
  next();
});


app.use(cors(corsOptions))
app.options("*", cors(corsOptions)); // Handle preflight requests

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
