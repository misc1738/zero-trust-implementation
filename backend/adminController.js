const getAdminData = (req, res) => {
  // Assuming verifyToken and authorizeRoles middleware have run
  // req.user should be populated by verifyToken
  res.json({ 
    message: "Welcome Admin! This is protected admin data.",
    user: req.user // Optionally send back user details
  });
};

module.exports = { getAdminData };
