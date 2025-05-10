var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var transcribeRouter = require('./routes/transcribe');
var guestRouter = require('./routes/guest');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// === MOCK AUTH FOR DEVELOPMENT ===
// Remove or replace with real authentication in production
const mockAuth = require('./mockAuth');
app.use(mockAuth);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/transcribe', transcribeRouter);
app.use('/api', guestRouter);

module.exports = app;
