'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const expressHandlerbars = require('express-handlebars');

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
  }),
);
app.set('view engine', 'hbs');

// routes
app.use('/', require('./routes/indexRouter'));

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
