/*----- This is the main JavaScript file for the app (app.js) -----*/
// Bring in modules
const express        = require('express');
const exphbs         = require('express-handlebars');
const path           = require('path');
const mongoose       = require('mongoose');
const bodyParser     = require('body-parser');
const flash          = require('connect-flash');
const session        = require('express-session');
const methodOverride = require('method-override');
const passport       = require('passport');

const app = express(); // initialize the 'express' application

/* -------------------------- Passport configuration ------------------------- */
require('./config/passport')(passport);
/* --------------------------------------------------------------------------- */

/* ------------------------------- Load Routes ------------------------------- */
const ideasRoute = require('./routes/ideas');
const usersRoute = require('./routes/users');
/* --------------------------------------------------------------------------- */
// Map global promise (getting rid of a warning)
mongoose.Promise = global.Promise;
/* - Connect to mongoose (could be a local or a remote database)
   - For deployment, connect to a database somewhere else (in this case mlab)
   - mlab: https://mlab.com/
 */
const mongodbConnectionString = require('./config/database');
mongoose.connect(mongodbConnectionString.mongoUri, {
  useMongoClient: true // added to fix "database name must be a string" error
})
 .then(function() {
  console.log("MongoDB connected");
 })
 .catch(function(error) {
   console.log("Error connecting to MongoDB: " + error);
 });

/* handlebars middleware*/
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

/* Body parser middleware (we need it to access/process whatever was submitted to server)*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*Make the public folder the express's static folder (accessed directly by express)*/
app.use(express.static(path.join(__dirname, 'public')));

/* method-override middleware (we need to change the request method from the form)*/
// override with POST having ?_method=HTTPMETHOD
app.use(methodOverride('_method'));

/* Express session middleware (MUST BE BEFORE passport MIDDLEWARE) */
app.use(session({
  secret: 'gloriousKey',
  resave: true,
  saveUninitialized: true
}));

/* Passport middleware (MUST BE AFTER express MIDDLEWARE)*/
app.use(passport.initialize());
app.use(passport.session());

/* Connect flash middleware*/
app.use(flash());

/* Global variables */
app.use(function(request, response, next) {
  // Set global variables in middleware for all requests
  response.locals.success_msg = request.flash('success_msg');
  response.locals.error_msg   = request.flash('error_msg');
  response.locals.error       = request.flash('error');
  response.locals.user        = request.user || null; // determine if a user is logged in.
  next();
});

/* ------------------------------- App Routes ------------------------------- */
// Index route (we always have a request/response pair). They have context which we use for the logic of the app.
app.get('/', function(request, response) {
  const title = 'Welcome';
  response.render('index', {
    title: title,
    homeActive: true
  });
});

// About route
app.get('/about', function(request, response) {
  response.render('about', {
    aboutActive: true
  });
});

// Specific routes
app.use('/ideas', ideasRoute);
app.use('/users', usersRoute);
/* ------------------------------------------------------------------------------- */
// Set up listen for server (works for deployment as well)
const port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log(`Server started on port ${port}`);
});




/*NOTES:
    - When we edit something, we need to restart the server. 'nodemon' comes handy.
    - Middleware: https://expressjs.com/en/guide/using-middleware.html
    - You can set variables for request/response in the middleware functions.
    - response.send('INDEX'); // index route in '/'
    - response.send('About page'); // about route in '/about'
    // How middleware works (just to see) /
    // app.use(function(request, response, next) {
    //   console.log(Date.now());
    //   request.name = 'localhost request';
    //   next();
    // });

*/
