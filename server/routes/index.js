const express = require('express'),
    path = require('path'),
    jwt = require('jsonwebtoken');
// const fs = require('fs');
// const marked = require('marked');

const config = require('../config.js'),
    User = require('../models/user'),
    Message = require('../models/message');

const router = express.Router(), // eslint-disable-line new-cap
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    DB_DUPLICATE_KEY = 11000;

router.post('/login', (req, res) => {
    const handleLoginResponse = (err, user) => {
        if (!user || err)
            res.status(UNAUTHORIZED).json({ error: err });
        else {
            const userObj = { id: user.id, username: user.username },
                token = jwt.sign(userObj, config.jwtSectet, { noTimestamp: true });

            res.status(OK).json({
                user: userObj,
                token,
                tokenType: 'Bearer'
            });
        }
    };

    req.checkBody('username', 'Invalid username')
        .notEmpty()
        .matches(/^[a-z0-9_]+$/i);
    req.checkBody('password', 'Invalid password')
        .notEmpty()
        .isAscii();
    req.getValidationResult().then(result => {
        if (!result.isEmpty()) {
            res.status(BAD_REQUEST)
                .json({
                    error: 'Please specify login and pass!'
                });
            return;
        }
        User.authorize(
            req.body.username,
            req.body.password,
            handleLoginResponse
        );
    });
});

router.post('/signup', (req, res) => {
    req.checkBody('username', 'Invalid username')
        .notEmpty()
        .matches(/^[a-z0-9_]+$/i);
    req.checkBody('email', 'Invalid email')
        .optional()
        .isEmail();
    req.checkBody('password', 'Invalid password')
        .notEmpty()
        .isAscii();
    req.getValidationResult().then(result => {
        if (!result.isEmpty()) {
            res.status(BAD_REQUEST)
                .json({
                    error: 'Please provide valid username and password.'
                });
            return;
        }
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        if (req.body.email)
            user.email = req.body.email;
        user.save(err => {
            if (err) {
                let errorMsg = err.message;

                if (err.code === DB_DUPLICATE_KEY)
                    errorMsg = `User with username "${req.body.username}" already exist`;
                res.status(NOT_FOUND).json({ error: errorMsg });
            } else
                res.status(CREATED).send();
        });
    });
});

router.get('/users', (req, res) => {
    User.find().select({ 'id': 1, 'username': 1 }).then(users => {
        res.send(users.map(user => ({
            id: user.id,
            username: user.username
        })));
    });
});

router.get('/messages', (req, res) => {
    Message
        .find({})
        .populate('author', 'username')
        .select({ 'id': 1, 'text': 1, 'author': 1, 'sentAt': 1 })
        .then(msgs => {
            const newMsgs = msgs.map(msg => ({
                id: msg.id,
                msg: msg.text,
                time: +msg.sentAt,
                user: {
                    id: msg.author.id,
                    username: msg.author.username
                }
            }));

            res.send(newMsgs);
        });
});

router.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', '..', 'build', 'index.html'));
});

module.exports = router;
