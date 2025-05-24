const getUserData = (req, res) => {
  // Assuming verifyToken middleware has run
  // req.user should be populated by verifyToken
  res.json({ 
    message: "This is protected data for logged-in users.",
    user: req.user // Send back user details from token
  });
};

module.exports = { getUserData };
