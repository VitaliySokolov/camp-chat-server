require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const path = require('path');

const config = require('./config.js');
const routes = require('./routes');
mongoose.connect(config.mongoURL[app.settings.env]);

app.use(express.static(
  path.resolve(__dirname, '..', 'build')
));
app.use(cors());
app.use(bodyParser.json());
app.use(expressValidator());

app.use(morgan('tiny'));
app.use(routes);

module.exports = app
