require('dotenv').config({path: __dirname + '/.env'});

// library
const express = require('express');
const bodyParser = require('body-parser')
const busboy = require('connect-busboy');
const port = process.env.PORT || 3000;

// set up database
require("./models/mongoPool").initPool();
let mongoDB = require('./models/mongodb');
let mongoDBModel = new mongoDB();
mongoDBModel.setupDb();

// set up app
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(busboy());

// set up public assets
app.use(express.static(__dirname + '/public'));

// call routes
app.use(require('./routes'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`))