const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const marked = require('marked');

const config = require('../config.js');
const User = require('../models/user');

router.post('/login', (req, res) => {
  mongoConnected.then(db => {
    db
      .collection('users')
      .findOne(
      { 'username': req.body.username, 'password': req.body.password },
      { '_id': 0, 'password': 0, 'iat': 0 },
      (err, user) => {
        if (!user || err) {
          res.status(404).send()
        } else {
          const token = jwt.sign(user, config.jwt_secret, { noTimestamp: true })

          res.status(200).json({
            user,
            token,
            tokenType: 'Bearer'
          })
        }
      }
      )
  })
})

router.post('/signup', (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).json({
      status: 400,
      message: 'Please provide valid username and password.'
    })
  }

  mongoConnected.then(db => {
    db
      .collection('users')
      .insert(req.body, (err, user) => {
        if (err) res.status(404).send(err)
        res.status(201).send()
      })
  })
})

router.get('/users', (req, res) => {
  User.find().select({'_id': 1, 'username': 1}).then((users) => {
    console.log(users);
    res.send(users)
  });
  // mongoConnected.then(db => {
  //   db
  //     .collection('users').find({}, { password: 0 })
  //     .toArray((err, users) => {
  //       res.send(users)
  //     })
  // })
});

router.get('/messages', (req, res) => {
  mongoConnected.then(db => {
    let dbFindParams = {}
    if (req.query.from || req.query.to) dbFindParams.time = {}
    if (req.query.from) dbFindParams.time.$gte = +req.query.from
    if (req.query.to) dbFindParams.time.$lte = +req.query.to

    db
      .collection('messages').find(dbFindParams)
      .toArray((err, msgs) => {
        res.send(msgs)
      })
  })
})

router.get('/', (req, res, next) => {
  const readmePath = path.resolve(__dirname, '../../readme.md');
  fs.readFile(readmePath, 'utf8', (err, data) => {
    if (err) return next(err)

    res.send(marked(data.toString()))
  })
})

module.exports = router
