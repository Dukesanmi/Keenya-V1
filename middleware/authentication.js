const log = console.log;
const User = require("../models/User");
const { decodeToken } = require('../services/jwtService');

// Verify that a user is logged in
exports.verifyToken =  async (req, res, next) => {
  const token = req.cookies.jwt || "";
  try{
    if (!token) {
      //req.flash("error_msg", "You are not logged in");
      return res.redirect('/signin');
    }
    const decoded = await decodeToken(token)
    
    req.user = {
      id: decoded.id,
      email: decoded.email
    }
    next();
  } catch (err){
    return next(err);
  }
   
};

// Check and get logged in user's information
exports.checkUser = async(req, res, next)=> {
  const token = req.cookies.jwt || "";
  if (!token) {
    res.locals.user = null;
    return next();
  }
  else {
    const decodedToken = decodeToken(token);
    const user = await User.findById(decodedToken.id);
    res.locals.user = user;
    return next();
  }
  next();
}
