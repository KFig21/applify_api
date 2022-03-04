require("dotenv");
const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const joi = require("joi");
const jwt = require("jsonwebtoken");

// Register
router.post("/register", async (req, res, next) => {
  const schema = joi.object({
    username: joi.string().min(6).max(14).required(),
    email: joi.string().min(6).max(200).required(),
    firstname: joi.string().min(1).max(20).required(),
    lastname: joi.string().min(1).max(20).required(),
    password: joi.string().min(6).max(200).required(),
  });
  // Extract the validation errors from a request.
  const { error } = schema.validate(req.body);
  if (!error) {
    try {
      // check if username is  already in use
      const isUserInDB = await User.find({ username: req.body.username });
      if (isUserInDB.length > 0) {
        return res.status(500).json("Username already in use");
      }
      // check if email is  already in use
      const isEmailInDB = await User.find({ email: req.body.email });
      if (isEmailInDB.length > 0) {
        return res.status(500).json("email already in use");
      }
      // hash password for db
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      // create new user
      const newUser = await new User({
        email: req.body.email,
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: hashedPassword,
        theme: "dark default",
        limit: 25,
        boards: [],
        quicklinks: [
          { name: "GitHub", value: "", type: "link", id: 0 },
          { name: "Portfolio", value: "", type: "link", id: 1 },
          { name: "LinkedIn", value: "", type: "link", id: 2 },
          { name: "Blog", value: "", type: "link", id: 3 },
          { name: "Twitter", value: "", type: "link", id: 4 },
          { name: "LeetCode", value: "", type: "link", id: 5 },
          { name: "Resume", value: "", type: "text", id: 6 },
          { name: "Cover Letter", value: "", type: "text", id: 7 },
          { name: "New", value: "", type: "link", id: 8 },
        ],
      });
      // save user and return response
      try {
        const user = await newUser.save();

        // jwt token
        const secretKey = process.env.SECRET_KEY;
        const token = jwt.sign(
          {
            _id: user._id,
            username: user.username,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            theme: user.theme,
            limit: user.limit,
            boards: user.boards,
            quicklinks: user.quicklinks,
          },
          secretKey
        );

        res.status(200).json(token);
      } catch (err) {
        res.status(500).json(err);
      }
    } catch (err) {
      return next(err);
    }
  } else {
    res.status(500).send(error.details[0].message);
  }
});

// Login
router.post("/login", async (req, res) => {
  const schema = joi.object({
    usermail: joi.string().min(6).max(200).required(),
    password: joi.string().min(6).max(200).required(),
  });
  // Extract the validation errors from a request.
  const { error } = schema.validate(req.body);

  if (!error) {
    try {
      // check if user used email or username to login
      const email = await User.findOne({ email: req.body.usermail })
        .collation({
          locale: "en",
          strength: 2,
        })
        .populate("boards");
      const username = await User.findOne({
        username: req.body.usermail,
      })
        .collation({ locale: "en", strength: 2 })
        .populate("boards");
      let user = "";
      // set the user variable to either the email or username found
      if (email) {
        user = email;
      }
      if (username) {
        user = username;
      }
      // send error if no valid user is found
      !user && res.status(404).json("user not found");
      // check password
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      // send error if password is incorrect
      if (!validPassword) {
        return res.status(400).json("wrong password");
      }

      // jwt token
      const secretKey = process.env.SECRET_KEY;
      const token = jwt.sign(
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          boards: user.boards,
          theme: user.theme,
          limit: user.limit,
          quicklinks: user.quicklinks,
        },
        secretKey
      );

      return res.status(200).json(token);
    } catch (err) {
      // return res.status(500).json(err);
    }
  } else {
    return res.status(500).send(error.details[0].message);
  }
});

// UPDATE limit
router.put("/limit", async (req, res, next) => {
  try {
    let user = await User.findById(req.body.user);
    // send error if no valid user is found
    !user && res.status(404).json("user not found");

    user.limit = req.body.limit;
    user = await user.save();

    // jwt token
    const secretKey = process.env.SECRET_KEY;
    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        boards: user.boards,
        theme: user.theme,
        limit: user.limit,
        quicklinks: user.quicklinks,
      },
      secretKey
    );

    return res.status(200).json(token);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// UPDATE quicklink
router.put("/quicklink", async (req, res, next) => {
  try {
    let user = await User.findById(req.body.user);
    // send error if no valid user is found
    !user && res.status(404).json("user not found");

    let linkId = req.body.linkId;
    let linkName = req.body.name;
    let linkType = req.body.type;
    let linkValue = req.body.value;

    for (let i = 0; i < user.quicklinks.length; i++) {
      if (linkId === i) {
        // set for return
        user.quicklinks[i].name = linkName;
        user.quicklinks[i].type = linkType;
        user.quicklinks[i].value = linkValue;
        // set for db
        await User.updateOne(
          { _id: user._id, "quicklinks.id": i },
          {
            $set: {
              "quicklinks.$.name": linkName,
              "quicklinks.$.type": linkType,
              "quicklinks.$.value": linkValue,
            },
          }
        );
      }
    }

    const updatedLinks = user.quicklinks;

    user = await user.save();

    // jwt token
    const secretKey = process.env.SECRET_KEY;
    const token = await jwt.sign(
      {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        boards: user.boards,
        theme: user.theme,
        limit: user.limit,
        quicklinks: updatedLinks,
      },
      secretKey
    );

    return res.status(200).json(token);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// GET quicklinks
router.get("/quicklinks/:id", async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);
    // send error if no valid user is found
    !user && res.status(404).json("user not found");
    let links = await user.quicklinks;

    return res.status(200).json(links);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// UPDATE theme
router.put("/theme", async (req, res, next) => {
  try {
    let user = await User.findById(req.body.user);
    // send error if no valid user is found
    !user && res.status(404).json("user not found");

    user.theme = req.body.theme;
    user = await user.save();

    // jwt token
    const secretKey = process.env.SECRET_KEY;
    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        boards: user.boards,
        theme: user.theme,
        limit: user.limit,
        quicklinks: user.quicklinks,
      },
      secretKey
    );

    return res.status(200).json(token);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
