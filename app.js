var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

const { sequelize } = require('./models');


(async ()=> {
        await sequelize.authenticate().then(()=> console.log('Connection success'))
        await sequelize.sync();
    }
)()

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const error = new Error('We could not find the page your looking for')
  error.status = 404;
  next(error);
});

// error handler
app.use(function(err, req, res, next) {
  if(err.status === 404){
    return  res.render('page-not-found', {error: err});
  }
  // render the global error page
  err.status = 500;
  err.message = "Something went wrong with the server"

  console.log(err.message + '-' + err.status);
  console.log(err.stack)
  res.render('error', {error: err});
});

app.listen(4000)

module.exports = app;
