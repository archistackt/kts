import fs from 'fs';
import path from 'path';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import mongoose from 'mongoose';
import passport from 'passport';
import csrf from 'csurf';
import CustomStrategy from './util/passport/strategy-local';
import { logger } from './util/logger';

import api from './api';
import schema from './schema';
import webpack from 'webpack';
import webpackConfig from '../webpack.config';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import multer  from 'multer';

// determine environment type
const nodeEnv = process.env.NODE_ENV || 'development';

// app configuration
const config = require('./config');
const PORT = config.port;

// configure storage for photos
const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (!req.user || !req.user._id) {
      cb('User not found');
    } else {
      const userdir = path.join(__dirname, '../uploads', req.params.nameslug + '_img');
      fs.mkdir(userdir, function (err) { // returns with error if already exists
        cb(null, userdir);
      });
    }
  }
});
const upload = multer({ storage });

// initialize the express app
const app = express();

// postgresql connection
mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb.uri).then(() => {
  console.log('connected to mongoose');
}).catch((error) => {
  console.log(error);
  process.exit(1);
});

// passpost strategy
const LocalStrategy = require('passport-local').Strategy;

logger.initLogger(config);

const mongoStore = connectMongo(session);
const sessionConfig = {
  // according to https://github.com/expressjs/session#resave
  // see "How do I know if this is necessary for my store?"
  resave: true,
  saveUninitialized: true,
  secret: config.cryptoKey,
  store: new mongoStore({ url: config.mongodb.uri }),
  cookie: {}
};

if (nodeEnv === 'development') {
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, {
    // Dev middleware can't access config, so we provide publicPath
    publicPath: webpackConfig.output.publicPath,
    hot: true,
    historyApiFallback: true,
    // pretty colored output
    stats: { colors: true }
  }));

  app.use(webpackHotMiddleware(compiler, {
    log: console.log
  }));
}

let allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4000');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};
app.use(allowCrossDomain);
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/static', express.static(path.join(__dirname, '../uploads')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.cryptoKey));

if (nodeEnv === 'prod') {
  app.set('trust proxy', 1);
  // https://github.com/expressjs/session/issues/251
  sessionConfig.cookie.secure = false;
  logger.info('using secure cookies');
}

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(csrf({
  cookie: {
    signed: true
  },
  value(req) {
    const csrf = req.cookies._csrfToken;
    return csrf;
  }
}));

// response locals
app.use(function (req, res, next) {
  res.cookie('_csrfToken', req.csrfToken());
  res.locals.user = {};
  res.locals.user.defaultReturnUrl = '/';
  res.locals.user.username = req.user && req.user.username;
  next();
});

app.use(function (req, res, next) {
  GLOBAL.navigator = {
    userAgent: req.headers['user-agent']
  };
  next();
});

// global locals
app.locals.projectName = config.projectName;
app.locals.copyrightYear = new Date().getFullYear();
app.locals.copyrightName = config.companyName;
app.locals.cacheBreaker = 'br34k-01';

app.set('view engine', 'ejs');

let localStragety = new CustomStrategy();

// passport setup
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'passw'
}, localStragety.authenticate));

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (_id, done) {
  if (mongoose.Types.ObjectId.isValid(_id)) {
    mongoose.model('User').findById(_id, function (err, user) {
      if (err) {
        done(err, null);
      }
      if (user) {
        done(null, localStragety.filterUser(user.toJSON()));
      }
    });
  } else {
    done('Invalid authentication request', null);
  }
});

// server side resources
api(app, upload);

// app-wide stuff
app.config = config;

const server = http.createServer(app);

server.listen(PORT);
server.on('listening', () => {
  logger.instance.info('Listening on', PORT);
});
