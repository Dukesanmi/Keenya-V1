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

exports.authenticateAdmin = function(req, res, next) {
  log(req.headers);
  // Check if there is an auth token,
  if (!req.headers.authorization) return res.status(403).json({message: 'Authorization header required'});
  const splitHeader = req.headers.authorization.split(' ');
  if (splitHeader[0] !== 'Bearer') return res.status(401).json({message: 'Authorization format is Bearer <token>'}); 
  const token = splitHeader[1];

  // Decode the token
  let decodedToken = decodeToken(token);
  if (!decodedToken) return res.status(401).json({message: 'Invalid authorization token. Please login with the correct information.'});
  req.user = decodedToken;
  next(); 
}