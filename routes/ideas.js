/*-------- This file is for handling the routes for ideas --------*/
// Routes for ideas + mongoose
const express               = require('express');
const mongoose              = require('mongoose'); // in order to bring in "idea" schema
const router                = express.Router();
const {ensureAuthenticated} = require('../helpers/authenticate'); // used to protect routes

// Load idea model (js file representing data model)
require('../models/Idea');
const Idea = mongoose.model('ideas');

/*---------------------------- All routes for ideas --------------------------*/

// Ideas index page (ideas are listed here)
router.get('/', ensureAuthenticated, function(request, response) {
  // Fetch all ideas FOR THAT SPECIFIC USER and show them in ideasList page.
  Idea.find({user: request.user.id}).sort({date:'desc'}).then(function(ideas) {
    response.render('ideas/ideasList', {
      ideas: ideas,
      ideasActive: true
    });
  });
});

// Add Idea form route
router.get('/add', ensureAuthenticated, function(request, response) {
  response.render('ideas/add', {
    ideasActive: true
  });
});

// Edit Idea form route (id is MongoDB id for the object representing idea)
router.get('/edit/:id', ensureAuthenticated, function(request, response) {
  Idea.findOne({
    _id: request.params.id
  }).then(function(idea) {
    // Check if it's the same user (to allow editing)
    if(idea.user != request.user.id) {
      request.flash('error_msg', 'Not Authorized.');
      response.redirect('/ideas');
    } else {
      response.render('ideas/edit', {
        idea: idea,
        ideasActive: true
      });
    }
  });
});

// Process form and add an idea (responding to a POST request)
router.post('/', ensureAuthenticated, function(request, response) {
  // Server-side validation
  let errors =[];
  if(!request.body.title)
    errors.push({text: 'Please add a title'});
  if(!request.body.details)
    errors.push({text: 'Please add some details'});
  // If there are errors (error array is not empty)
  if(errors.length > 0) {
    response.render("ideas/add", {
      errors: errors,
      title: request.body.title,
      details: request.body.details,
      ideasActive: true
    });
  }
  else {
    // The form has no errors -> add new idea to db
    const newUser = {
      title: request.body.title,
      details: request.body.details,
      user: request.user.id
    }; // newUser object contains attributes for the idea to be saved in db.
    new Idea(newUser).save().then(function(idea) {
      request.flash('success_msg', 'Idea added');
      response.redirect('/ideas'); // after adding, redirect to ideas page (handle in app.get('/ideas')).
    });
  }
});

// Edit idea PUT request handling
router.put('/:id', ensureAuthenticated, function(request, response) {
  // Find the idea to be updated (returns a Promise})
  Idea.findOne({
    _id: request.params.id
  }).then(idea => {
    // new values
    idea.title   = request.body.title;
    idea.details = request.body.details;
    // save the MongoDB object with the new MongoDB object values (returns a Promise)
    idea.save().then(idea => {
      request.flash('success_msg', 'Idea edited');
      response.redirect('/ideas') // MIGHT CHANGE
    });
  });
});

// Delete ideas request
router.delete('/:id', ensureAuthenticated, function(request, response) {
    Idea.remove({_id: request.params.id}).then(() => {
      request.flash('success_msg', 'Idea removed');
      response.redirect('/ideas');
  });
});

/*------------------------------ Finally, export that router --------------------------*/
module.exports = router;
