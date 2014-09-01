var express = require('express')
    , mongoose = require('mongoose')
    , Campaign = require('./lib/workshops')
    ;
    
/**
 * Parse command line arguments.
 *
 * -port -p
 *   Allows the caller to set the port that this app should run on.
 */
var listenForPort = false;
var overridePort = false;
var defaultPort = 4722;

process.argv.forEach(function(val, idx, arr) {
  if (listenForPort) {
    listenForPort = false;
    overridePort = parseInt(val);
  }

  if (val === '-port' || val === '-p') {
    listenForPort = true;
  }
});
    
/**
 * Express Setup
 */
var app = express();

app.configure(function() {
  // Replaces express.bodyParser() - parses request body and populates request.body
  app.use(express.urlencoded());
  app.use(express.json());

  // Checks request.body for HTTP method override
  app.use(express.methodOverride());

  // Perform route lookup based on url and HTTP method
  app.use(app.router);

  // Show all errors in development
  app.use(express.errorHandler({dumpException: true, showStack: true}));
});


/**
 * Express Setup
 */
var app = express();

app.configure(function() {
  // Replaces express.bodyParser() - parses request body and populates request.body
  app.use(express.urlencoded());
  app.use(express.json());

  // Checks request.body for HTTP method override
  app.use(express.methodOverride());

  // Perform route lookup based on url and HTTP method
  app.use(app.router);

  // Show all errors in development
  app.use(express.errorHandler({dumpException: true, showStack: true}));
});

// Start server
var port = process.env.PP_MAP_API_PORT || 4733;
app.listen(port, function() {
  console.log('Playpoi Map API server listening on port %d in %s mode.', port, app.settings.env);
});

/**
 * Mongo setup and config.
 */
var mongoUri = 'mongodb://localhost/pp-map';
mongoose.connect(mongoUri);
mongoose.connection.on('error', function(err) {
  console.log('Unable to connect to the Mongo database (%s). Check to make sure the database is running.', mongoUri);
  process.exit();
});

var mapModel;
var mapCollectionName = 'playpoi-map-courses';
mongoose.connection.once('open', function() {

  // Map c schema
  var mapCourseSchema = new mongoose.Schema({
    course_id : {type: Number, index: true},
    updated : Date,
    type : Number,
    title : String,
    description : String,
    address : String,
    url : String,
    instructor : String,
    location: {
      type: {
        type: "String",
        required: true,
        enum: ['Point', 'LineString', 'Polygon'],
        default: 'Point'
      },
      coordinates: [Number]
    }
  });
  mapCourseSchema.index({
    'map_course_id' : Number,
    'loc' : '2dsphere'
  });
  mapCourseSchema.set('autoIndex', false);

  // Map model
  mapCourseModel = mongoose.model(mapCollectionName, mapCourseSchema);

  console.log("Connection to Mongo (%s) succeeded! Ready to go...\n\n", mongoUri);
});

/**
 * Routes
 */

/**
 * GET from /course
 */
app.get('/course', function(req, res) {
  if (req.query.course_id === undefined) {
    res.send(400, 'No course_id specified.');
    dslogger.error('GET /course request. No course_id specified.');
  }
  else {
    var course = new Course(mapCourseModel);
    user.get(req, res);
  }
});

/**
 * GET from /courses
 */
app.get('/courses', function(req, res) {
  var courses = new Courses(mapCourseModel);
  courses.get(req, res);
});

/**
 * POST to /course
 */
app.post('/course', function(req, res) {
  if (req.body.title === undefined || req.body.location === undefined) {
    res.send(400, 'No title and/or location specified.');
  }
  else {
    var course = new Course(mapCourseModel);
    course.post(req, res);
  }
});

/**
 * DELETE /course
 */
app.delete('/course', function(req, res) {
  if (req.query.course_id === undefined) {
    res.send(400, 'No course_id specified.');
    dslogger.error('DELETE /course request. No course_id specified.');
  }
  else {
    var course = new Course(mapCourseModel);
    course.delete(req, res);
  }
});