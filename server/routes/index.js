const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const marked = require('marked');

const config = require('../config.js');
const User = require('../models/user');
const Message = require('../models/message');

router.post('/login', (req, res) => {
  const handleLoginResponse = (err, user) => {
    if (!user || err) {
      res.status(401).json({ error: err });
    } else {
      const userObj = { id: user.id, username: user.username }
      const token = jwt.sign(userObj, config.jwt_secret, { noTimestamp: true });

      res.status(200).json({
        user: userObj,
        token,
        tokenType: 'Bearer'
      });
    }
  };

  if (!req.body.username || !req.body.password) {
    res.status(400)
      .json({
        error: 'Please specify login and pass!'
      })
  } else {
    User.authorize(
      req.body.username,
      req.body.password,
      handleLoginResponse
    );
  }
});

router.post('/signup', (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).json({
      status: 400,
      message: 'Please provide valid username and password.'
    })
  }
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  user.save((err, user) => {
    if (err) {
      let errorMsg = err.message
      if (err.code === 11000) {
        errorMsg = `User with username "${req.body.username}" already exist`;
      }
      res.status(404).send({ error: errorMsg });
    } else {
      res.status(201).send()
    }
  });
});

router.get('/users', (req, res) => {
  User.find().select({ 'id': 1, 'username': 1 }).then((users) => {
    res.send(users.map(user => ({
      id: user.id,
      username: user.username,
    })))
  });
});

router.get('/messages', (req, res) => {
  Message
    .find({})
    .populate('author', 'username')
    .select({ 'id': 1, 'text': 1, 'author': 1, 'sentAt': 1 })
    .then((msgs) => {
      const newMsgs = msgs.map(msg => ({
        id: msg.id,
        msg: msg.text,
        time: +msg.sentAt,
        user: {
          id: msg.author.id,
          username: msg.author.username,
        }
      }));
      res.send(newMsgs);
    });
})

router.get('/', (req, res, next) => {
  const readmePath = path.resolve(__dirname, '../../readme.md');
  fs.readFile(readmePath, 'utf8', (err, data) => {
    if (err) return next(err)

    res.send(marked(data.toString()))
  })
})

module.exports = router
