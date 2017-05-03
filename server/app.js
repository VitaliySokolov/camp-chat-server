const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

const config = require('./config.js');
const routes = require('./routes');

mongoose.connect(config.mongoURL[app.settings.env]);

app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(routes);

module.exports = app
