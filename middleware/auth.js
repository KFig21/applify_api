const jwt = require("jsonwebtoken");

// auth middleware section - https://www.youtube.com/watch?v=wwiwyFXQCHw&list=PL63c_Ws9ecIQkH5xD6JW4cf2VporjzSRW&index=14
const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("not authorized");
  try {
    const secretKey = process.env.SECRET_KEY;
    const payload = jwt.verify(token, secretKey);

    req.user = payload;

    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};

module.exports = auth;
