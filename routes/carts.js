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
        db.collection("carts").findOne(query, (err, result) => {
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
    let carts = req.body.cart;

    let status = false;
    let httpStatus = 400;

    if (username === undefined || username === '' || typeof(username) !== 'string') {
      return res.status(httpStatus).json({status, message: 'Username is invalid'});
    }

    if (carts === undefined || carts === '' || typeof(carts) !== 'array') {
      return res.status(httpStatus).json({status, message: 'Name is invalid'});
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
              $set: {carts}
            }
            db.collection("carts").updateOne(query, newValues, (err, result) => {
              if (err) return cb(err);

              status = true;

              httpStatus = 200
              let message = "Success update carts"
              return cb(message)
            });
          } else {
            query = {
              username,
              carts
            };

            db.collection("carts").insertOne(query, (err, result) => {
              if (err) return cb(err);

              status = true;

              httpStatus = 200
              let message = "Success insert carts"
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