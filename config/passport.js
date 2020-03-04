/*---- This file has the strategies for authentication as per the documentation of passport ----*/
const LocalStrategy = require('passport-local').Strategy; // local passport strategy
const mongoose      = require('mongoose'); // in order to bring in "user" schema
const bcrypt        = require('bcryptjs'); // in order to encrypt/decrypt password

// Load the model for the user (User object representing MongoDB user)
require('../models/User');
const User = mongoose.model('users');

module.exports = function(passport) {
  // Here, define the local strategy for handling authentication
  passport.use(new LocalStrategy({usernameField: 'email'}, function(email, password, done) {
    // Use mongoose to determine whether we have the user or not
    User.findOne({
      email: email
    }).then(function(user) {
      if(!user) {
        return done(null, false, {message: 'User was not found. Please try again.'});
      }
      // If we reach this point, the user is registered
      // Now match the [encrypted] password to see if it's correct
      bcrypt.compare(password, user.password, function(err, isMatch) {
        // throw error if it exists
        if(err) throw err;
        if(isMatch) {
          return done(null, user); // Password matched --> return the user
        } else {
          return done(null, false, {message: 'Password incorrect. Please try again.'});
        }
      })
    })
  }));
  // Create a session for the user (see the footnotes of this for passport documentation)
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}

/*--------------- FOOTNOTES ---------------*/

/* 1- In a typical web application, the credentials used to authenticate a user will only be transmitted during the login request. If authentication succeeds, a session will be established and maintained via a cookie set in the user's browser.
Each subsequent request will not contain credentials, but rather the unique cookie that identifies the session. In order to support login sessions, Passport will serialize and deserialize user instances to and from the session.*/

/*------------- END FOOTNOTES -------------*/
