var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');




var indexRouter = require('./routes/index');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const cartRoutes = require('./routes/cart');
const taskRoutes = require('./routes/task');
const uploadRoutes = require('./routes/upload');
const employeeRoutes = require('./routes/employee');
const activityRoutes = require('./routes/activity');
const notificationRoutes = require('./routes/notification');



dotenv.config();


mongoose.connect(process.env.MONGO_URI, {

})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

var app = express();

app.use(cors()); 
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use('/', indexRouter);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/cart', cartRoutes);
app.use('/task', taskRoutes);
app.use('/upload', uploadRoutes);
app.use('/employee', employeeRoutes);
app.use('/activity', activityRoutes);
app.use('/notification', notificationRoutes);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
