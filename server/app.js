require('dotenv').config();
const
    express = require('express'),
    app = express(),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    expressValidator = require('express-validator'),
    mongoose = require('mongoose'),
    path = require('path'),
    compression = require('compression'),
    config = require('./config.js'),
    routes = require('./routes');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoURL[app.settings.env]);

app.use(compression());
app.use(express.static(
    path.resolve(__dirname, '..', 'build')
));
app.use(cors());
app.use(bodyParser.json());
app.use(expressValidator());

app.use(morgan('tiny'));
app.use(routes);

module.exports = app;
