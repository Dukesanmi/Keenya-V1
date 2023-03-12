const log = console.log;
const User = require("../models/User");
const { decodeToken } = require('../services/jwtService');
const secret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');

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

exports.checkUser = async(req, res, next)=> {
  const token = req.cookies.jwt || "";
  if (!token) {
    res.locals.user = null;
    //return res.redirect('/signin');
    return next();
  }
  else {
    const decodedToken = decodeToken(token);
    const user = await User.findById(decodedToken.id);
    res.locals.user = user;
    //log('E work!')
    //log(user);
    return next();
  }
  next();
}
