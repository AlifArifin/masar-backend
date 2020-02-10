const express = require('express');
const router = express.Router();
const async = require('async');
const MongoPool = require('../models/mongoPool');
const dbName = process.env.DB_NAME;

router.route("/")
  .get((req, res, next) => {
    let username = req.query.username;
    let status = false;
    let httpStatus = 400;

    if (username === undefined || username === '' || typeof(username) !== 'string') {
      return res.status(httpStatus).json({status, message: 'Username is invalid'});
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
        db.collection("profiles").findOne(query, (err, result) => {
          if (err) return cb(err);

          status = true;

          if (result == undefined) {
            httpStatus = 400
            let message = "Username invalid"
            return cb(message)
          }

          httpStatus = 200
          let message = "Success"
          return cb(message, result)
        })
      }
    ], (message, data) => {
      res.status(httpStatus).json({status, message, data});
    })
  });

router.route("/")
  .post((req, res, next) => {
    let username = req.body.username;
    let name = req.body.name;
    let address = req.body.address;
    let phone = req.body.phone;

    let status = false;
    let httpStatus = 400;

    if (username === undefined || username === '' || typeof(username) !== 'string') {
      return res.status(httpStatus).json({status, message: 'Username is invalid'});
    }

    if (name === undefined || name === '' || typeof(name) !== 'array') {
      return res.status(httpStatus).json({status, message: 'Name is invalid'});
    }

    if (address === undefined || address === '' || typeof(address) !== 'array') {
      return res.status(httpStatus).json({status, message: 'Address is invalid'});
    }

    if (phone === undefined || phone === '' || typeof(phone) !== 'string') {
      return res.status(httpStatus).json({status, message: 'Phone is invalid'});
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
        db.collection("profiles").findOne(query, (err, result) => {
          if (err) return cb(err);

          if (result != undefined) {
            query = {
              username
            };

            let newValues = {
              username,
              name,
              address,
              phone
            }
            db.collection("profiles").updateOne(query, newValues, (err, result) => {
              if (err) return cb(err);

              status = true;

              httpStatus = 200
              let message = "Success update profile"
              return cb(message)
            });
          } else {
            query = {
              username,
              name,
              address,
              phone
            };

            db.collection("profiles").insertOne(query, (err, result) => {
              if (err) return cb(err);

              status = true;

              httpStatus = 200
              let message = "Success insert profile"
              return cb(message)
            });
          }
        })
      }
    ], (message) => {
      res.status(httpStatus).json({status, message});
    })
  });

module.exports = router;