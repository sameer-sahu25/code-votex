
const mlAuth = (req, res, next) => {
  const key = req.headers["x-api-key"];
  if (!key || key !== process.env.ML_API_KEY) {
    return res.status(401).json({ error: "Unauthorized ML service" });
  }
  next();
};

module.exports = mlAuth;
