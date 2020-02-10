const express = require('express');
const router = express.Router();

router.use('/accounts', require("./accounts"));
router.use('/carts', require("./carts"));
router.use('/products', require("./products"));
router.use('/profiles', require("./profiles"));

module.exports = router;