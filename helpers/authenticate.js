/*----- This file has the function that ensures whether the user is authenticated or not -----*/
// Again: 'exports' makes the function visible to all other modules
module.exports = {
  ensureAuthenticated: function(request, response, next) {
    // isAuthenticated() checks whether the user is authenticated (function from passport)
    if(request.isAuthenticated()) {
      return next();
    }
    // If we reach this line, user is not authenticated
    request.flash('error_msg', 'Please Login or Register first.');
    // redirect to the login page (to let user authenticate)
    response.redirect('/users/login');
  }
}
