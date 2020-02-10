const express = require('express');
const router = express.Router();
const async = require('async');
const MongoPool = require('../models/mongoPool');
const dbName = process.env.DB_NAME;
const fs = require('fs-extra');

router.route("/search")
  .get((req, res, next) => {
    let q = req.query.q;
    let status = false;
    let httpStatus = 400;

    if (q === undefined || q === '' || typeof(q) !== 'string') {
      return res.status(httpStatus).json({status, message: 'Query is invalid'});
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
          name: {$regex: "/" + q + "/i"}
        }
        db.collection("products").find(query, (err, result) => {
          if (err) return cb(err);

          status = true;

          console.log(result)

          httpStatus = 200
          let message = "Success"
          return cb(message, result)
        })
      }
    ], (message, data) => {
      res.status(httpStatus).json({status, message, data});
    })
  });

router.route("/searchId")
  .get(function (req, res, _) {
    let id = req.query.id;
    let status = false;
    let httpStatus = 400;

    if (id === undefined || id === '' || typeof(id) !== 'string') {
      return res.status(httpStatus).json({status, message: 'Id is invalid'});
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
          _id = ObjectId(id)
        }
        db.collection("products").findOne(query, (err, result) => {
          if (err) return cb(err);

          status = true;

          if (result == undefined) {
            httpStatus = 400
            let message = "Id invalid"
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

router.route("/picture")
  .post(function (req, res, _) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('field', function (_, value) {
      const productId = value
      req.busboy.on('file', function (_, file, filename, _, mimetype) {
        const formatFile = mimetype.match(/\/.*/i)[0].replace('/','.');
        console.log("/products/picture -> uploading: " + productId + formatFile);
  
        // path where image will be uploaded
        fstream = fs.createWriteStream(__dirname + '/../public/img/products/' + productId + formatFile);
        file.pipe(fstream);
        fstream.on('close', function () {    
          const message = "Upload successfully"
          res.status(200).json({status: true, message});
        });
      });
    });
  });

module.exports = router;