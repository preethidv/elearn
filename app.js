var createError = require('http-errors');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
//var flash = require('express-flash');
var mongo = require('mongodb');
var expressValidator = require('express-validator');
var LocalStrategy = require('passport-local'),Strategy;
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/elearn')
var db = mongoose.connection;
async = require('async');

var routes = require('./routes/index');
var users = require('./routes/users');
var classes = require('./routes/classes');
var students = require('./routes/students');
var instructors = require('./routes/instructors');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars',exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Express Session
app.use(session({
	secret : 'secret',
	saveUnitialized : true,
	resave: true
}));


app.use(passport.initialize());
app.use(passport.session());

//Express Validator
app.use(expressValidator({
	errorFormatter: function(param,msg,value) {
		var namespace = param.split('.')
		, root  = namespace.shift()
		, formParam = root;

		while(namespace.length){
			formParam += '[' +namespace.shift() +']';
		}
		return {
			param : formParam,
			msg : msg,
			value : value
		};
	}
}));

//Connect-Flash
app.use(flash());

//Makes the user object global in all views
app.get('*',function(req,res,next) {
	//put user into res.locals for easy access from templates

	// res.locals.user/res.locals.type are global variables. 
	// we will set the res.locals.user to req.user if user is logged in, else null
	res.locals.user = req.user || null;
	if (req.user){
		res.locals.type = req.user.type;
	}
	next();
});

//Global Vars
app.use(function(req,res,next){
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	//res.locals.messages = require('express-messages')(req,res);
	next();
});



app.use('/', routes);
app.use('/users', users);
app.use('/classes', classes);
app.use('/students', students);
app.use('/instructors', instructors);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
