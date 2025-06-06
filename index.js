'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const expressHandlerbars = require('express-handlebars');
const { createStarList } = require('./controllers/handlebarsHelper');
const { createPagination } = require('express-handlebars-paginate');
const session = require('express-session');
const { RedisStore } = require('connect-redis');
const { createClient } = require('redis');
const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.connect().catch(console.error);
const passport = require('./controllers/passport');
const flash = require('connect-flash');

// cau hinh static folder
app.use(express.static(__dirname + '/public'));

// cau hinh su dung express-handlebars
app.engine(
  'hbs',
  expressHandlerbars.engine({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
    },
    helpers: {
      createStarList,
      createPagination,
    },
  }),
);
app.set('view engine', 'hbs');

// cau hinh doc du lieu post tu body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// cau hinh dung session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new RedisStore({ client: redisClient }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 20 * 60 * 1000, // 20 phut
    },
  }),
);

// cau hinh su dung passport
app.use(passport.initialize());
app.use(passport.session());

// cau hinh su dung connect-flash
app.use(flash());

// middleware khoi tao gio hang
app.use((req, res, next) => {
  let Cart = require('./controllers/cart');
  req.session.cart = new Cart(req.session.cart ? req.session.cart : {});
  res.locals.quantity = req.session.cart.quantity;
  res.locals.isLoggedIn = req.isAuthenticated();
  next();
});

// routes
app.use('/', require('./routes/indexRouter'));
app.use('/products', require('./routes/productsRouter'));
app.use('/users', require('./routes/authRouter'));
app.use('/users', require('./routes/usersRouter'));

app.use((req, res) => {
  res.status(404).render('error', { message: 'File not found!' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render('error', { message: 'Internal Server Error' });
});

// khoi dong web server
app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
