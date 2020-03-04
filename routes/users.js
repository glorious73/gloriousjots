/*-------- This file is for handling the routes for authentication --------*/
// Routes for users + mongoose
const express  = require('express');
const mongoose = require('mongoose'); // in order to bring in "user" schema
const bcrypt   = require('bcryptjs'); // in order to encrypt password
const passport = require('passport'); // registration and login module
const router   = express.Router();

// Load user model (js file representing data model)
require('../models/User');
const User = mongoose.model('users');

/*---------------------------- All routes for users --------------------------*/
// User login route
router.get('/login', function(request, response) {
  response.render('users/login', {
    loginActive: true
  });
});

// Login Form (POST request)
router.post('/login', function(req, res, next) {
  // Authenticate the user from the local DB using passport
  passport.authenticate('local', {
    successRedirect: '/ideas',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next); // immediately fire off
});

// User register route
router.get('/register', function(request, response) {
  response.render('users/register', {
    registerActive: true
  });
});

// Register Form (POST request)
router.post('/register', function(request, response) {
  // Server-side validation
  let errors = [];
  // check confirm password
  if(request.body.password != request.body.password2) {
    errors.push({text: 'Passwords don\'t match.'});
  }
  // check length of password
  if(request.body.password.length < 6) {
    errors.push({text: 'Password must be at least 6 characters.'});
  }
  // Tell user about errors if they exist
  if (errors.length > 0 ) {
    response.render('users/register', {
      errors: errors,
      name: request.body.name,
      email: request.body.email,
      password: request.body.password,
      password2: request.body.password2
    });
  }
  // No errors
  else {
    // Check if user exists
    User.findOne({email: request.body.email})
     .then(function(user) {
       if(user) {
         request.flash('error_msg', "Email " + request.body.email + " already registered.");
         response.redirect('/users/login');
       } else {
         // User not registered --> Create a user object (from the User model)
         const newUser = new User ({
           name: request.body.name,
           email: request.body.email,
           password: request.body.password,
         });
         // Encrypt (hash) password with bcrypt and then save user in DB
         bcrypt.genSalt(10, function(err, salt) {
           bcrypt.hash(newUser.password, salt, function(err, hash) {
             if(err) {
               console.log("Error encrypting password: " + err);
               throw err;
             }
               // Make the user's password the hashed one.
               newUser.password = hash;
               // Save user in DB
               newUser.save()
               .then(function(user) {
                 request.flash('success_msg', 'Registered ' + newUser.name + ' successfully.');
                 response.redirect('/users/login');
               }).catch(function(error) {
                 // Tell user about error and keep the page the same
                 response.render('users/register', {
                   errors: error,
                   name: newUser.name,
                   email: newUser.email,
                   password: newUser.password,
                   password2: newUser.password
                 });
               })
           });
         });
       }
     });
  }
});

// Logout route
router.get('/logout', function(request, response) {
  // Simply call the logout function (from Passport)
  request.logout();
  // Message that user logged out successfully
  request.flash('success_msg', 'Logged out successfully');
  // Redirect to Login page
  response.redirect('/users/login');
})
/*------------------------------ Finally, export that router --------------------------*/
module.exports = router;
