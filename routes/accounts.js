const express = require('express');
const router = express.Router();
const async = require('async');
const MongoPool = require('../models/mongoPool');
const dbName = process.env.DB_NAME;
const md5 = require('md5');

const salt = "faij21irjw";

router.route("/login")
  .post((req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    let status = false;
    let httpStatus = 400;

    if (username === undefined || username === '' || typeof(username) !== 'string') {
      return res.status(httpStatus).json({status, message: 'Username is invalid'});
    }

    if (password === undefined || password === '' || typeof(password) !== 'string') {
      return res.status(httpStatus).json({status, message: 'Password is invalid'});
    }

    async.waterfall([
      (cb) => { 
        MongoPool.getInstance((conn) => { 
          let db = conn.db(dbName);
          cb(null, db); 
        }) 
      },
      (db, cb) => {
        const hashedPassword = md5(salt + password);
        let query = {
          username,
          password: hashedPassword
        }
        console.log(hashedPassword)
        db.collection("accounts").findOne(query, (err, result) => {
          if (err) return cb(err);

          status = true;

          if (result == undefined) {
            httpStatus = 400
            let message = "Username or password invalid"
            return cb(message)
          }

          console.log(result.data)

          httpStatus = 200
          let message = "Success"
          let data = {username: username}
          return cb(message, data)
        })
      }
    ], (message, data) => {
      res.status(httpStatus).json({status, message, data});
    })
  });

router.route("/register")
  .post((req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    let status = false;
    let httpStatus = 400;

    if (username === undefined || username === '' || typeof(username) !== 'string') {
      return res.status(httpStatus).json({status, message: 'Username is invalid'});
    }

    if (password === undefined || password === '' || typeof(password) !== 'string') {
      return res.status(httpStatus).json({status, message: 'Password is invalid'});
    }

    async.waterfall([
      (cb) => { 
        MongoPool.getInstance((conn) => { 
          let db = conn.db(dbName);
          cb(null, db); 
        }) 
      },
      (db, cb) => {
        let query = {
          username
        }
        db.collection("accounts").findOne(query, (err, result) => {
          if (err) return cb(err);

          status = true;

          if (result != undefined) {
            let message = "Username is registered"
            return cb(message)
          }

          const hashedPassword = md5(salt + password)
          let query = {
            username,
            password: hashedPassword
          }
          db.collection("accounts").insertOne(query, (err, result) => {
            if (err) return cb(err);
            
            httpStatus = 200
            let message = "Register successfull"
            let data = {username}
            return cb(message, data)
          });
        })
      }
    ], (message, data) => {
      res.status(httpStatus).json({status, message, data});
    })
  });

module.exports = router;