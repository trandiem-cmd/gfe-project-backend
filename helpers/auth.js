const jwt = require('jsonwebtoken');


function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token" });
    }
    console.log("HEADER:", authHeader);
    const token = authHeader.split(" ")[1];
    console.log("TOKEN:", token);
    console.log("SECRET:", process.env.JWT_SECRET_KEY);

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("DECODED:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message); 
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { auth };